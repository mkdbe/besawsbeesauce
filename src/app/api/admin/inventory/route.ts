import { NextRequest, NextResponse } from 'next/server'
import { getAllInventory, setInventory } from '@/lib/inventory'
import { getDb } from '@/lib/db'

export async function GET() {
  return NextResponse.json(getAllInventory())
}

export async function PUT(req: NextRequest) {
  const { productId, stock, price, published } = await req.json()
  if (!productId || typeof stock !== 'number' || typeof price !== 'number') {
    return NextResponse.json({ error: 'productId, stock, and price required' }, { status: 400 })
  }
  setInventory(productId, stock, price, published ?? 1)
  // Keep custom_products.price in sync so the shop listing shows the correct price
  getDb().prepare('UPDATE custom_products SET price = ? WHERE id = ?').run(price, productId)
  return NextResponse.json({ ok: true })
}
