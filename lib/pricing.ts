// Prices, looked up in Stripe by lookup key so no price ids live in env vars.
//
// Individual course: `course_full` ($360 list) with the `LAUNCH20` coupon
// (20% off) applied automatically while it exists in Stripe.
//
// Class seats: volume pricing. Every seat in an order gets the tier price for
// that order's size. Stripe can't tier one-time prices, so each tier is its
// own price. The amounts here are for display only; Checkout charges whatever
// the Stripe price says.
import type Stripe from 'stripe'
import { stripe } from './stripe'

export const COURSE_LOOKUP_KEY = 'course_full'
export const LAUNCH_COUPON_ID = 'LAUNCH20'

export type SeatTier = {
  minSeats: number
  lookupKey: string
  unitAmount: number // cents
  label: string
}

export const SEAT_TIERS: SeatTier[] = [
  { minSeats: 1, lookupKey: 'seat_tier_1', unitAmount: 15000, label: '1–24' },
  {
    minSeats: 25,
    lookupKey: 'seat_tier_25',
    unitAmount: 13500,
    label: '25–49',
  },
  { minSeats: 50, lookupKey: 'seat_tier_50', unitAmount: 12000, label: '50+' },
]

export const MAX_SEATS_PER_ORDER = 500

export function seatTierFor(quantity: number): SeatTier {
  let tier = SEAT_TIERS[0]
  for (const t of SEAT_TIERS) if (quantity >= t.minSeats) tier = t
  return tier
}

const priceCache = new Map<string, { id: string; at: number }>()
const CACHE_MS = 5 * 60 * 1000

export async function priceIdForLookupKey(key: string): Promise<string | null> {
  if (!stripe) return null
  const hit = priceCache.get(key)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.id
  const res = await stripe.prices.list({
    lookup_keys: [key],
    active: true,
    limit: 1,
  })
  const id = res.data[0]?.id ?? null
  if (id) priceCache.set(key, { id, at: Date.now() })
  return id
}

// Line item + discounts for the individual course checkout. Falls back to the
// legacy STRIPE_PRICE_ID when the lookup-keyed price doesn't exist (e.g. an
// environment whose Stripe account hasn't been set up with it yet).
export async function courseCheckoutParts(): Promise<{
  price: string
  discounts?: Stripe.Checkout.SessionCreateParams.Discount[]
} | null> {
  if (!stripe) return null
  const price =
    (await priceIdForLookupKey(COURSE_LOOKUP_KEY)) ||
    process.env.STRIPE_PRICE_ID ||
    null
  if (!price) return null
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined
  try {
    const coupon = await stripe.coupons.retrieve(LAUNCH_COUPON_ID)
    if (coupon.valid) discounts = [{ coupon: coupon.id }]
  } catch {
    // No launch coupon in this Stripe account: charge list price.
  }
  return { price, discounts }
}
