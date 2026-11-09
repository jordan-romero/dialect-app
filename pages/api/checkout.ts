// Creates a Stripe Checkout Session for the one-time "full course" purchase
// and returns its URL for the client to redirect to.
//
// The buyer is identified to the webhook by their Auth0 id (metadata.auth0Id),
// never by email, so access can't land on a different account that happens to
// share the address. An optional `cohortId` (a student in a self-pay class) is
// recorded on the purchase for reporting only.
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { stripe } from '../../lib/stripe'
import { prisma } from '../../lib/prisma'
import { courseCheckoutParts } from '../../lib/pricing'
import { appOrigin } from '../../lib/cohorts'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }

  const session = await getSession(req, res)
  const sub = session?.user?.sub
  const email = session?.user?.email
  if (!sub || !email) return res.status(401).json({ message: 'Unauthorized' })

  const user = await prisma.user.findUnique({ where: { auth0Id: sub } })
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  if (user.hasAccessToPaidCourses) {
    return res.status(400).json({ message: 'You already own the course.' })
  }

  const parts = await courseCheckoutParts()
  if (!stripe || !parts) {
    return res.status(500).json({ message: 'Stripe is not configured yet.' })
  }

  // Only record a cohort the buyer actually belongs to.
  const rawCohort = Number(req.body?.cohortId)
  let cohortId: number | null = null
  if (Number.isInteger(rawCohort) && rawCohort > 0) {
    const m = await prisma.cohortMember.findUnique({
      where: { cohortId_userId: { cohortId: rawCohort, userId: user.id } },
    })
    if (m && !m.removedAt) cohortId = rawCohort
  }

  const origin = appOrigin(req)
  const returnPath =
    typeof req.body?.returnTo === 'string' && req.body.returnTo.startsWith('/')
      ? req.body.returnTo
      : '/dashboard'
  const sep = returnPath.includes('?') ? '&' : '?'

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment', // one-time, lifetime access
      line_items: [{ price: parts.price, quantity: 1 }],
      ...(parts.discounts ? { discounts: parts.discounts } : {}),
      customer_email: email,
      client_reference_id: String(user.id),
      metadata: {
        kind: 'course',
        auth0Id: sub,
        userId: String(user.id),
        ...(cohortId ? { cohortId: String(cohortId) } : {}),
      },
      success_url: `${origin}${returnPath}${sep}purchase=success`,
      cancel_url: `${origin}${returnPath}${sep}purchase=cancelled`,
    })
    return res.status(200).json({ url: checkout.url })
  } catch (e: any) {
    console.error('Stripe checkout error:', e?.message || e)
    return res.status(500).json({ message: 'Could not start checkout.' })
  }
}
