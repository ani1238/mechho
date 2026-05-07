import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function generateWhatsAppOrderMessage(order: {
  id: string
  customer_name: string
  phone: string
  type: string
  items: { name: string; qty: number; price: number }[]
  subtotal?: number
  discount?: number
  promo_code?: string
  total: number
  address?: string
  payment_method: string
  notes?: string
}): string {
  const itemLines = order.items
    .map((i) => `  • ${i.qty}x ${i.name} — ₹${i.price * i.qty}`)
    .join('\n')

  const promoLine =
    order.discount && order.discount > 0
      ? `🎟️ Promo (${order.promo_code ?? ''}): −₹${order.discount}\n`
      : ''

  return encodeURIComponent(
    `🐟 *New Mechho Order* #${order.id.slice(-6).toUpperCase()}\n\n` +
    `👤 ${order.customer_name} | 📞 ${order.phone}\n` +
    `📦 ${order.type === 'delivery' ? 'Delivery' : order.type === 'pickup' ? 'Pickup' : 'Pre-order'}\n` +
    (order.address ? `📍 ${order.address}\n` : '') +
    `\n${itemLines}\n\n` +
    promoLine +
    `💰 Total: ₹${order.total} | ${order.payment_method.toUpperCase()}\n` +
    (order.notes ? `📝 Notes: ${order.notes}\n` : '') +
    `\nReply to confirm! 🙏`
  )
}

export function buildUpiLink(amount: number, orderId: string, upiId = 'mechho@upi'): string {
  const pa = upiId
  const pn = 'Mechho Kitchen'
  const am = amount.toFixed(2)
  const tn = `Mechho Order ${orderId.slice(-6).toUpperCase()}`
  return `upi://pay?pa=${pa}&pn=${encodeURIComponent(pn)}&am=${am}&tn=${encodeURIComponent(tn)}&cu=INR`
}

export function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const d = new Date(dateStr)
  return d.toDateString() === tomorrow.toDateString()
}

export function getTomorrowDateString(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

export function isPreorderCutoffPassed(): boolean {
  const cutoffHour = Number(process.env.NEXT_PUBLIC_PREORDER_CUTOFF_HOUR ?? 20)
  return new Date().getHours() >= cutoffHour
}
