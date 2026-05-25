import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { Product } from '@/types'
import { getInventory } from '@/lib/inventory'
import { getProductById } from '@/lib/products'

interface CartEntry {
  productId: string
  quantity: number
  product: Product
}

export async function POST(req: NextRequest) {
  const { cart }: { cart: CartEntry[] } = await req.json()

  if (!cart || cart.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: cart.map((item) => {
      const catalogProduct = getProductById(item.productId)
      const { price } = getInventory(item.productId)
      return {
        price_data: {
          currency: 'usd',
          unit_amount: price || catalogProduct?.price || item.product.price,
          product_data: {
            name: item.product.name,
            images: item.product.images
              .filter((img) => img.startsWith('http'))
              .slice(0, 8),
            metadata: { product_id: item.productId },
          },
        },
        quantity: item.quantity,
      }
    }),
    success_url: `${siteUrl}/checkout?success=true`,
    cancel_url: `${siteUrl}/cart`,
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
  })

  return NextResponse.json({ url: session.url })
}
