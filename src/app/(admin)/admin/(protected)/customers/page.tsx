'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Users, ShoppingBag, TrendingUp, Phone, Search, AlertCircle } from 'lucide-react'

type Customer = {
  name: string
  phone: string
  orderCount: number
  totalSpent: number
  lastOrderAt: string
}

function StatCard({ label, value, icon, iconBg }: { label: string; value: string; icon: React.ReactNode; iconBg: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const supabase = useRef(createClient()).current

  const fetchCustomers = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('orders')
      .select('customer_name, phone, total, created_at')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    const map = new Map<string, Customer>()
    ;(data ?? []).forEach((o: { customer_name: string; phone: string; total: number; created_at: string }) => {
      const key = o.phone
      const existing = map.get(key)
      if (existing) {
        existing.orderCount++
        existing.totalSpent += Number(o.total)
        if (o.created_at > existing.lastOrderAt) existing.lastOrderAt = o.created_at
      } else {
        map.set(key, {
          name: o.customer_name,
          phone: o.phone,
          orderCount: 1,
          totalSpent: Number(o.total),
          lastOrderAt: o.created_at,
        })
      }
    })

    setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent))
    setError(null)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  )

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0)
  const avgPerCustomer = customers.length ? Math.round(totalRevenue / customers.length) : 0

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">All customers from order history</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/30 w-56"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Customers" value={customers.length.toString()} iconBg="bg-blue-50" icon={<Users size={18} className="text-blue-600" />} />
        <StatCard label="Total Orders" value={totalOrders.toString()} iconBg="bg-purple-50" icon={<ShoppingBag size={18} className="text-purple-600" />} />
        <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} iconBg="bg-green-50" icon={<TrendingUp size={18} className="text-green-600" />} />
        <StatCard label="Avg. per Customer" value={formatPrice(avgPerCustomer)} iconBg="bg-orange-50" icon={<Phone size={18} className="text-orange-500" />} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={36} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium">{search ? 'No matching customers' : 'No customers yet'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Customer', 'Phone', 'Orders', 'Total Spent', 'Last Order'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr key={c.phone} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${c.phone}`} className="text-mechho-blue-mid hover:underline">
                        {c.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {c.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(c.lastOrderAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {customers.length} customers
          </div>
        </div>
      )}
    </div>
  )
}
