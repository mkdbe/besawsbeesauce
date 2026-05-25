import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
  const { name, description, price, category, image } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const db = getDb()
  const id = `custom-${Date.now()}`
  let slug = slugify(name)

  // Ensure unique slug
  const existing = db.prepare('SELECT id FROM custom_products WHERE slug = ?').get(slug)
  if (existing) slug = `${slug}-${Date.now()}`

  db.prepare(`
    INSERT INTO custom_products (id, name, slug, description, price, category, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), slug, description ?? '', price ?? 0, category ?? 'other', image ?? '')

  // Seed inventory row so it shows up in inventory manager
  db.prepare(`
    INSERT OR IGNORE INTO product_inventory (product_id, stock, price, published)
    VALUES (?, 0, ?, 1)
  `).run(id, price ?? 0)

  return NextResponse.json({ id, slug })
}
