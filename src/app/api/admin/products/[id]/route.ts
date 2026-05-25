import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, description, category, image } = await req.json()
  const db = getDb()
  db.prepare(`
    UPDATE custom_products SET name = ?, description = ?, category = ?, image = ? WHERE id = ?
  `).run(name ?? '', description ?? '', category ?? 'other', image ?? '', id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  db.prepare('DELETE FROM custom_products WHERE id = ?').run(id)
  db.prepare('DELETE FROM product_inventory WHERE product_id = ?').run(id)
  return NextResponse.json({ ok: true })
}
