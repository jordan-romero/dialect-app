// Teacher invites: seat packages sold by an admin (Scott, Krista).
//
//   1. An admin invites a teacher with N seats. Stripe emails an invoice to the
//      billing contact (often a university office, not the teacher).
//   2. The invoice is paid in Stripe, or an admin marks it paid (check, PO).
//      The teacher is then emailed an accept link.
//   3. The teacher signs in with the invited email and accepts. They become a
//      teacher and their class is created with the paid seats. Only now does
//      the class have a student join code.
import type { Prisma, TeacherInvite, User } from '@prisma/client'
import { prisma } from './prisma'
import { stripe } from './stripe'
import {
  formatJoinCode,
  generateInviteToken,
  isEmail,
  normalizeEmail,
  recalcSeats,
  uniqueJoinCode,
} from './cohorts'
import { MAX_SEATS_PER_ORDER, SEAT_TIERS } from './pricing'
import { emailConfigured, sendEmail } from './email'

export const INVOICE_DAYS_UNTIL_DUE = 30

export type TeacherInviteInput = {
  email: string
  teacherName?: string | null
  institution?: string | null
  className: string
  seats: number
  unitAmount: number // cents
  billingEmail?: string | null
  endsAt: string | Date
}

export class InviteError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message)
  }
}

export const acceptPath = (token: string) => `/teach/accept/${token}`

function clean(input: TeacherInviteInput) {
  const email = normalizeEmail(String(input.email || ''))
  const billingEmail = normalizeEmail(String(input.billingEmail || '')) || email
  const className = String(input.className || '').trim()
  const seats = Math.floor(Number(input.seats))
  const unitAmount = Math.round(Number(input.unitAmount))
  const endsAt = new Date(input.endsAt)
  if (!isEmail(email)) throw new InviteError('Enter the teacher’s email.')
  if (!isEmail(billingEmail))
    throw new InviteError('Enter a valid billing email.')
  if (!className) throw new InviteError('Give the class a name.')
  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS_PER_ORDER)
    throw new InviteError(`Seats must be between 1 and ${MAX_SEATS_PER_ORDER}.`)
  if (!Number.isInteger(unitAmount) || unitAmount < 100)
    throw new InviteError('Price per seat must be at least $1.')
  if (Number.isNaN(endsAt.getTime()) || endsAt <= new Date())
    throw new InviteError('The end date must be in the future.')
  return {
    email,
    billingEmail,
    className: className.slice(0, 120),
    teacherName:
      String(input.teacherName || '')
        .trim()
        .slice(0, 120) || null,
    institution:
      String(input.institution || '')
        .trim()
        .slice(0, 120) || null,
    seats,
    unitAmount,
    endsAt,
  }
}

// The Stripe product seat invoices are billed under: the one behind the
// seat tier prices, so invoices and checkout show up together in Stripe.
async function seatProductId(): Promise<string> {
  const res = await stripe!.prices.list({
    lookup_keys: [SEAT_TIERS[0].lookupKey],
    active: true,
    limit: 1,
  })
  const product = res.data[0]?.product
  const id = typeof product === 'string' ? product : product?.id
  if (id) return id
  const created = await stripe!.products.create({ name: 'Class seats' })
  return created.id
}

// Create the invite and send its Stripe invoice. The row is written first so
// the invoice metadata can point at it; if Stripe fails, the row is removed.
export async function createTeacherInvite(
  admin: User,
  raw: TeacherInviteInput,
): Promise<TeacherInvite> {
  if (!stripe) throw new InviteError('Stripe is not configured.', 503)
  const input = clean(raw)
  const invite = await prisma.teacherInvite.create({
    data: {
      ...input,
      token: generateInviteToken(),
      createdById: admin.id,
    },
  })
  try {
    const customer = await stripe.customers.create({
      email: input.billingEmail,
      name: input.institution || input.teacherName || input.email,
      metadata: { teacherEmail: input.email },
    })
    const meta = { kind: 'teacher_invite', teacherInviteId: String(invite.id) }
    const ends = input.endsAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const inv = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: INVOICE_DAYS_UNTIL_DUE,
      auto_advance: true,
      description: `Acting Accents course seats for ${input.className}${
        input.teacherName ? ` (${input.teacherName})` : ''
      }. Each seat gives one student full course access until ${ends}.`,
      metadata: meta,
    })
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: inv.id,
      quantity: input.seats,
      price_data: {
        currency: 'usd',
        product: await seatProductId(),
        unit_amount: input.unitAmount,
      },
      description: `Course seats: ${input.className}`,
      metadata: meta,
    })
    const finalized = await stripe.invoices.finalizeInvoice(inv.id!)
    await stripe.invoices.sendInvoice(inv.id!)
    return prisma.teacherInvite.update({
      where: { id: invite.id },
      data: {
        stripeCustomerId: customer.id,
        stripeInvoiceId: inv.id,
        invoiceUrl: finalized.hosted_invoice_url ?? null,
      },
    })
  } catch (e: any) {
    await prisma.teacherInvite.delete({ where: { id: invite.id } })
    console.error('createTeacherInvite: Stripe failed:', e?.message || e)
    throw new InviteError(
      `Stripe couldn’t create the invoice: ${e?.message || 'unknown error'}`,
      502,
    )
  }
}

// Card or bank payments on an invoice: the PaymentIntent, so refunds made in
// Stripe later find the seats they paid for.
async function invoicePaymentIntent(invoiceId: string): Promise<string | null> {
  try {
    const list = await stripe!.invoicePayments.list({
      invoice: invoiceId,
      limit: 5,
    })
    for (const p of list.data) {
      const pi = p.payment?.payment_intent
      if (pi) return typeof pi === 'string' ? pi : pi.id
    }
  } catch (e: any) {
    console.error('invoicePaymentIntent failed:', e?.message || e)
  }
  return null
}

// Paid: from the invoice.paid webhook, or an admin marking it paid. Safe to
// call twice (the second call finds it already PAID and does nothing).
export async function markInvitePaid(
  inviteId: number,
  opts: { manual: boolean; amountPaid?: number | null; baseUrl: string },
): Promise<TeacherInvite | null> {
  const invite = await prisma.teacherInvite.findUnique({
    where: { id: inviteId },
  })
  if (!invite || invite.status !== 'INVOICED') return null

  if (opts.manual && stripe && invite.stripeInvoiceId) {
    // Close the Stripe invoice too, so Stripe stops sending reminders. Its
    // invoice.paid webhook then finds the invite already PAID.
    try {
      await stripe.invoices.pay(invite.stripeInvoiceId, {
        paid_out_of_band: true,
      })
    } catch (e: any) {
      throw new InviteError(
        `Stripe couldn’t mark the invoice paid: ${e?.message || e}`,
        502,
      )
    }
  }
  const paymentIntentId =
    !opts.manual && stripe && invite.stripeInvoiceId
      ? await invoicePaymentIntent(invite.stripeInvoiceId)
      : null

  const r = await prisma.teacherInvite.updateMany({
    where: { id: invite.id, status: 'INVOICED' },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      paidManually: opts.manual,
      amountPaid: opts.amountPaid ?? invite.seats * invite.unitAmount,
      paymentIntentId,
    },
  })
  if (r.count === 0) return null
  const paid = await prisma.teacherInvite.findUniqueOrThrow({
    where: { id: invite.id },
  })
  await emailTeacherInvite(paid, opts.baseUrl)
  return paid
}

export async function voidInvite(inviteId: number): Promise<void> {
  const invite = await prisma.teacherInvite.findUnique({
    where: { id: inviteId },
  })
  if (!invite) throw new InviteError('Invite not found.', 404)
  if (invite.status !== 'INVOICED')
    throw new InviteError('Only unpaid invites can be cancelled.')
  if (stripe && invite.stripeInvoiceId) {
    try {
      await stripe.invoices.voidInvoice(invite.stripeInvoiceId)
    } catch (e: any) {
      throw new InviteError(
        `Stripe couldn’t void the invoice: ${e?.message || e}`,
        502,
      )
    }
  }
  await prisma.teacherInvite.update({
    where: { id: invite.id },
    data: { status: 'VOID' },
  })
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

// Email the teacher their accept link. Failures are recorded, not thrown: the
// admin page shows them and has a copy-link button as a fallback.
export async function emailTeacherInvite(
  invite: TeacherInvite,
  baseUrl: string,
): Promise<{ sent: boolean; error?: string }> {
  const link = `${baseUrl.replace(/\/$/, '')}${acceptPath(invite.token)}`
  if (!emailConfigured()) {
    const error = 'Email isn’t set up yet (no RESEND_API_KEY).'
    await prisma.teacherInvite.update({
      where: { id: invite.id },
      data: { emailError: error },
    })
    return { sent: false, error }
  }
  const hi = invite.teacherName ? `Hi ${invite.teacherName},` : 'Hi,'
  const what = `${invite.seats} student seat${
    invite.seats === 1 ? '' : 's'
  } for ${invite.className}`
  try {
    await sendEmail({
      to: invite.email,
      subject: `Your Acting Accents class is ready: ${invite.className}`,
      text: `${hi}\n\nYour class is set up with ${what}${
        invite.institution ? ` at ${invite.institution}` : ''
      }. Accept the invite to get your teacher dashboard and the code your students use to join:\n${link}\n\nSign in with this email address (${
        invite.email
      }).`,
      html: `<p>${esc(hi)}</p>
<p>Your class is set up with ${esc(what)}${
        invite.institution ? ` at ${esc(invite.institution)}` : ''
      }. Accept the invite to get your teacher dashboard and the code your students use to join.</p>
<p><a href="${esc(
        link,
      )}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#723FC5;color:#fff;text-decoration:none;font-weight:600">Accept and set up my class</a></p>
<p style="color:#666;font-size:13px">Sign in with this email address (${esc(
        invite.email,
      )}).</p>`,
    })
    await prisma.teacherInvite.update({
      where: { id: invite.id },
      data: { emailedAt: new Date(), emailError: null },
    })
    return { sent: true }
  } catch (e: any) {
    const error = String(e?.message || e).slice(0, 300)
    console.error('emailTeacherInvite failed:', error)
    await prisma.teacherInvite.update({
      where: { id: invite.id },
      data: { emailError: error },
    })
    return { sent: false, error }
  }
}

// What the accept page shows before sign-in.
export async function previewTeacherInvite(token: string) {
  const invite = await prisma.teacherInvite.findUnique({ where: { token } })
  if (!invite) return null
  return {
    email: invite.email,
    teacherName: invite.teacherName,
    institution: invite.institution,
    className: invite.className,
    seats: invite.seats,
    endsAt: invite.endsAt,
    status: invite.status,
    cohortId: invite.cohortId,
  }
}

export type AcceptResult =
  | { ok: true; cohortId: number; joinCode: string; alreadyAccepted: boolean }
  | { ok: false; status: number; message: string }

// Accept: the invited (verified) email becomes a teacher, and their class is
// created with the paid seats. Locks the invite row so a double click can't
// create two classes.
export async function acceptTeacherInvite(
  user: User,
  claims: Record<string, any>,
  token: string,
): Promise<AcceptResult> {
  const invite = await prisma.teacherInvite.findUnique({ where: { token } })
  if (!invite) return fail(404, 'This invite link is not valid.')
  if (invite.status === 'VOID') return fail(410, 'This invite was cancelled.')
  if (invite.status === 'INVOICED')
    return fail(
      402,
      'This class hasn’t been paid for yet. You’ll get an email as soon as it is.',
    )
  if (claims.email_verified !== true)
    return fail(
      403,
      'Verify your email address first, then open the invite link again.',
    )
  if (normalizeEmail(String(claims.email || '')) !== invite.email)
    return fail(
      403,
      `This invite was sent to ${invite.email}. Sign in with that address to accept it.`,
    )

  const joinCode = await uniqueJoinCode()
  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { status: string; cohortId: number | null }[]
    >`
      SELECT status::text AS status, "cohortId" FROM "TeacherInvite" WHERE id = ${invite.id} FOR UPDATE`
    const cur = rows[0]
    if (cur?.status === 'ACCEPTED' && cur.cohortId) {
      const c = await tx.cohort.findUniqueOrThrow({
        where: { id: cur.cohortId },
      })
      return { cohortId: c.id, joinCode: c.joinCode, alreadyAccepted: true }
    }
    if (cur?.status !== 'PAID')
      throw new InviteError('Invite is not paid.', 409)

    const cohort = await tx.cohort.create({
      data: {
        name: invite.className,
        institution: invite.institution,
        teacherId: user.id,
        paymentMode: 'SEATS',
        endsAt: invite.endsAt,
        startsAt: new Date(),
        joinCode,
      },
    })
    await tx.purchase.create({
      data: {
        kind: 'SEATS',
        status: 'PAID',
        quantity: invite.seats,
        amountTotal: invite.amountPaid ?? invite.seats * invite.unitAmount,
        currency: invite.currency,
        // Purchases are keyed on a Stripe id; invites use their invoice.
        stripeSessionId: invite.stripeInvoiceId
          ? `invoice:${invite.stripeInvoiceId}`
          : `teacher-invite:${invite.id}`,
        stripePaymentIntentId: invite.paymentIntentId,
        userId: user.id,
        cohortId: cohort.id,
      },
    })
    if (user.role === 'STUDENT') {
      await tx.user.update({
        where: { id: user.id },
        data: { role: 'TEACHER' },
      })
    }
    await tx.teacherInvite.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        acceptedBy: user.id,
        cohortId: cohort.id,
      },
    })
    return { cohortId: cohort.id, joinCode, alreadyAccepted: false }
  })
  if (!result.alreadyAccepted) await recalcSeats(result.cohortId)
  return { ok: true, ...result, joinCode: formatJoinCode(result.joinCode) }
}

function fail(status: number, message: string): AcceptResult {
  return { ok: false, status, message }
}

export type AdminInviteRow = ReturnType<typeof adminRow>

export function adminRow(
  i: TeacherInvite & {
    createdBy?: { email: string; firstName: string | null } | null
    cohort?: { id: number; joinCode: string } | null
  },
  baseUrl: string,
) {
  return {
    id: i.id,
    email: i.email,
    teacherName: i.teacherName,
    institution: i.institution,
    className: i.className,
    seats: i.seats,
    unitAmount: i.unitAmount,
    total: i.seats * i.unitAmount,
    billingEmail: i.billingEmail,
    endsAt: i.endsAt,
    status: i.status,
    invoiceUrl: i.invoiceUrl,
    paidAt: i.paidAt,
    paidManually: i.paidManually,
    emailedAt: i.emailedAt,
    emailError: i.emailError,
    acceptedAt: i.acceptedAt,
    cohortId: i.cohortId,
    joinCode: i.cohort ? formatJoinCode(i.cohort.joinCode) : null,
    // Only once paid: the link is what lets the teacher create the class.
    acceptUrl:
      i.status === 'PAID' || i.status === 'ACCEPTED'
        ? `${baseUrl.replace(/\/$/, '')}${acceptPath(i.token)}`
        : null,
    createdBy: i.createdBy?.firstName || i.createdBy?.email || null,
    createdAt: i.createdAt,
  }
}

export const adminInclude = {
  createdBy: { select: { email: true, firstName: true } },
  cohort: { select: { id: true, joinCode: true } },
} satisfies Prisma.TeacherInviteInclude
