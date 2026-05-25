import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { decrementStock } from '@/lib/inventory'
import { saveOrder } from '@/lib/orders'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ['data.price.product'],
    })

    const items = lineItems.data.map((item) => {
      const product = item.price?.product as Stripe.Product | undefined
      // product_id stored in product_data.metadata
      const productId = product?.metadata?.product_id ?? ''
      const unitPrice = item.price?.unit_amount ?? 0
      const quantity = item.quantity ?? 1
      return {
        product_id: productId,
        product_name: product?.name ?? item.description ?? '',
        quantity,
        unit_price: unitPrice,
        amount: unitPrice * quantity,
      }
    })

    saveOrder({
      id: session.id,
      created_at: new Date(session.created * 1000).toISOString(),
      customer_email: session.customer_details?.email ?? '',
      customer_name: session.customer_details?.name ?? '',
      amount_total: session.amount_total ?? 0,
    }, items)

    for (const item of items) {
      if (item.product_id && item.quantity) {
        decrementStock(item.product_id, item.quantity)
      }
    }
  }

  return NextResponse.json({ received: true })
}
