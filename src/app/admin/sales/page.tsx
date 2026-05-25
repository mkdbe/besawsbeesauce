import AdminNav from '@/components/admin/AdminNav'
import SalesDashboard from '@/components/admin/SalesDashboard'
import { getAllOrders, getSalesStats, getSalesByProduct, getMonthlySales } from '@/lib/orders'

export const dynamic = 'force-dynamic'

export default function SalesPage() {
  const stats = getSalesStats()
  const orders = getAllOrders()
  const byProduct = getSalesByProduct()
  const monthly = getMonthlySales(12)

  return (
    <>
      <AdminNav />
      <SalesDashboard stats={stats} orders={orders} byProduct={byProduct} monthly={monthly} />
    </>
  )
}
