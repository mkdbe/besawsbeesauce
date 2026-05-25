'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const nav = [
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function sync() {
      const cart: { quantity: number }[] = JSON.parse(localStorage.getItem('cart') ?? '[]')
      setCartCount(cart.reduce((n, i) => n + i.quantity, 0))
    }
    sync()
    window.addEventListener('cart-updated', sync)
    return () => window.removeEventListener('cart-updated', sync)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-bold text-lg text-amber-900 tracking-tight">
            Besaw&apos;s Bee Sauce
          </span>
          <span className="text-xs text-amber-600 italic">It&apos;s honey though.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-amber-800 hover:text-amber-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" aria-label="Cart" className="relative text-amber-800 hover:text-amber-600 transition-colors">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-amber-800"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-amber-200 bg-amber-50 px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-amber-800 hover:text-amber-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
