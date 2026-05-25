import { Product, ProductCategory } from '@/types'
import { getDb } from './db'

const staticProducts: Product[] = [
  {
    id: '1',
    name: 'Raw Wildflower Honey',
    slug: 'raw-wildflower-honey',
    description:
      'Pure raw honey harvested from our local hives. Unfiltered, unheated, and packed with natural enzymes and pollen. Each jar reflects the unique floral character of the season.',
    price: 1400,
    images: ['/products/wildflower-honey.jpg'],
    category: 'honey',
    featured: true,
  },
  {
    id: '3',
    name: 'Lip Balm',
    slug: 'lip-balm',
    description:
      'Natural lip balm made with 100% pure beeswax and oils. Deeply moisturizing and apiary crafted.',
    price: 500,
    images: ['/products/lip-balm.jpg'],
    category: 'lip-balm',
    featured: true,
  },
  {
    id: '4',
    name: 'Honey & Oat Bath Bomb',
    slug: 'honey-oat-bath-bomb',
    description:
      'Fizzing bath bomb infused with honey and colloidal oatmeal for a soothing, skin-softening soak.',
    price: 700,
    images: ['/products/bath-bomb.jpg'],
    category: 'bath-bombs',
  },
  {
    id: '5',
    name: 'Beeswax Candle',
    slug: 'beeswax-candle',
    description:
      'Hand-poured 100% pure beeswax candle with a natural honey scent. Burns clean and long.',
    price: 1800,
    images: ['/products/beeswax-candle.jpg'],
    category: 'other',
  },
  {
    id: '6',
    name: 'Honey Soap',
    slug: 'honey-soap',
    description:
      'Handcrafted bar soap made with raw honey and beeswax. Gently cleanses and leaves skin soft and moisturized.',
    price: 800,
    images: ['/products/soap.jpg'],
    category: 'other',
    featured: true,
  },
]

interface CustomProductRow {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  image: string
  featured: number
  home_slot: number | null
}

export function getCustomProducts(): Product[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM custom_products ORDER BY created_at DESC').all() as CustomProductRow[]
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    price: r.price,
    images: r.image ? [r.image] : [],
    category: r.category as ProductCategory,
    featured: r.featured === 1,
  }))
}

export function getAllProducts(): Product[] {
  return getCustomProducts()
}

// Keep for backward compat — server-side pages only
export const products = staticProducts

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id)
}

export function getFeaturedProducts(): Product[] {
  return getAllProducts().filter((p) => p.featured)
}

export function getProductsByCategory(category: string): Product[] {
  return getAllProducts().filter((p) => p.category === category)
}

export function getHomeFeatured(): Product[] {
  const db = getDb()
  const rows = db.prepare(
    'SELECT * FROM custom_products WHERE home_slot IN (1,2,3) ORDER BY home_slot ASC'
  ).all() as CustomProductRow[]
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    price: r.price,
    images: r.image ? [r.image] : [],
    category: r.category as ProductCategory,
    featured: r.featured === 1,
  }))
}

export function getHomeFeaturedSlots(): [string, string, string] {
  const db = getDb()
  const rows = db.prepare(
    'SELECT id, home_slot FROM custom_products WHERE home_slot IN (1,2,3) ORDER BY home_slot ASC'
  ).all() as { id: string; home_slot: number }[]
  const slots: [string, string, string] = ['', '', '']
  for (const r of rows) {
    if (r.home_slot >= 1 && r.home_slot <= 3) slots[r.home_slot - 1] = r.id
  }
  return slots
}
