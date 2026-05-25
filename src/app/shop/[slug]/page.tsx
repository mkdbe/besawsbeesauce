import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug, getAllProducts } from '@/lib/products'
import { getInventory, getAllInventory } from '@/lib/inventory'
import { formatPrice } from '@/lib/utils'
import AddToCartButton from '@/components/shop/AddToCartButton'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return {}
  return { title: `${product.name} — Besaw's Bee Sauce` }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const { price, stock } = getInventory(product.id)
  const livePrice = price || product.price

  const allInv = getAllInventory()
  const recommended = getAllProducts()
    .filter((p) => p.id !== product.id && (allInv[p.id]?.published ?? 1) !== 0)
    .sort((a, b) => (a.category === product.category ? -1 : 1) - (b.category === product.category ? -1 : 1))
    .slice(0, 4)

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-amber-100">
          <Image
            src={product.images[0] ?? '/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div>
          <p className="text-amber-600 text-sm font-medium uppercase tracking-wide mb-2">
            {product.category.replace('-', ' ')}
          </p>
          <h1 className="font-serif text-3xl font-bold text-amber-900 mb-3">
            {product.name}
          </h1>
          {stock > 0 && (
            <p className="text-2xl font-semibold text-amber-700 mb-6">
              {formatPrice(livePrice)}
            </p>
          )}
          <p className="text-amber-800 leading-relaxed mb-6">{product.description}</p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-lg mb-6">
            <span>🛒</span>
            <span>Local pick-up only</span>
          </div>
          {stock === 0 ? (
            <p className="text-red-500 font-medium">Out of stock</p>
          ) : (
            <>
              {stock <= 5 && (
                <p className="text-amber-600 text-sm font-medium mb-3">Only {stock} left</p>
              )}
              <AddToCartButton product={{ ...product, price: livePrice }} stock={stock} />
            </>
          )}
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="mt-20 border-t border-amber-100 pt-12">
          <h2 className="font-serif text-xl font-bold text-amber-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommended.map((rec) => {
              const recInv = allInv[rec.id]
              const recStock = recInv?.stock ?? 0
              const recPrice = recInv?.price || rec.price
              const soldOut = recStock === 0
              return (
                <Link
                  key={rec.id}
                  href={`/shop/${rec.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative aspect-square bg-amber-50">
                    <Image
                      src={rec.images[0] ?? '/products/placeholder.jpg'}
                      alt={rec.name}
                      fill
                      className={`object-cover transition-transform duration-300 ${soldOut ? 'opacity-50' : 'group-hover:scale-105'}`}
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    {soldOut && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-white/90 text-stone-500 text-xs font-semibold px-2 py-0.5 rounded-full border border-stone-200">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-amber-900 text-xs leading-snug">{rec.name}</p>
                    {!soldOut && (
                      <p className="text-amber-600 text-xs mt-0.5">{formatPrice(recPrice)}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
