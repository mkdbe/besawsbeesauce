'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Inventory', href: '/admin/inventory' },
  { label: 'Blog Posts', href: '/admin/blog' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <nav className="bg-amber-900 text-white px-6 py-3 flex items-center gap-6">
      <span className="font-bold text-amber-200 mr-4">Bee Sauce Admin</span>
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
