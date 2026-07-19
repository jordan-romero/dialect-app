import Stripe from 'stripe'

// Server-side Stripe client. Null until STRIPE_SECRET_KEY is configured, so the
// app degrades gracefully (checkout/webhook return "not configured" instead of
// crashing) before keys are added.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null
