import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { decrementStock } from '@/lib/inventory'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      // Retrieve line items to decrement inventory per product
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })
      for (const item of lineItems.data) {
        // product_id is stored in price_data metadata if set, otherwise skip
        const productId = item.price?.metadata?.product_id
        if (productId && item.quantity) {
          decrementStock(productId, item.quantity)
        }
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
