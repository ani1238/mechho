export interface Category {
  id: string
  name: string
  sort_order: number
  image_url: string | null
}

export interface Addon {
  id: string
  item_id: string
  name: string
  price: number
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_veg: boolean
  is_available: boolean
  is_bestseller: boolean
  tags: string[]
  addons?: Addon[]
  category?: Category
}

export interface CartItem {
  item: MenuItem
  qty: number
  selected_addons: Addon[]
}

export type OrderType = 'delivery' | 'pickup' | 'preorder'
export type OrderStatus = 'pending_payment' | 'pending_review' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'rejected' | 'cancelled'
export type PaymentMethod = 'upi' | 'cod'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Order {
  id: string
  created_at: string
  type: OrderType
  status: OrderStatus
  customer_name: string
  phone: string
  address: string | null
  pincode: string
  slot_date: string | null
  slot_time: string | null
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  upi_ref: string | null
  notes: string | null
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  item_id: string
  qty: number
  unit_price: number
  addons_json: Addon[]
  item?: MenuItem
}

export interface PreorderFormData {
  customer_name: string
  phone: string
  address: string
  pincode: string
  slot_date: string
  slot_time: 'lunch' | 'dinner'
  pax: number
  items: { item_id: string; item_name: string; qty: number; unit_price: number }[]
  special_requests: string
  subtotal: number
  upi_ref: string
  notes: string
}

export interface ServicePincode {
  pincode: string
  delivery_fee: number
  eta_minutes: number
}

export interface SurveyResponse {
  id?: string
  created_at?: string
  name: string | null
  phone: string | null
  pincode: string
  fish_types: string[]
  preparations: string[]
  portion_size: string
  price_band: string
  frequency: string
  comments: string | null
}
