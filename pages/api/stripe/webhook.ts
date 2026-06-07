// Stripe webhook. On a completed one-time purchase, grants the buyer full
// course access (User.hasAccessToPaidCourses = true).
//
// Local testing:  stripe listen --forward-to localhost:3000/api/stripe/webhook
// (that prints the STRIPE_WEBHOOK_SECRET to put in .env)
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { stripe } from '../../../lib/stripe'

// Stripe signature verification needs the raw, unparsed body.
export const config = { api: { bodyParser: false } }

const prisma = new PrismaClient()

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
  let event
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

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as any
    const email = s.customer_email || s.client_reference_id || s.metadata?.email
    if (email) {
      const r = await prisma.user.updateMany({
        where: { email },
        data: { hasAccessToPaidCourses: true },
      })
      console.log(
        `Stripe: granted paid access to ${email} (${r.count} user row(s))`,
      )
    }
  }

  return res.status(200).json({ received: true })
}
