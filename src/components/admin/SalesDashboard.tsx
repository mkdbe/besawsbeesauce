'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import type { OrderWithItems } from '@/lib/orders'

interface Props {
  stats: { total: number; thisYear: number; thisMonth: number; orderCount: number }
  orders: OrderWithItems[]
  byProduct: { product_id: string; product_name: string; units: number; revenue: number }[]
  monthly: { month: string; revenue: number; orders: number }[]
}

type Tab = 'overview' | 'products' | 'orders'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function exportCSV(orders: OrderWithItems[]) {
  const rows = [['Date', 'Order ID', 'Customer', 'Email', 'Products', 'Total']]
  for (const o of orders) {
    rows.push([
      fmt(o.created_at),
      o.id,
      o.customer_name,
      o.customer_email,
      o.items.map(i => `${i.product_name} x${i.quantity}`).join('; '),
      (o.amount_total / 100).toFixed(2),
    ])
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function exportProductCSV(byProduct: Props['byProduct']) {
  const rows = [['Product', 'Units Sold', 'Revenue']]
  for (const p of byProduct) {
    rows.push([p.product_name, String(p.units), (p.revenue / 100).toFixed(2)])
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sales-by-product-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SalesDashboard({ stats, orders, byProduct, monthly }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-amber-500 text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`

  const maxMonthly = Math.max(...monthly.map(m => m.revenue), 1)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Sales</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('overview')} className={tabCls('overview')}>Overview</button>
          <button onClick={() => setTab('products')} className={tabCls('products')}>By Product</button>
          <button onClick={() => setTab('orders')} className={tabCls('orders')}>Orders</button>
        </div>
      </div>

      {/* KPI cards — always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'This Month', value: formatPrice(stats.thisMonth), accent: true },
          { label: 'This Year', value: formatPrice(stats.thisYear), accent: true },
          { label: 'All Time', value: formatPrice(stats.total), accent: false },
          { label: 'Total Orders', value: String(stats.orderCount), accent: false },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent ? 'text-amber-700' : 'text-stone-800'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-700 mb-6">Monthly Revenue</h2>
          {monthly.length === 0 ? (
            <p className="text-stone-400 text-sm italic">No sales recorded yet.</p>
          ) : (
            <div>
              <div className="flex items-end gap-2 h-40 mb-2">
                {monthly.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-stone-400 font-mono">{m.revenue > 0 ? formatPrice(m.revenue) : ''}</span>
                    <div
                      className="w-full rounded-t bg-amber-400 transition-all"
                      style={{ height: `${Math.max(2, Math.round((m.revenue / maxMonthly) * 120))}px`, opacity: m.revenue > 0 ? 1 : 0.2 }}
                      title={`${m.month}: ${formatPrice(m.revenue)} (${m.orders} orders)`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-2">
                {monthly.map((m) => (
                  <div key={m.month} className="flex-1 text-center">
                    <span className="text-xs text-stone-400">{m.month.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* By Product tab */}
      {tab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-700">Sales by Product</h2>
            <button
              onClick={() => exportProductCSV(byProduct)}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              Export CSV ↓
            </button>
          </div>
          {byProduct.length === 0 ? (
            <p className="text-stone-400 text-sm italic p-6">No sales recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-stone-600">Product</th>
                  <th className="text-right px-6 py-3 font-medium text-stone-600">Units Sold</th>
                  <th className="text-right px-6 py-3 font-medium text-stone-600">Revenue</th>
                  <th className="px-6 py-3 w-40" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {byProduct.map((p) => {
                  const maxRev = byProduct[0]?.revenue || 1
                  const pct = Math.round((p.revenue / maxRev) * 100)
                  return (
                    <tr key={p.product_id} className="hover:bg-stone-50">
                      <td className="px-6 py-3 font-medium text-stone-800">{p.product_name}</td>
                      <td className="px-6 py-3 text-right text-stone-600">{p.units}</td>
                      <td className="px-6 py-3 text-right font-semibold text-amber-700">{formatPrice(p.revenue)}</td>
                      <td className="px-6 py-3">
                        <div className="h-1.5 bg-stone-100 rounded-full">
                          <div className="h-1.5 bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-700">Order History</h2>
            <button
              onClick={() => exportCSV(orders)}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              Export CSV ↓
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="text-stone-400 text-sm italic p-6">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Items</th>
                    <th className="text-right px-4 py-3 font-medium text-stone-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{fmt(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-800">{o.customer_name || '—'}</p>
                        {o.customer_email && <p className="text-xs text-stone-400">{o.customer_email}</p>}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {o.items.map(i => `${i.product_name} ×${i.quantity}`).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-700 whitespace-nowrap">
                        {formatPrice(o.amount_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
