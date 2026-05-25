import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// slots: array of 3 product IDs (empty string = empty slot)
export async function PUT(req: NextRequest) {
  const { slots } = await req.json() as { slots: [string, string, string] }
  const db = getDb()

  db.prepare('UPDATE custom_products SET home_slot = NULL').run()
  for (let i = 0; i < 3; i++) {
    const id = slots[i]
    if (id) {
      db.prepare('UPDATE custom_products SET home_slot = ? WHERE id = ?').run(i + 1, id)
    }
  }
  return NextResponse.json({ ok: true })
}
