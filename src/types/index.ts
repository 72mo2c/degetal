export interface Product {
  id: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  category: string
  price: number
  image_url?: string
  is_active: boolean
  stock_count: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  user_id?: string
  stripe_payment_intent_id?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  total_amount: number
  currency: string
  customer_email?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_time: number
  product_name: string
  product_image_url?: string
  digital_code?: string
  created_at: string
}