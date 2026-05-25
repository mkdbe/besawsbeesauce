export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number // in cents
  images: string[]
  category: ProductCategory
  stripePriceId?: string
  stripeProductId?: string
  inventory?: number
  featured?: boolean
}

export type ProductCategory = 'honey' | 'lip-balm' | 'bath-bombs' | 'soap' | 'other'

export interface CartItem {
  product: Product
  quantity: number
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  tags?: string[]
  coverImage?: string
}
