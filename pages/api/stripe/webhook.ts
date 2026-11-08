// Stripe webhook. Every paid Checkout Session becomes one Purchase row (keyed
// on the session id, so Stripe's retries are no-ops), then:
//   - kind "course": the buyer (by Auth0 id) gets hasAccessToPaidCourses.
//   - kind "seats":  the cohort's seatCount is recalculated from its purchases.
// Refunds and lost disputes take access back (course) or remove seats in
// proportion to the amount refunded (seats). Students already in a cohort are
// never removed automatically when seats drop; the teacher dashboard shows the
// overage and the teacher decides.
//
// Events to enable on the endpoint: checkout.session.completed,
// checkout.session.async_payment_succeeded, charge.refunded,
// charge.dispute.created, charge.dispute.closed.
//
// Local testing:  stripe listen --forward-to localhost:3000/api/stripe/webhook
// (that prints the STRIPE_WEBHOOK_SECRET to put in .env)
import type { NextApiRequest, NextApiResponse } from 'next'
import type Stripe from 'stripe'
import { Prisma } from '@prisma/client'
import { stripe } from '../../../lib/stripe'
import { prisma } from '../../../lib/prisma'
import { recalcSeats } from '../../../lib/cohorts'

// Stripe signature verification needs the raw, unparsed body.
export const config = { api: { bodyParser: false } }

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send('Stripe is not configured yet.')
  }

  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event
  try {
    const raw = await readRawBody(req)
    event = stripe.webhooks.constructEvent(
      raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (e: any) {
    console.error('Webhook signature verification failed:', e?.message)
    return res.status(400).send(`Webhook Error: ${e?.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfill(event.data.object as Stripe.Checkout.Session)
        break
      case 'charge.refunded':
        await onRefund(event.data.object as Stripe.Charge)
        break
      case 'charge.dispute.created':
        await onDispute(event.data.object as Stripe.Dispute, 'created')
        break
      case 'charge.dispute.closed':
        await onDispute(event.data.object as Stripe.Dispute, 'closed')
        break
    }
  } catch (e: any) {
    // A 500 makes Stripe retry, which is what we want for transient DB errors.
    console.error(`Stripe webhook ${event.type} failed:`, e?.message || e)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }

  return res.status(200).json({ received: true })
}

const idOf = (x: string | { id: string } | null | undefined) =>
  typeof x === 'string' ? x : x?.id ?? null

async function fulfill(s: Stripe.Checkout.Session) {
  // `completed` also fires for delayed methods (bank debits) before the money
  // arrives; those finish with async_payment_succeeded.
  if (s.payment_status !== 'paid') {
    console.log(`Stripe: session ${s.id} not paid yet (${s.payment_status})`)
    return
  }
  const meta = s.metadata || {}
  const kind = meta.kind === 'seats' ? 'SEATS' : 'COURSE'

  // Buyer: by Auth0 id. Email is only a fallback for sessions created before
  // checkout started sending auth0Id.
  let buyer = meta.auth0Id
    ? await prisma.user.findUnique({ where: { auth0Id: meta.auth0Id } })
    : null
  if (!buyer && !meta.auth0Id) {
    const email = s.customer_email || meta.email
    if (email) buyer = await prisma.user.findUnique({ where: { email } })
  }

  let quantity = 1
  if (kind === 'SEATS') {
    const items = await stripe!.checkout.sessions.listLineItems(s.id, {
      limit: 10,
    })
    quantity = items.data.reduce((n, li) => n + (li.quantity || 0), 0)
  }
  const cohortId = meta.cohortId ? Number(meta.cohortId) : null
  const cohort =
    cohortId && Number.isInteger(cohortId)
      ? await prisma.cohort.findUnique({ where: { id: cohortId } })
      : null

  try {
    await prisma.purchase.create({
      data: {
        kind,
        quantity,
        amountTotal: s.amount_total ?? 0,
        currency: s.currency ?? 'usd',
        stripeSessionId: s.id,
        stripePaymentIntentId: idOf(s.payment_intent as any),
        status: 'PAID',
        userId: buyer?.id ?? null,
        cohortId: cohort?.id ?? null,
      },
    })
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      console.log(`Stripe: session ${s.id} already fulfilled`)
      return
    }
    throw e
  }

  if (kind === 'COURSE') {
    if (!buyer) {
      console.error(`Stripe: paid course session ${s.id} has no matching user`)
      return
    }
    await prisma.user.update({
      where: { id: buyer.id },
      data: { hasAccessToPaidCourses: true },
    })
    console.log(`Stripe: granted course access to user ${buyer.id}`)
  } else {
    if (!cohort) {
      console.error(`Stripe: paid seat session ${s.id} has no cohort`)
      return
    }
    const seats = await recalcSeats(cohort.id)
    console.log(`Stripe: cohort ${cohort.id} now has ${seats} seats`)
  }
}

async function onRefund(charge: Stripe.Charge) {
  const pi = idOf(charge.payment_intent as any)
  const purchase = pi
    ? await prisma.purchase.findUnique({ where: { stripePaymentIntentId: pi } })
    : null
  if (!purchase) {
    console.error(`Stripe: refund for unknown payment ${pi}`)
    return
  }
  const full = charge.refunded || charge.amount_refunded >= charge.amount
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      amountRefunded: charge.amount_refunded,
      ...(full ? { status: 'REFUNDED' } : {}),
    },
  })
  if (purchase.kind === 'COURSE' && full) await revokeCourseIfNoOtherPurchase(purchase.userId)
  if (purchase.kind === 'SEATS' && purchase.cohortId) await recalcSeats(purchase.cohortId)
}

async function onDispute(d: Stripe.Dispute, phase: 'created' | 'closed') {
  const pi = idOf(d.payment_intent as any)
  const purchase = pi
    ? await prisma.purchase.findUnique({ where: { stripePaymentIntentId: pi } })
    : null
  if (!purchase) {
    console.error(`Stripe: dispute for unknown payment ${pi}`)
    return
  }
  if (phase === 'created') {
    // Access stays while the dispute is open.
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'DISPUTED' },
    })
    console.warn(`Stripe: purchase ${purchase.id} disputed (${d.reason})`)
    return
  }
  if (d.status === 'won' || d.status === 'warning_closed') {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'PAID' },
    })
    return
  }
  if (d.status === 'lost') {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'REFUNDED', amountRefunded: purchase.amountTotal },
    })
    if (purchase.kind === 'COURSE') await revokeCourseIfNoOtherPurchase(purchase.userId)
    if (purchase.kind === 'SEATS' && purchase.cohortId) await recalcSeats(purchase.cohortId)
  }
}

async function revokeCourseIfNoOtherPurchase(userId: number | null) {
  if (!userId) return
  const other = await prisma.purchase.count({
    where: { userId, kind: 'COURSE', status: { in: ['PAID', 'DISPUTED'] } },
  })
  if (other > 0) return
  await prisma.user.update({
    where: { id: userId },
    data: { hasAccessToPaidCourses: false },
  })
  console.log(`Stripe: revoked course access for user ${userId}`)
}
