import { NextRequest, NextResponse } from 'next/server'
import { createBlogPost, getAllBlogPostsAdmin } from '@/lib/blog'

export async function GET() {
  return NextResponse.json(getAllBlogPostsAdmin())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { slug, title, date, excerpt, content, published } = body
  if (!slug || !title || !date || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  try {
    const id = createBlogPost({ slug, title, date, excerpt: excerpt ?? '', content, published: published ? 1 : 0 })
    return NextResponse.json({ id })
  } catch {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }
}
