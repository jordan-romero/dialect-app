// POST /api/teach/cohorts/:id/checkout { quantity } — buy a seat package.
// The tier price is chosen from the quantity (see lib/pricing.ts). Quantity
// isn't adjustable on the Stripe page, since changing it could change the tier.
import { stripe } from '../../../../../lib/stripe'
import { withPermission } from '../../../../../lib/rbac'
import {
  appOrigin,
  cohortIsOpen,
  loadCohortFor,
} from '../../../../../lib/cohorts'
import {
  MAX_SEATS_PER_ORDER,
  priceIdForLookupKey,
  seatTierFor,
} from '../../../../../lib/pricing'

export default withPermission(
  'cohort:manage',
  async (req, res, { user, claims }) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).end()
    }
    const cohort = await loadCohortFor(user, Number(req.query.id))
    if (!cohort) return res.status(404).json({ error: 'Class not found' })
    if (cohort.paymentMode !== 'SEATS') {
      return res
        .status(400)
        .json({ error: 'Students in this class pay for themselves.' })
    }
    if (!cohortIsOpen(cohort))
      return res.status(400).json({ error: 'This class has ended.' })

    const quantity = Number(req.body?.quantity)
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_SEATS_PER_ORDER
    ) {
      return res
        .status(400)
        .json({ error: `Choose 1 to ${MAX_SEATS_PER_ORDER} seats.` })
    }
    const tier = seatTierFor(quantity)
    const price = await priceIdForLookupKey(tier.lookupKey)
    if (!stripe || !price)
      return res.status(500).json({ error: 'Seat pricing is not configured.' })

    const origin = appOrigin(req)
    const back = `${origin}/teach/cohorts/${cohort.id}`
    try {
      const checkout = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price, quantity }],
        customer_email: claims.email,
        client_reference_id: String(user.id),
        // Universities often need a receipt with their details on it.
        invoice_creation: { enabled: true },
        metadata: {
          kind: 'seats',
          cohortId: String(cohort.id),
          auth0Id: user.auth0Id,
          userId: String(user.id),
        },
        success_url: `${back}?seats=success`,
        cancel_url: `${back}?seats=cancelled`,
      })
      return res.status(200).json({ url: checkout.url })
    } catch (e: any) {
      console.error('Stripe seat checkout error:', e?.message || e)
      return res.status(500).json({ error: 'Could not start checkout.' })
    }
  },
)
