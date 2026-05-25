'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'

interface CartEntry {
  productId: string
  quantity: number
  product: Product
}

export default function CartPage() {
  const [cart, setCart] = useState<CartEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') ?? '[]'))
  }, [])

  function updateQty(productId: string, qty: number) {
    const updated = qty <= 0
      ? cart.filter((i) => i.productId !== productId)
      : cart.map((i) => i.productId === productId ? { ...i, quantity: qty } : i)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  function removeItem(productId: string) {
    const updated = cart.filter((i) => i.productId !== productId)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-amber-900 mb-4">Your Cart</h1>
        <p className="text-amber-600">Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-amber-900 mb-8">Your Cart</h1>

      <div className="space-y-6 mb-8">
        {cart.map((item) => (
          <div key={item.productId} className="flex gap-4 items-center">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0">
              <Image
                src={item.product.images[0] ?? '/products/placeholder.jpg'}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">{item.product.name}</p>
              <p className="text-amber-600 text-sm">{formatPrice(item.product.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.productId, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors text-sm"
              >
                &minus;
              </button>
              <span className="w-6 text-center text-sm font-medium text-amber-900">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQty(item.productId, item.quantity + 1)}
                className="w-7 h-7 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors text-sm"
              >
                +
              </button>
            </div>
            <p className="text-sm font-semibold text-amber-800 w-16 text-right">
              {formatPrice(item.product.price * item.quantity)}
            </p>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-amber-300 hover:text-red-400 transition-colors ml-1"
              aria-label="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-amber-200 pt-6 flex justify-between items-center mb-6">
        <span className="font-semibold text-amber-900">Total</span>
        <span className="font-bold text-xl text-amber-900">{formatPrice(total)}</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Redirecting...' : 'Proceed to Checkout'}
      </button>
    </div>
  )
}
