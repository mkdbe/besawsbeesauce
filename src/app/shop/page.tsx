import ProductCard from '@/components/shop/ProductCard'
import { getAllProducts } from '@/lib/products'
import { getAllInventory } from '@/lib/inventory'
import { ProductCategory } from '@/types'

export const dynamic = 'force-dynamic'

const categories: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Honey', value: 'honey' },
  { label: 'Lip Balm', value: 'lip-balm' },
  { label: 'Bath Bombs', value: 'bath-bombs' },
  { label: 'Soap', value: 'soap' },
  { label: 'Other', value: 'other' },
]

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams
  const inv = getAllInventory()
  const visible = getAllProducts().filter((p) => (inv[p.id]?.published ?? 1) !== 0)
  const filtered =
    category && category !== 'all'
      ? visible.filter((p) => p.category === category)
      : visible

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-amber-900 mb-4">Shop</h1>
      <p className="text-amber-700 mb-4">
        Honey and handcrafted bee products, made from our hives.
      </p>
      <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-2 rounded-lg mb-8">
        <span>🛒</span>
        <span>All orders are for local pick-up only.</span>
      </div>

      {/* Category filter */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm -mx-4 px-4 py-3 mb-8 border-b border-amber-100 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = (category ?? 'all') === cat.value
          return (
            <a
              key={cat.value}
              href={cat.value === 'all' ? '/shop' : `/shop?category=${cat.value}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'border-amber-300 text-amber-700 hover:border-amber-500 hover:text-amber-900'
              }`}
            >
              {cat.label}
            </a>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-amber-600">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} stock={inv[product.id]?.stock} />
          ))}
        </div>
      )}
    </div>
  )
}
