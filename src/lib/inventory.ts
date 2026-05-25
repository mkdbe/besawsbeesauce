import { getDb } from '@/lib/db'

interface InventoryRow {
  product_id: string
  stock: number
  price: number
  published: number
}

export function getInventory(productId: string): { stock: number; price: number; published: number } {
  const db = getDb()
  const row = db
    .prepare('SELECT stock, price, published FROM product_inventory WHERE product_id = ?')
    .get(productId) as InventoryRow | undefined
  return { stock: row?.stock ?? 0, price: row?.price ?? 0, published: row?.published ?? 1 }
}

export function getStock(productId: string): number {
  return getInventory(productId).stock
}

export function getPrice(productId: string): number {
  return getInventory(productId).price
}

export function getAllInventory(): Record<string, { stock: number; price: number; published: number }> {
  const db = getDb()
  const rows = db
    .prepare('SELECT product_id, stock, price, published FROM product_inventory')
    .all() as InventoryRow[]
  return Object.fromEntries(rows.map((r) => [r.product_id, { stock: r.stock, price: r.price, published: r.published }]))
}

export function getAllStock(): Record<string, number> {
  const inv = getAllInventory()
  return Object.fromEntries(Object.entries(inv).map(([id, v]) => [id, v.stock]))
}

export function setStock(productId: string, stock: number) {
  const db = getDb()
  db.prepare(
    `INSERT INTO product_inventory (product_id, stock, price, published, updated_at)
     VALUES (?, ?, 0, 1, datetime('now'))
     ON CONFLICT(product_id) DO UPDATE SET stock = excluded.stock, updated_at = datetime('now')`
  ).run(productId, Math.max(0, stock))
}

export function setPrice(productId: string, price: number) {
  const db = getDb()
  db.prepare(
    `INSERT INTO product_inventory (product_id, stock, price, published, updated_at)
     VALUES (?, 0, ?, 1, datetime('now'))
     ON CONFLICT(product_id) DO UPDATE SET price = excluded.price, updated_at = datetime('now')`
  ).run(productId, Math.max(0, price))
}

export function setInventory(productId: string, stock: number, price: number, published = 1) {
  const db = getDb()
  db.prepare(
    `INSERT INTO product_inventory (product_id, stock, price, published, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(product_id) DO UPDATE SET
       stock = excluded.stock,
       price = excluded.price,
       published = excluded.published,
       updated_at = datetime('now')`
  ).run(productId, Math.max(0, stock), Math.max(0, price), published ? 1 : 0)
}

export function decrementStock(productId: string, qty: number) {
  const db = getDb()
  db.prepare(
    `UPDATE product_inventory
     SET stock = MAX(0, stock - ?), updated_at = datetime('now')
     WHERE product_id = ?`
  ).run(qty, productId)
}
