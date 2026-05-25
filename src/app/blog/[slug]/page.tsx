import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/blog'
import { MDXRemote } from 'next-mdx-remote/rsc'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return { title: `${post.title} — Besaw's Bee Sauce` }
}

function isHtml(content: string) {
  return /^\s*</.test(content)
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <p className="text-sm text-amber-500 mb-2">{post.date}</p>
      <h1 className="font-serif text-4xl font-bold text-amber-900 mb-10">{post.title}</h1>
      {isHtml(post.content) ? (
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      ) : (
        <div className="blog-content">
          <MDXRemote source={post.content} />
        </div>
      )}
    </article>
  )
}
