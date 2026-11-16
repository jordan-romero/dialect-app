import { createHmac, timingSafeEqual } from 'crypto'

// All app email goes through Resend (https://resend.com/docs/api-reference).
//
// Env:
//   RESEND_API_KEY                full-access key (contacts need more than a
//                                 send-only key)
//   RESEND_NEWSLETTER_SEGMENT_ID  optional: segment newsletter signups join
//   EMAIL_FROM                    default "Acting Accents <info@actingaccents.com>";
//                                 the domain must be verified in Resend
//   EMAIL_REPLY_TO                default info@actingaccents.com, so replies
//                                 land in the Private Email inbox
//   NEWSLETTER_SECRET             signs confirm links; falls back to AUTH0_SECRET

const RESEND_API = 'https://api.resend.com'
const DEFAULT_FROM = 'Acting Accents <info@actingaccents.com>'
const DEFAULT_REPLY_TO = 'info@actingaccents.com'

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY)

export class EmailError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message)
  }
}

async function resend<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new EmailError('RESEND_API_KEY is not set', 503, null)
  const response = await fetch(`${RESEND_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : null) || `Resend ${path} failed (${response.status})`
    throw new EmailError(message, response.status, data)
  }
  return data as T
}

export interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
}

export function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailInput) {
  return resend<{ id: string }>('/emails', {
    from: process.env.EMAIL_FROM || DEFAULT_FROM,
    reply_to: replyTo || process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO,
    to,
    subject,
    html,
    text,
  })
}

export interface NewsletterContact {
  email: string
  firstName?: string
  lastName?: string
}

/** Adds (or re-adds) a contact to the newsletter. Existing contacts are fine. */
export async function addNewsletterContact({
  email,
  firstName,
  lastName,
}: NewsletterContact) {
  const segment = process.env.RESEND_NEWSLETTER_SEGMENT_ID
  try {
    await resend('/contacts', {
      email,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      unsubscribed: false,
      segments: segment ? [{ id: segment }] : undefined,
    })
  } catch (error) {
    if (error instanceof EmailError && error.status === 409) return
    throw error
  }
}

// --- Double opt-in -----------------------------------------------------------
// Resend has no built-in confirmation flow, so signups get a signed link and
// only become contacts once they click it. Stops anyone subscribing someone
// else's address (Mailchimp's "pending" status did this before).

const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000

function confirmSecret() {
  const secret = process.env.NEWSLETTER_SECRET || process.env.AUTH0_SECRET
  if (!secret) throw new Error('NEWSLETTER_SECRET (or AUTH0_SECRET) is not set')
  return secret
}

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url')
const sign = (payload: string) =>
  createHmac('sha256', `newsletter-confirm:${confirmSecret()}`)
    .update(payload)
    .digest('base64url')

export function createConfirmToken(
  contact: NewsletterContact,
  now = Date.now(),
) {
  const payload = b64url(
    JSON.stringify({
      e: contact.email.trim().toLowerCase(),
      f: contact.firstName || undefined,
      l: contact.lastName || undefined,
      t: now,
    }),
  )
  return `${payload}.${sign(payload)}`
}

export function readConfirmToken(
  token: string,
  now = Date.now(),
): NewsletterContact | null {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof data.e !== 'string' || typeof data.t !== 'number') return null
    if (now - data.t > CONFIRM_TTL_MS) return null
    return { email: data.e, firstName: data.f, lastName: data.l }
  } catch {
    return null
  }
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export function sendNewsletterConfirmation(
  contact: NewsletterContact,
  baseUrl: string,
) {
  const link = `${baseUrl.replace(
    /\/$/,
    '',
  )}/api/subscribe/confirm?token=${encodeURIComponent(
    createConfirmToken(contact),
  )}`
  const hi = contact.firstName ? `Hi ${contact.firstName},` : 'Hi,'
  return sendEmail({
    to: contact.email,
    subject: 'Confirm your Acting Accents subscription',
    text: `${hi}\n\nConfirm you'd like news from Acting Accents:\n${link}\n\nIf you didn't sign up, ignore this email and you won't hear from us.`,
    html: `<p>${escapeHtml(hi)}</p>
<p>Confirm you'd like news from Acting Accents:</p>
<p><a href="${escapeHtml(
      link,
    )}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#723FC5;color:#fff;text-decoration:none;font-weight:600">Confirm subscription</a></p>
<p style="color:#666;font-size:13px">If you didn't sign up, ignore this email and you won't hear from us.</p>`,
  })
}
