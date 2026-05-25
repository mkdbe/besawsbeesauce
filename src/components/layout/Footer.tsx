import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-amber-900 text-amber-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Image
            src="/logo.jpg"
            alt="Besaw's Bee Sauce"
            width={100}
            height={81}
            sizes="100px"
            className="rounded-lg mb-4"
          />
          <p className="text-sm text-amber-300 italic">It&apos;s honey though.</p>
          <p className="text-sm text-amber-400 mt-3">
            Small-batch honey and bee products from our family hives in Rochester, NY.
          </p>
        </div>

        <div>
          <p className="font-semibold text-amber-50 mb-3">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop?category=honey" className="text-amber-300 hover:text-amber-100 transition-colors">Honey</Link></li>
            <li><Link href="/shop?category=lip-balm" className="text-amber-300 hover:text-amber-100 transition-colors">Lip Balm</Link></li>
            <li><Link href="/shop?category=bath-bombs" className="text-amber-300 hover:text-amber-100 transition-colors">Bath Bombs</Link></li>
            <li><Link href="/shop?category=other" className="text-amber-300 hover:text-amber-100 transition-colors">Other Products</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-amber-50 mb-3">Info</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="text-amber-300 hover:text-amber-100 transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="text-amber-300 hover:text-amber-100 transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-amber-800 text-center py-4 text-xs text-amber-500">
        &copy; {new Date().getFullYear()} Besaw&apos;s Bee Sauce. All rights reserved.
      </div>
    </footer>
  )
}
