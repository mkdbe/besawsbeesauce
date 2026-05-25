'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Inventory', href: '/admin/inventory' },
  { label: 'Blog Posts', href: '/admin/blog' },
  { label: 'Content', href: '/admin/content' },
  { label: 'Sales', href: '/admin/sales' },
  { label: 'Analytics', href: '/admin/analytics' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <nav className="bg-amber-900 text-white px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="font-bold text-amber-200 text-sm leading-tight">{'Bee Sauce '}<br className="md:hidden" />{'Admin'}</span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`text-sm font-medium transition-colors ${
            pathname.startsWith(l.href) ? 'text-white' : 'text-amber-300 hover:text-white'
          }`}
        >
          {l.label}
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="ml-auto text-sm text-amber-300 hover:text-white transition-colors"
      >
        Sign Out
      </button>
    </nav>
  )
}
