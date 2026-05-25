import { NextRequest, NextResponse } from 'next/server'
import { getBlogPostById, updateBlogPost, deleteBlogPost } from '@/lib/blog'

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params
  const post = getBlogPostById(Number(id))
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const { slug, title, date, excerpt, content, published } = body
  if (!slug || !title || !date || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  updateBlogPost(Number(id), { slug, title, date, excerpt: excerpt ?? '', content, published: published ? 1 : 0 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params
  deleteBlogPost(Number(id))
  return NextResponse.json({ ok: true })
}
