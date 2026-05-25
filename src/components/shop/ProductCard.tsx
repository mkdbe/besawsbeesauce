import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface Props {
  product: Product
  stock?: number
}

export default function ProductCard({ product, stock }: Props) {
  const soldOut = stock === 0

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="relative aspect-square bg-amber-50">
        <Image
          src={product.images[0] ?? '/products/placeholder.jpg'}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 ${soldOut ? 'opacity-50' : 'group-hover:scale-105'}`}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white/90 text-stone-600 text-xs font-semibold px-3 py-1 rounded-full border border-stone-200">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-amber-900 text-sm leading-snug">{product.name}</h3>
        {!soldOut && <p className="text-amber-600 text-sm mt-1">{formatPrice(product.price)}</p>}
      </div>
    </Link>
  )
}
