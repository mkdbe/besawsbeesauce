import { getDb } from './db'

export interface Order {
  id: string
  created_at: string
  customer_email: string
  customer_name: string
  amount_total: number
  status: string
}

export interface OrderItem {
  id: number
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  amount: number
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export function saveOrder(order: Omit<Order, 'status'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) {
  const db = getDb()
  db.prepare(`
    INSERT OR IGNORE INTO orders (id, created_at, customer_email, customer_name, amount_total)
    VALUES (?, ?, ?, ?, ?)
  `).run(order.id, order.created_at, order.customer_email, order.customer_name, order.amount_total)

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, amount)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  for (const item of items) {
    insertItem.run(order.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.amount)
  }
}

export function getAllOrders(): OrderWithItems[] {
  const db = getDb()
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Order[]
  const items = db.prepare('SELECT * FROM order_items').all() as OrderItem[]
  const itemsByOrder: Record<string, OrderItem[]> = {}
  for (const item of items) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
    itemsByOrder[item.order_id].push(item)
  }
  return orders.map(o => ({ ...o, items: itemsByOrder[o.id] ?? [] }))
}

export function getSalesStats() {
  const db = getDb()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()

  const total = (db.prepare("SELECT COALESCE(SUM(amount_total),0) as v FROM orders").get() as { v: number }).v
  const thisYear = (db.prepare("SELECT COALESCE(SUM(amount_total),0) as v FROM orders WHERE created_at >= ?").get(yearStart) as { v: number }).v
  const thisMonth = (db.prepare("SELECT COALESCE(SUM(amount_total),0) as v FROM orders WHERE created_at >= ?").get(monthStart) as { v: number }).v
  const orderCount = (db.prepare("SELECT COUNT(*) as v FROM orders").get() as { v: number }).v

  return { total, thisYear, thisMonth, orderCount }
}

export function getSalesByProduct(): { product_id: string; product_name: string; units: number; revenue: number }[] {
  const db = getDb()
  return db.prepare(`
    SELECT product_id, product_name,
           SUM(quantity) as units,
           SUM(amount) as revenue
    FROM order_items
    GROUP BY product_id, product_name
    ORDER BY revenue DESC
  `).all() as { product_id: string; product_name: string; units: number; revenue: number }[]
}

export function getMonthlySales(months = 12): { month: string; revenue: number; orders: number }[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month,
           SUM(amount_total) as revenue,
           COUNT(*) as orders
    FROM orders
    GROUP BY month
    ORDER BY month DESC
    LIMIT ?
  `).all(months) as { month: string; revenue: number; orders: number }[]
  return rows.reverse()
}
