import { NextApiRequest, NextApiResponse } from 'next'
import { emailConfigured, sendNewsletterConfirmation } from '../../../lib/email'
import { siteUrl } from '../../../lib/siteUrl'

interface SubscribeData {
  email: string
  firstName?: string
  lastName?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const clean = (s: unknown, max = 100) =>
  typeof s === 'string' ? s.trim().slice(0, max) || undefined : undefined

// Newsletter signup. Sends a confirmation link; the address joins the Resend
// contact list only after it's clicked (see ./confirm.ts).
export default async function subscribeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = (req.body || {}) as SubscribeData
  const email = clean(body.email, 254)?.toLowerCase()

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required' })
  }

  if (!emailConfigured()) {
    return res
      .status(503)
      .json({ error: 'Signups are temporarily unavailable' })
  }

  try {
    await sendNewsletterConfirmation(
      {
        email,
        firstName: clean(body.firstName),
        lastName: clean(body.lastName),
      },
      siteUrl(req),
    )
    return res.status(201).json({
      message: 'Check your inbox to confirm your subscription.',
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return res
      .status(500)
      .json({ error: 'We couldn’t send the confirmation email' })
  }
}
