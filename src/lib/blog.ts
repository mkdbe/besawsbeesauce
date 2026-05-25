import { getDb } from '@/lib/db'
import { BlogPost } from '@/types'

interface DbPost {
  id: number
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  published: number
  created_at: string
  updated_at: string
}

function toPost(row: DbPost): BlogPost & { id: number } {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt,
    content: row.content,
  }
}

export function getAllBlogPosts(): (BlogPost & { id: number })[] {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM blog_posts WHERE published = 1 ORDER BY date DESC')
    .all() as DbPost[]
  return rows.map(toPost)
}

export function getAllBlogPostsAdmin(): (BlogPost & { id: number; published: number })[] {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM blog_posts ORDER BY date DESC')
    .all() as DbPost[]
  return rows.map((r) => ({ ...toPost(r), published: r.published }))
}

export function getBlogPost(slug: string): (BlogPost & { id: number }) | null {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1')
    .get(slug) as DbPost | undefined
  return row ? toPost(row) : null
}

export function getBlogPostById(id: number): (BlogPost & { id: number; published: number }) | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id) as DbPost | undefined
  if (!row) return null
  return { ...toPost(row), published: row.published }
}

export function getBlogSlugs(): string[] {
  const db = getDb()
  const rows = db
    .prepare('SELECT slug FROM blog_posts WHERE published = 1')
    .all() as { slug: string }[]
  return rows.map((r) => r.slug)
}

export function createBlogPost(data: {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  published: number
}): number {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO blog_posts (slug, title, date, excerpt, content, published)
       VALUES (@slug, @title, @date, @excerpt, @content, @published)`
    )
    .run(data)
  return result.lastInsertRowid as number
}

export function updateBlogPost(
  id: number,
  data: {
    slug: string
    title: string
    date: string
    excerpt: string
    content: string
    published: number
  }
) {
  const db = getDb()
  db.prepare(
    `UPDATE blog_posts
     SET slug = @slug, title = @title, date = @date, excerpt = @excerpt,
         content = @content, published = @published,
         updated_at = datetime('now')
     WHERE id = @id`
  ).run({ ...data, id })
}

export function deleteBlogPost(id: number) {
  const db = getDb()
  db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id)
}
