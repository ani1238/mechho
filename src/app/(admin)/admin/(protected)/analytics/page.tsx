import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Users, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics | Mechho Admin',
  robots: { index: false, follow: false },
}

export default async function AnalyticsPage() {
  const supabase = createAdminClient()
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [pvRes, ceRes, ordersRes, oiRes] = await Promise.all([
    supabase.from('page_views').select('session_id, page, created_at').gte('created_at', since30),
    supabase.from('cart_events').select('session_id, item_name, price, created_at').gte('created_at', since30),
    supabase.from('orders').select('id, total, type, status, created_at, pincode').gte('created_at', since30),
    supabase.from('order_items').select('order_id, qty, items(name)'),
  ])

  const pageViews = pvRes.data ?? []
  const cartEvents = ceRes.data ?? []
  const orders = ordersRes.data ?? []

  // ── Stats ──────────────────────────────────────────────────────────────────
  const uniqueVisitors = new Set(pageViews.map((v) => v.session_id)).size
  const cartSessions = new Set(cartEvents.map((e) => e.session_id)).size
  const validOrders = orders.filter((o) => !['rejected', 'cancelled'].includes(o.status))
  const totalRevenue = validOrders.reduce((s, o) => s + Number(o.total), 0)
  const avgOrder = validOrders.length > 0 ? totalRevenue / validOrders.length : 0

  // ── Top cart items ─────────────────────────────────────────────────────────
  const cartItemMap = new Map<string, { count: number; sessions: Set<string> }>()
  for (const e of cartEvents) {
    if (!cartItemMap.has(e.item_name)) cartItemMap.set(e.item_name, { count: 0, sessions: new Set() })
    const entry = cartItemMap.get(e.item_name)!
    entry.count++
    entry.sessions.add(e.session_id)
  }
  const topCartItems = [...cartItemMap.entries()]
    .map(([name, { count, sessions }]) => ({ name, count, sessions: sessions.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  const maxCartCount = topCartItems[0]?.count ?? 1

  // ── Orders by day (last 14 days) ───────────────────────────────────────────
  const ordersByDay = new Map<string, { count: number; revenue: number }>()
  for (const o of validOrders) {
    const day = o.created_at.split('T')[0]
    if (!ordersByDay.has(day)) ordersByDay.set(day, { count: 0, revenue: 0 })
    const entry = ordersByDay.get(day)!
    entry.count++
    entry.revenue += Number(o.total)
  }
  const chartDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const key = d.toISOString().split('T')[0]
    const data = ordersByDay.get(key)
    return {
      key,
      label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      orders: data?.count ?? 0,
      revenue: data?.revenue ?? 0,
    }
  })
  const maxOrders = Math.max(...chartDays.map((d) => d.orders), 1)

  // ── Top ordered items ──────────────────────────────────────────────────────
  const validOrderIds = new Set(validOrders.map((o) => o.id))
  const orderedItemMap = new Map<string, number>()
  for (const oi of (oiRes.data ?? []) as any[]) {
    if (!validOrderIds.has(oi.order_id)) continue
    const name = oi.items?.name ?? 'Unknown'
    orderedItemMap.set(name, (orderedItemMap.get(name) ?? 0) + oi.qty)
  }
  const topOrderedItems = [...orderedItemMap.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)
  const maxOrderedQty = topOrderedItems[0]?.qty ?? 1

  // ── Order type breakdown ───────────────────────────────────────────────────
  const typeBreak = { delivery: 0, pickup: 0, preorder: 0 }
  for (const o of validOrders) {
    const t = o.type as keyof typeof typeBreak
    if (t in typeBreak) typeBreak[t]++
  }

  // ── Top pincodes ───────────────────────────────────────────────────────────
  const pincodeMap = new Map<string, number>()
  for (const o of validOrders) {
    if (o.pincode) pincodeMap.set(o.pincode, (pincodeMap.get(o.pincode) ?? 0) + 1)
  }
  const topPincodes = [...pincodeMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  // ── Top pages ─────────────────────────────────────────────────────────────
  const pageMap = new Map<string, number>()
  for (const v of pageViews) {
    pageMap.set(v.page, (pageMap.get(v.page) ?? 0) + 1)
  }
  const topPages = [...pageMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Last 30 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Visitors', value: uniqueVisitors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Cart Adds', value: cartEvents.length, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Cart Sessions', value: cartSessions, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Orders', value: validOrders.length, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Order', value: formatPrice(avgOrder), icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Top Cart Items (most important) ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-5">
          <ShoppingCart size={18} className="text-amber-500" />
          <h2 className="font-semibold text-gray-900">Top Cart Adds</h2>
          <span className="ml-1 text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">
            {cartEvents.length} total
          </span>
        </div>
        {topCartItems.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingCart size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No cart data yet — tracking starts once users add items</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topCartItems.map((item, i) => (
              <div key={item.name}>
                <div className="flex items-baseline justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 font-mono tabular-nums w-5 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
                    <span>{item.sessions} session{item.sessions !== 1 ? 's' : ''}</span>
                    <span className="font-semibold text-gray-900 text-sm">{item.count}×</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${Math.round((item.count / maxCartCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Orders trend + Top ordered items ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Orders by day */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Orders — Last 14 Days</h2>
          <div className="flex items-end gap-1 h-28">
            {chartDays.map((day) => (
              <div
                key={day.key}
                className="flex-1 group relative"
                style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}
              >
                <div
                  className="w-full bg-mechho-blue rounded-t-sm hover:bg-mechho-blue/80 transition-colors cursor-default"
                  style={{
                    height: `${Math.max(Math.round((day.orders / maxOrders) * 100), day.orders > 0 ? 4 : 0)}%`,
                  }}
                  title={`${day.label}: ${day.orders} orders · ${formatPrice(day.revenue)}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2">
            <span>{chartDays[0]?.label}</span>
            <span>{chartDays[6]?.label}</span>
            <span>{chartDays[13]?.label}</span>
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span><strong className="text-gray-900">{validOrders.length}</strong> orders</span>
            <span><strong className="text-gray-900">{formatPrice(totalRevenue)}</strong> revenue</span>
          </div>
        </div>

        {/* Top ordered items */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top Ordered Items</h2>
          {topOrderedItems.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topOrderedItems.map((item, i) => (
                <div key={item.name}>
                  <div className="flex items-baseline justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-400 font-mono w-5 flex-shrink-0">#{i + 1}</span>
                      <span className="text-sm text-gray-700 truncate">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{item.qty} qty</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-mechho-blue rounded-full"
                      style={{ width: `${Math.round((item.qty / maxOrderedQty) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Order type breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Order Types</h2>
          <div className="space-y-4">
            {[
              { key: 'delivery', label: '🚴 Delivery', color: 'bg-blue-500' },
              { key: 'pickup', label: '🏪 Pickup', color: 'bg-green-500' },
              { key: 'preorder', label: '📅 Pre-order', color: 'bg-purple-500' },
            ].map(({ key, label, color }) => {
              const count = typeBreak[key as keyof typeof typeBreak]
              const pct = validOrders.length > 0 ? Math.round((count / validOrders.length) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700">{label}</span>
                    <span className="text-gray-500 tabular-nums">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top pincodes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">📍 Top Delivery Pincodes</h2>
          {topPincodes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {topPincodes.map(([pincode, count], i) => (
                <div key={pincode} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono w-4">#{i + 1}</span>
                    <span className="font-mono text-sm font-medium text-gray-800">{pincode}</span>
                  </div>
                  <span className="text-sm text-gray-500">{count} order{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top pages */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">🔍 Top Pages</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No page views yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {topPages.map(([page, count], i) => (
                <div key={page} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 font-mono w-4">#{i + 1}</span>
                    <span className="text-sm text-gray-800 truncate font-mono">{page || '/'}</span>
                  </div>
                  <span className="text-sm text-gray-500 flex-shrink-0 ml-2">{count} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
