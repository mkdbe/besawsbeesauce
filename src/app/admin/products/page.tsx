import AdminNav from '@/components/admin/AdminNav'
import NewProductForm from '@/components/admin/NewProductForm'
import { getCustomProducts } from '@/lib/products'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default function ProductsPage() {
  const custom = getCustomProducts()

  return (
    <>
      <AdminNav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">Products</h1>
        <NewProductForm />

        {custom.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-stone-700 mb-4">Added Products</h2>
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Photo</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {custom.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-amber-100">
                          {p.images[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full bg-stone-200" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-800">{p.name}</td>
                      <td className="px-4 py-3 text-stone-500">{p.category}</td>
                      <td className="px-4 py-3 text-stone-700">{formatPrice(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
