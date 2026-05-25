import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/shop/ProductCard'
import { getHomeFeatured } from '@/lib/products'
import { getAllInventory } from '@/lib/inventory'
import { getContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const inv = getAllInventory()
  const featured = getHomeFeatured()
  const heroImage = getContent('hero_image')
  const heroEnabled = getContent('hero_image_enabled') !== '0'
  const hasImage = Boolean(heroImage) && heroEnabled

  return (
    <>
      {/* Hero */}
      <section className={`relative py-24 px-4 overflow-hidden ${!hasImage ? 'bg-gradient-to-br from-amber-100 to-amber-200' : ''}`}>
        {hasImage && (
          <>
            <picture>
              <source
                media="(max-width: 640px)"
                srcSet={heroImage.replace(/(\.[^.]+)$/, '-mobile$1')}
                type="image/webp"
              />
              <Image src={heroImage} alt="" fill className="object-cover" priority sizes="100vw" />
            </picture>
            <div className="absolute inset-0 bg-amber-950/60" />
          </>
        )}
        <div className="relative max-w-3xl mx-auto text-center">
          <p className={`text-sm font-medium uppercase tracking-widest mb-4 ${hasImage ? 'text-amber-300' : 'text-amber-600'}`}>
            Small-batch &bull; Family hives &bull; Rochester, NY
          </p>
          <h1 className={`font-serif text-5xl md:text-6xl font-bold leading-tight mb-6 ${hasImage ? 'text-white' : 'text-amber-900'}`}>
            Pure honey, straight from the hive.
          </h1>
          <p className={`text-lg max-w-xl mx-auto mb-10 ${hasImage ? 'text-amber-100' : 'text-amber-700'}`}>
            Raw, unfiltered honey and handcrafted bee products — made with care from our backyard hives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className={`border font-semibold px-8 py-3 rounded-xl transition-colors ${hasImage ? 'border-amber-300 text-amber-100 hover:bg-amber-800/50' : 'border-amber-400 text-amber-800 hover:bg-amber-100'}`}
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="font-serif text-3xl font-bold text-amber-900 mb-10 text-center">
          Our Products
        </h2>
        <div className={`gap-6 ${
          featured.length === 1
            ? 'grid grid-cols-1 max-w-sm mx-auto'
            : featured.length === 2
            ? 'grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
            : 'grid grid-cols-1 md:grid-cols-3'
        }`}>
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} stock={inv[product.id]?.stock} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="text-amber-700 hover:text-amber-900 font-semibold underline underline-offset-4 transition-colors"
          >
            View all products &rarr;
          </Link>
        </div>
      </section>

      {/* About teaser */}
      <section className="bg-amber-900 text-amber-50 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-6">Why we do it</h2>
          <p className="text-amber-200 text-lg leading-relaxed mb-8">
            We started keeping bees out of curiosity and ended up with a genuine passion — and a lot of honey.
            Every jar is harvested by hand from hives we tend ourselves. No additives. No shortcuts.
          </p>
          <Link
            href="/about"
            className="border border-amber-400 text-amber-100 hover:bg-amber-800 font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Read our story
          </Link>
        </div>
      </section>
    </>
  )
}
