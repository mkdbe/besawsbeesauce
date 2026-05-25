import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: "Our Story — Besaw's Bee Sauce",
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-serif text-4xl font-bold text-amber-900 mb-8">Our Story</h1>
      <div className="text-amber-800 leading-relaxed space-y-5">
        <p>
          <Image
            src="/logo.jpg"
            alt="Besaw's Bee Sauce"
            width={300}
            height={242}
            className="float-right ml-8 mb-4 rounded-xl shadow-md w-48 sm:w-64 md:w-72"
          />
          It started with curiosity. A couple of hives in the backyard, a lot of YouTube videos,
          and a willingness to get stung more than we probably should have. We&apos;re the Besaw family,
          and we&apos;ve been keeping bees in Rochester, NY since 2017.
        </p>
        <p>
          What began as a hobby quickly became something we cared deeply about. Watching a colony
          build, thrive, and survive a brutal upstate winter is one of the most rewarding things
          we&apos;ve experienced. And the honey — the honey is unlike anything you&apos;ll find at a grocery store.
        </p>
        <p>
          Every product we make starts in those hives. Our honey is raw and unfiltered, harvested
          by hand and never heated above hive temperature. Our lip balms and bath products are made
          in small batches using our own beeswax and honey — no synthetic fragrances, no shortcuts.
        </p>
        <p>
          We&apos;re not a factory. We&apos;re a family who loves bees, loves what they make, and wants to
          share it with people who care about where their food and products come from.
        </p>
        <p className="font-semibold text-amber-900 clear-both">
          Thank you for supporting our little operation. It means everything to us.
        </p>
        <p className="text-sm text-amber-600">— The Besaw Family</p>
        <p className="text-sm">
          <a
            href="https://www.facebook.com/itshoneythough"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium underline underline-offset-4 transition-colors"
          >
            Follow us on Facebook
          </a>
        </p>
      </div>
    </div>
  )
}
