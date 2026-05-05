'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'
import { cn, formatPrice, getTomorrowDateString } from '@/lib/utils'
import { Check, MessageCircle, X, Calendar, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type OItem = {
  id: string
  qty: number
  unit_price: number
  addons_json: Array<{ name: string; price: number }>
  item: { name: string } | null
}

type PreOrder = Order & { order_items: OItem[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSlot(date: string | null, time: string | null) {
  if (!date) return '—'
  const d = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
  const t = time === 'lunch' ? '🌞 Lunch' : time === 'dinner' ? '🌙 Dinner' : time ?? ''
  return `${d} · ${t}`
}

function itemsSummary(order: PreOrder) {
  if (!order.order_items?.length) return '—'
  return order.order_items.map((oi) => `${oi.qty}× ${oi.item?.name ?? 'Item'}`).join(', ')
}

function whatsappConfirmMsg(order: PreOrder): string {
  const slot = order.slot_time === 'lunch' ? 'Lunch' : 'Dinner'
  const dateStr = order.slot_date
    ? new Date(order.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
    : ''
  return encodeURIComponent(
    `✅ *Mechho Pre-order Confirmed!*\n\n` +
      `Hi ${order.customer_name}! Your pre-order #${order.id.slice(-6).toUpperCase()} is confirmed.\n\n` +
      `📅 ${dateStr} · ${slot}\n` +
      `💰 Total: ₹${order.total}\n\n` +
      `We're looking forward to cooking for you! 🐟🙏`,
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, iconBg,
}: {
  label: string; value: string; icon: React.ReactNode; iconBg: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  )
}

function PreOrderCard({
  order,
  onStatusChange,
  updating,
}: {
  order: PreOrder
  onStatusChange: (id: string, status: OrderStatus) => void
  updating: string | null
}) {
  const busy = updating === order.id
  const waMsg = whatsappConfirmMsg(order)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Status strip */}
      <div
        className={cn(
          'h-1.5',
          order.status === 'pending_review' && 'bg-orange-400',
          order.status === 'confirmed' && 'bg-green-400',
          order.status === 'rejected' && 'bg-red-400',
          !['pending_review', 'confirmed', 'rejected'].includes(order.status) && 'bg-gray-200',
        )}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-gray-900 text-sm">
              #{order.id.slice(-6).toUpperCase()}
            </span>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium border',
                order.status === 'pending_review' && 'bg-orange-50 text-orange-700 border-orange-200',
                order.status === 'confirmed' && 'bg-green-50 text-green-700 border-green-200',
                order.status === 'rejected' && 'bg-red-50 text-red-700 border-red-200',
                !['pending_review', 'confirmed', 'rejected'].includes(order.status) &&
                  'bg-gray-50 text-gray-600 border-gray-200',
              )}
            >
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />
            {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Customer */}
        <div className="space-y-0.5">
          <p className="font-semibold text-gray-900">{order.customer_name}</p>
          <a href={`tel:${order.phone}`} className="text-sm text-mechho-blue-mid hover:underline">
            {order.phone}
          </a>
        </div>

        {/* Slot */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          <Calendar size={14} className="text-mechho-blue flex-shrink-0" />
          {formatSlot(order.slot_date, order.slot_time)}
        </div>

        {/* Items */}
        <p className="text-sm text-gray-600 line-clamp-2">{itemsSummary(order)}</p>

        {/* UTR + Total */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
          {order.upi_ref && (
            <span className="text-xs text-gray-400">
              UTR: <span className="font-mono">{order.upi_ref}</span>
            </span>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <p className="text-xs text-gray-400 italic">📝 {order.notes}</p>
        )}

        {/* Actions */}
        {order.status === 'pending_review' && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <button
              onClick={() => onStatusChange(order.id, 'confirmed')}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
            >
              {busy ? (
                <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Confirm
            </button>
            <button
              onClick={() => onStatusChange(order.id, 'rejected')}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
            >
              <X size={14} />
              Reject
            </button>
            <a
              href={`https://wa.me/${order.phone.replace(/\D/g, '')}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
            >
              <MessageCircle size={14} />
            </a>
          </div>
        )}

        {order.status === 'confirmed' && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <a
              href={`https://wa.me/${order.phone.replace(/\D/g, '')}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp Customer
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreordersPage() {
  const [orders, setOrders] = useState<PreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const supabase = useRef(createClient()).current
  const tomorrow = getTomorrowDateString()

  const tomorrowLabel = new Date(tomorrow + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const fetchOrders = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('orders')
      .select('*, order_items(id, qty, unit_price, addons_json, item:items(name))')
      .eq('type', 'preorder')
      .eq('slot_date', tomorrow)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setOrders((data ?? []) as PreOrder[])
      setError(null)
    }
    setLoading(false)
  }, [supabase, tomorrow])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('preorders-admin-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId)
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))

    const { error: err } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (err) fetchOrders()
    setUpdating(null)
  }

  const pendingCount = orders.filter((o) => o.status === 'pending_review').length
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length
  const totalRevenue = orders
    .filter((o) => !['rejected', 'cancelled'].includes(o.status))
    .reduce((s, o) => s + Number(o.total), 0)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pre-orders</h1>
        <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
          <Calendar size={14} />
          Tomorrow · {tomorrowLabel}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Pre-orders"
          value={orders.length.toString()}
          iconBg="bg-violet-50"
          icon={<Calendar size={18} className="text-violet-600" />}
        />
        <StatCard
          label="Pending Review"
          value={pendingCount.toString()}
          iconBg={pendingCount > 0 ? 'bg-orange-50' : 'bg-gray-50'}
          icon={
            <AlertCircle size={18} className={pendingCount > 0 ? 'text-orange-500' : 'text-gray-300'} />
          }
        />
        <StatCard
          label="Confirmed"
          value={confirmedCount.toString()}
          iconBg="bg-green-50"
          icon={<Users size={18} className="text-green-600" />}
        />
        <StatCard
          label="Expected Revenue"
          value={formatPrice(totalRevenue)}
          iconBg="bg-blue-50"
          icon={<TrendingUp size={18} className="text-blue-600" />}
        />
      </div>

      {/* Pre-orders grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-52 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium text-gray-500">No pre-orders for tomorrow</p>
          <p className="text-sm mt-1">Pre-orders placed by customers will appear here</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {orders.map((order) => (
            <PreOrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  )
}
