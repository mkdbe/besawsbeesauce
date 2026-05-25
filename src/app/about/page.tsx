import type { Metadata } from 'next'
import Image from 'next/image'
import { getContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Our Story — Besaw's Bee Sauce",
}

export default function AboutPage() {
  const body = getContent('about_body')
  const paragraphs = body.split(/\n\n+/).filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-serif text-4xl font-bold text-amber-900 mb-8">Our Story</h1>
      <div className="text-amber-800 leading-relaxed space-y-5">
        {paragraphs.map((para, i) => (
          <p key={i} className={i === 0 ? '' : ''}>
            {i === 0 && (
              <Image
                src="/logo.jpg"
                alt="Besaw's Bee Sauce"
                width={300}
                height={242}
                sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 288px"
                className="float-right ml-8 mb-4 rounded-xl shadow-md w-48 sm:w-64 md:w-72"
              />
            )}
            {para}
          </p>
        ))}
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
