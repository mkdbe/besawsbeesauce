import AdminNav from '@/components/admin/AdminNav'
import { getAllBlogPostsAdmin } from '@/lib/blog'
import { getAllInventory } from '@/lib/inventory'
import { getAllProducts } from '@/lib/products'
import { getSalesStats } from '@/lib/orders'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const posts = getAllBlogPostsAdmin()
  const inv = getAllInventory()
  const allProducts = getAllProducts()
  const publishedPosts = posts.filter((p) => p.published).length
  const currentProducts = allProducts.filter((p) => (inv[p.id]?.published ?? 1) !== 0).length
  const sales = getSalesStats()

  return (
    <>
      <AdminNav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">Dashboard</h1>

        {/* Sales stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">This Month</p>
            <p className="text-3xl font-bold text-amber-700">{formatPrice(sales.thisMonth)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">This Year</p>
            <p className="text-3xl font-bold text-amber-700">{formatPrice(sales.thisYear)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-stone-800">{formatPrice(sales.total)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-stone-800">{sales.orderCount}</p>
          </div>
        </div>

        {/* Existing stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Active Products</p>
            <p className="text-3xl font-bold text-amber-700">{currentProducts}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-stone-800">{allProducts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Blog Posts</p>
            <p className="text-3xl font-bold text-stone-800">{posts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Published Posts</p>
            <p className="text-3xl font-bold text-amber-700">{publishedPosts}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-700">Inventory</h2>
              <Link href="/admin/inventory" className="text-sm text-amber-600 hover:text-amber-800">Manage →</Link>
            </div>
            <div className="space-y-2">
              {allProducts.map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-stone-600">{p.name}</span>
                  <span className={`font-semibold ${(inv[p.id]?.stock ?? 0) === 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {inv[p.id]?.stock ?? 0} left
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-700">Recent Posts</h2>
              <Link href="/admin/blog" className="text-sm text-amber-600 hover:text-amber-800">All posts →</Link>
            </div>
            <div className="space-y-2">
              {posts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <Link href={`/admin/blog/${p.id}`} className="text-stone-600 hover:text-stone-900 truncate max-w-[200px]">{p.title}</Link>
                  <span className={p.published ? 'text-green-600' : 'text-stone-400'}>{p.published ? 'Live' : 'Draft'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
