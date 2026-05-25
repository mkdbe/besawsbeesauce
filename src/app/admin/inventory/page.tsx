import AdminNav from '@/components/admin/AdminNav'
import InventoryManager from '@/components/admin/InventoryManager'
import { getAllInventory } from '@/lib/inventory'
import { getAllProducts, getHomeFeaturedSlots } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default function InventoryPage() {
  const inv = getAllInventory()
  const rows = getAllProducts().map((p) => ({
    ...p,
    stock: inv[p.id]?.stock ?? 0,
    dbPrice: inv[p.id]?.price ?? p.price,
    published: inv[p.id]?.published ?? 1,
  }))
  const featuredSlots = getHomeFeaturedSlots()

  return (
    <>
      <AdminNav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Inventory</h1>
        <p className="text-stone-500 text-sm mb-8">
          Set stock quantities. Sales via the website auto-decrement. You can also adjust manually here.
        </p>
        <InventoryManager products={rows} featuredSlots={featuredSlots} />
      </div>
    </>
  )
}
