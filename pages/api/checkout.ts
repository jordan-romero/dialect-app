// Creates a Stripe Checkout Session for the one-time "full course" purchase
// and returns its URL for the client to redirect to.
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { stripe } from '../../lib/stripe'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }

  const session = await getSession(req, res)
  const email = session?.user?.email
  if (!email) return res.status(401).json({ message: 'Unauthorized' })

  if (!stripe || !process.env.STRIPE_PRICE_ID) {
    return res.status(500).json({ message: 'Stripe is not configured yet.' })
  }

  const origin =
    req.headers.origin ||
    (req.headers.host ? `https://${req.headers.host}` : '')

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment', // one-time, lifetime access
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: email,
      client_reference_id: email,
      metadata: { email },
      success_url: `${origin}/dashboard?purchase=success`,
      cancel_url: `${origin}/dashboard?purchase=cancelled`,
    })
    return res.status(200).json({ url: checkout.url })
  } catch (e: any) {
    console.error('Stripe checkout error:', e?.message || e)
    return res.status(500).json({ message: 'Could not start checkout.' })
  }
}
