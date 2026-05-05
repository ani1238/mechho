'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/types'
import Button from '@/components/ui/Button'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919000000000'

interface Props {
  orderId: string
}

export default function CheckoutSuccessClient({ orderId }: Props) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(!!orderId)

  useEffect(() => {
    if (!orderId) return
    const fetchOrder = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*, item:items(name, price))')
          .eq('id', orderId)
          .single()
        if (data) setOrder(data as Order)
      } catch (err) {
        console.error('Failed to load order:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  const shortId = orderId ? orderId.slice(-6).toUpperCase() : ''
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`

  return (
    <div className="min-h-screen bg-mechho-cream py-12 px-4 flex flex-col items-center">
      <div className="max-w-lg w-full animate-slide-up">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-mechho-green rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle2 size={52} color="white" strokeWidth={2} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-mechho-blue">Order Placed! 🎉</h1>
          {shortId && (
            <p className="text-gray-500 mt-2 text-sm">
              Order ID:{' '}
              <span className="font-mono font-bold text-mechho-blue">#{shortId}</span>
            </p>
          )}
          <p className="text-gray-600 mt-3 text-sm sm:text-base leading-relaxed">
            Thank you! We'll WhatsApp you with updates on your order. 📱
          </p>
        </div>

        {/* Order summary skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse space-y-3 mb-6">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-5 bg-gray-200 rounded w-1/4 ml-auto" />
          </div>
        )}

        {/* Order summary */}
        {!loading && order && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-mechho-blue text-center mb-4">Your Order</h2>

            <div className="space-y-2">
              {(order.order_items ?? []).map((oi) => (
                <div
                  key={oi.id}
                  className="flex justify-between text-sm text-gray-700"
                >
                  <span>
                    <span className="font-medium text-mechho-blue">{oi.qty}×</span>{' '}
                    {oi.item?.name ?? 'Item'}
                  </span>
                  <span className="font-medium">{formatPrice(oi.unit_price * oi.qty)}</span>
                </div>
              ))}

              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                  <span>Delivery fee</span>
                  <span>{formatPrice(order.delivery_fee)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-mechho-blue text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs text-gray-400">
              <span>
                📦{' '}
                {order.type === 'delivery'
                  ? 'Home Delivery'
                  : order.type === 'pickup'
                  ? 'Pickup'
                  : 'Pre-order'}
              </span>
              <span>·</span>
              <span>
                {order.payment_method === 'upi' ? '📱 UPI' : '💵 Cash on Delivery'}
              </span>
              {order.customer_name && (
                <>
                  <span>·</span>
                  <span>👤 {order.customer_name}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* No orderId fallback */}
        {!loading && !order && !orderId && (
          <div className="bg-mechho-blue/5 border border-mechho-blue/20 rounded-2xl p-5 text-center mb-6">
            <p className="text-mechho-blue text-sm">
              Your order has been placed! Check WhatsApp for updates.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button size="lg" variant="secondary" className="w-full rounded-2xl gap-2">
              <MessageCircle size={18} />
              Contact Mechho on WhatsApp
            </Button>
          </a>
          <Link href="/menu" className="block">
            <Button size="lg" variant="outline" className="w-full rounded-2xl gap-2">
              <ShoppingBag size={18} />
              Continue Ordering
            </Button>
          </Link>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          Questions? WhatsApp us — we're always happy to help 🙏
        </p>
      </div>
    </div>
  )
}
