import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/blog'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Blog — Besaw's Bee Sauce",
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-amber-900 mb-4">From the Hive</h1>
      <p className="text-amber-600 mb-12">Stories, tips, and updates from our beekeeping journey.</p>

      {posts.length === 0 ? (
        <p className="text-amber-500 italic">No posts yet — check back soon.</p>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-amber-200 pb-10">
              <p className="text-sm text-amber-500 mb-2">{post.date}</p>
              <h2 className="font-serif text-2xl font-bold text-amber-900 mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-amber-700 transition-colors">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="text-amber-700 leading-relaxed mb-4">{post.excerpt}</p>
              )}
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-semibold text-amber-600 hover:text-amber-800 underline underline-offset-4 transition-colors"
              >
                Read more &rarr;
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
