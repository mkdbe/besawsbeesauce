'use client'

import { useState, useRef } from 'react'
import { Product } from '@/types'

export default function AddToCartButton({ product, stock }: { product: Product; stock?: number }) {
  const max = stock ?? 99
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function handleAddToCart() {
    const existing = JSON.parse(localStorage.getItem('cart') ?? '[]')
    const idx = existing.findIndex((i: { productId: string }) => i.productId === product.id)
    if (idx >= 0) {
      existing[idx].quantity += qty
    } else {
      existing.push({ productId: product.id, quantity: qty, product })
    }
    localStorage.setItem('cart', JSON.stringify(existing))
    window.dispatchEvent(new Event('cart-updated'))

    clearTimeout(toastTimer.current)
    setToast(true)
    toastTimer.current = setTimeout(() => setToast(false), 2500)
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-600 font-medium">Qty</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="w-8 h-8 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-100 disabled:opacity-40 transition-colors font-medium"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-amber-900">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              disabled={qty >= max}
              className="w-8 h-8 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-100 disabled:opacity-40 transition-colors font-medium"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          Add to Cart
        </button>
      </div>

      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-stone-800 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
        <span className="text-green-400">✓</span>
        <span>{qty > 1 ? `${qty}× ` : ''}{product.name} added to cart</span>
      </div>
    </>
  )
}
