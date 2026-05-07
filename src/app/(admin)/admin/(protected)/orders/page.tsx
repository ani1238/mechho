'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'
import { cn, formatPrice, generateWhatsAppOrderMessage } from '@/lib/utils'
import {
  RefreshCw,
  MessageCircle,
  Check,
  ChefHat,
  Truck,
  PackageCheck,
  X,
  Clock,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Copy,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'

// ─── Local types ──────────────────────────────────────────────────────────────

type OItem = {
  id: string
  qty: number
  unit_price: number
  addons_json: Array<{ name: string; price: number }>
  item: { name: string } | null
}

type OrderWithItems = Order & { order_items: OItem[] }

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OrderStatus, { label: string; dot: string; badge: string }> = {
  pending_payment: {
    label: 'Pending Payment',
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  pending_review: {
    label: 'Pending Review',
    dot: 'bg-orange-400',
    badge: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  confirmed: {
    label: 'Confirmed',
    dot: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  preparing: {
    label: 'Preparing',
    dot: 'bg-purple-400',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    dot: 'bg-indigo-400',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  delivered: {
    label: 'Delivered',
    dot: 'bg-green-400',
    badge: 'bg-green-50 text-green-800 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-red-400',
    badge: 'bg-red-50 text-red-800 border-red-200',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-gray-400',
    badge: 'bg-gray-50 text-gray-600 border-gray-200',
  },
}

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'rejected', label: 'Rejected' },
] as const

type FilterKey = (typeof FILTER_TABS)[number]['key']

const ACTION_VARIANT: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
  green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
  red: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx();
    [0, 0.18, 0.36].forEach((delay) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.14)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.15)
    })
  } catch {
    // Audio unavailable — silent fail
  }
}

function isToday(dateStr: string) {
  const d = new Date(dateStr)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function itemsSummary(order: OrderWithItems) {
  if (!order.order_items?.length) return '—'
  return order.order_items.map((oi) => `${oi.qty}× ${oi.item?.name ?? 'Item'}`).join(', ')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', c.badge)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', c.dot)} />
      {c.label}
    </span>
  )
}

function StatCard({
  label, value, sub, iconBg, icon,
}: {
  label: string; value: string; sub?: string; iconBg: string; icon: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function OrderCard({
  order,
  onStatusChange,
  onPaymentVerify,
  updating,
}: {
  order: OrderWithItems
  onStatusChange: (id: string, s: OrderStatus) => void
  onPaymentVerify: (id: string, status: 'paid' | 'failed') => void
  updating: string | null
}) {
  const busy = updating === order.id
  const [copied, setCopied] = useState(false)

  const copyUtr = () => {
    if (!order.upi_ref) return
    navigator.clipboard.writeText(order.upi_ref)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waMsg = generateWhatsAppOrderMessage({
    id: order.id,
    customer_name: order.customer_name,
    phone: order.phone,
    type: order.type,
    items: (order.order_items ?? []).map((oi) => ({
      name: oi.item?.name ?? 'Item',
      qty: oi.qty,
      price: oi.unit_price,
    })),
    total: order.total,
    address: order.address ?? undefined,
    payment_method: order.payment_method,
    notes: order.notes ?? undefined,
  })

  type ActionDef = { label: string; status: OrderStatus; icon: React.ReactNode; variant: string }
  const actions: ActionDef[] = []

  if (['pending_payment', 'pending_review'].includes(order.status)) {
    actions.push({ label: 'Confirm', status: 'confirmed', icon: <Check size={13} />, variant: 'blue' })
  }
  if (order.status === 'confirmed') {
    actions.push({ label: 'Preparing', status: 'preparing', icon: <ChefHat size={13} />, variant: 'purple' })
  }
  if (order.status === 'preparing') {
    actions.push({ label: 'Out for Delivery', status: 'out_for_delivery', icon: <Truck size={13} />, variant: 'indigo' })
  }
  if (order.status === 'out_for_delivery') {
    actions.push({ label: 'Delivered', status: 'delivered', icon: <PackageCheck size={13} />, variant: 'green' })
  }
  if (!['delivered', 'rejected', 'cancelled'].includes(order.status)) {
    actions.push({ label: 'Reject', status: 'rejected', icon: <X size={13} />, variant: 'red' })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 hover:shadow-sm transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-gray-900 text-sm tracking-wide">
            #{order.id.slice(-6).toUpperCase()}
          </span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              order.type === 'delivery' && 'bg-blue-50 text-blue-700',
              order.type === 'pickup' && 'bg-teal-50 text-teal-700',
              order.type === 'preorder' && 'bg-violet-50 text-violet-700',
            )}
          >
            {order.type}
          </span>
          <StatusBadge status={order.status} />
        </div>
        <span className="flex items-center gap-1 text-gray-400 text-xs flex-shrink-0">
          <Clock size={11} />
          {formatTime(order.created_at)}
        </span>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-3 text-sm flex-wrap">
        <span className="font-semibold text-gray-900">{order.customer_name}</span>
        <a href={`tel:${order.phone}`} className="text-mechho-blue-mid hover:underline">
          {order.phone}
        </a>
      </div>

      {/* Items */}
      <p className="text-sm text-gray-600 line-clamp-2">{itemsSummary(order)}</p>

      {/* Address */}
      {order.address && (
        <p className="text-xs text-gray-400 truncate">{order.address}</p>
      )}

      {/* Total + payment */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
        <div className="flex items-center gap-2">
          {/* Payment status badge */}
          {order.payment_method === 'upi' && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium border',
              order.payment_status === 'paid'
                ? 'bg-green-50 text-green-700 border-green-200'
                : order.payment_status === 'failed'
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200',
            )}>
              {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status === 'failed' ? '✗ Failed' : '⏳ Unverified'}
            </span>
          )}
          <span className="text-xs text-gray-400 font-medium">
            {order.payment_method.toUpperCase()}
          </span>
        </div>
      </div>

      {/* UPI UTR verification row */}
      {order.payment_method === 'upi' && order.upi_ref && (
        <div className={cn(
          'rounded-xl p-3 space-y-2',
          order.payment_status === 'paid'
            ? 'bg-green-50 border border-green-100'
            : order.payment_status === 'failed'
            ? 'bg-red-50 border border-red-100'
            : 'bg-amber-50 border border-amber-100'
        )}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">UTR / Transaction ID</p>
              <p className="font-mono text-sm font-bold text-gray-900 tracking-wide break-all">
                {order.upi_ref}
              </p>
            </div>
            <button
              onClick={copyUtr}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/70 text-gray-500 transition"
              title="Copy UTR"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>

          {order.payment_status === 'pending' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onPaymentVerify(order.id, 'paid')}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                <ShieldCheck size={13} /> Mark Paid
              </button>
              <button
                onClick={() => onPaymentVerify(order.id, 'failed')}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition border border-red-200"
              >
                <ShieldX size={13} /> Mark Failed
              </button>
            </div>
          )}
          {order.payment_status === 'paid' && (
            <p className="text-xs text-green-700 font-medium flex items-center gap-1">
              <ShieldCheck size={12} /> Payment verified manually
            </p>
          )}
          {order.payment_status === 'failed' && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <ShieldX size={12} /> Marked as failed
              </p>
              <button
                onClick={() => onPaymentVerify(order.id, 'paid')}
                className="text-xs text-green-700 underline hover:no-underline"
              >
                Undo → Mark Paid
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions + WhatsApp */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-gray-100">
        {actions.map((a) => (
          <button
            key={a.status}
            onClick={() => onStatusChange(order.id, a.status)}
            disabled={busy}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50',
              ACTION_VARIANT[a.variant],
            )}
          >
            {busy ? (
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              a.icon
            )}
            {a.label}
          </button>
        ))}
        <a
          href={`https://wa.me/${order.phone.replace(/\D/g, '')}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors ml-auto"
        >
          <MessageCircle size={13} />
          WhatsApp
        </a>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const knownIds = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  const fetchOrders = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('orders')
      .select('*, order_items(id, qty, unit_price, addons_json, item:items(name))')
      .order('created_at', { ascending: false })
      .limit(300)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    const list = (data ?? []) as OrderWithItems[]
    setOrders(list)
    setLastFetch(new Date())
    setError(null)

    if (!initialized.current) {
      list.forEach((o) => knownIds.current.add(o.id))
      initialized.current = true
    }
    setLoading(false)
  }, [supabase])

  // Initial load
  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('orders-admin-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (!knownIds.current.has(payload.new.id)) {
          knownIds.current.add(payload.new.id)
          playBeep()
          fetchOrders()
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchOrders])

  // 30-second fallback refresh
  useEffect(() => {
    const t = setInterval(fetchOrders, 30_000)
    return () => clearInterval(t)
  }, [fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId)
    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))

    const { error: err } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (err) {
      // Revert
      fetchOrders()
    }
    setUpdating(null)
  }

  const handlePaymentVerify = async (orderId: string, paymentStatus: 'paid' | 'failed') => {
    setUpdating(orderId)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: paymentStatus } : o))
    )
    const { error: err } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)

    if (err) fetchOrders()
    setUpdating(null)
  }

  // Stats
  const todayOrders = orders.filter((o) => isToday(o.created_at))
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0)
  const pendingCount = orders.filter((o) => ['pending_payment', 'pending_review'].includes(o.status)).length
  const avgValue = todayOrders.length ? Math.round(todayRevenue / todayOrders.length) : 0

  // Filtered list
  const visible = orders.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'pending') return ['pending_payment', 'pending_review'].includes(o.status)
    return o.status === filter
  })

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          {lastFetch && (
            <p className="text-gray-400 text-xs mt-0.5">
              Updated {lastFetch.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Today's Orders"
          value={todayOrders.length.toString()}
          iconBg="bg-blue-50"
          icon={<ShoppingBag size={18} className="text-blue-600" />}
        />
        <StatCard
          label="Today's Revenue"
          value={formatPrice(todayRevenue)}
          iconBg="bg-green-50"
          icon={<DollarSign size={18} className="text-green-600" />}
        />
        <StatCard
          label="Pending"
          value={pendingCount.toString()}
          sub={pendingCount > 0 ? 'Needs attention' : 'All clear'}
          iconBg={pendingCount > 0 ? 'bg-orange-50' : 'bg-gray-50'}
          icon={<AlertCircle size={18} className={pendingCount > 0 ? 'text-orange-500' : 'text-gray-400'} />}
        />
        <StatCard
          label="Avg. Order Value"
          value={formatPrice(avgValue)}
          sub="Today"
          iconBg="bg-violet-50"
          icon={<TrendingUp size={18} className="text-violet-600" />}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_TABS.map(({ key, label }) => {
          const count =
            key === 'all'
              ? orders.length
              : key === 'pending'
              ? orders.filter((o) => ['pending_payment', 'pending_review'].includes(o.status)).length
              : orders.filter((o) => o.status === key).length

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                filter === key
                  ? 'bg-mechho-blue text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                    filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-48 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders found</p>
          <p className="text-sm mt-1">
            {filter !== 'all' ? 'Try switching to "All" orders' : 'Orders will appear here in real-time'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onPaymentVerify={handlePaymentVerify}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  )
}
