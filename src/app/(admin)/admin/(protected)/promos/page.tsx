'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Tag, Plus, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Metadata } from 'next'

type PromoCode = {
  id: string
  code: string
  type: 'flat' | 'percent'
  value: number
  min_order: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

const EMPTY_FORM = {
  code: '',
  type: 'flat' as 'flat' | 'percent',
  value: '',
  min_order: '0',
  max_uses: '',
  expires_at: '',
}

export default function PromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
    setPromos((data as PromoCode[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    setCreateError('')
    const code = form.code.trim().toUpperCase()
    if (!code) { setCreateError('Code is required'); return }
    const value = Number(form.value)
    if (!value || value <= 0) { setCreateError('Value must be greater than 0'); return }
    if (form.type === 'percent' && value > 100) { setCreateError('Percentage cannot exceed 100'); return }

    setCreating(true)
    const { error } = await supabase.from('promo_codes').insert({
      code,
      type: form.type,
      value,
      min_order: Number(form.min_order) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
    })

    if (error) {
      setCreateError(
        error.message.toLowerCase().includes('unique') ? `Code "${code}" already exists` : error.message
      )
    } else {
      setForm(EMPTY_FORM)
      setShowCreate(false)
      load()
    }
    setCreating(false)
  }

  const toggleActive = async (promo: PromoCode) => {
    setToggling(promo.id)
    await supabase
      .from('promo_codes')
      .update({ is_active: !promo.is_active })
      .eq('id', promo.id)
    await load()
    setToggling(null)
  }

  const isExpired = (expiresAt: string | null) =>
    !!expiresAt && new Date(expiresAt) < new Date()

  const usagePct = (promo: PromoCode) =>
    promo.max_uses ? Math.round((promo.used_count / promo.max_uses) * 100) : null

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{promos.length} code{promos.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => { setShowCreate((v) => !v); setCreateError('') }}
        >
          {showCreate ? (
            <><ChevronUp size={15} className="mr-1" />Cancel</>
          ) : (
            <><Plus size={15} className="mr-1" />New Code</>
          )}
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Create Promo Code</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                placeholder="e.g. MECHHO20"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <div className="flex gap-2">
                {(['flat', 'percent'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.type === t
                        ? 'bg-mechho-blue text-white border-mechho-blue'
                        : 'border-gray-200 text-gray-600 hover:border-mechho-blue'
                    }`}
                  >
                    {t === 'flat' ? '₹ Flat off' : '% Percent off'}
                  </button>
                ))}
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === 'flat' ? 'Discount Amount (₹)' : 'Discount (%)'}
              </label>
              <input
                type="number"
                placeholder={form.type === 'flat' ? 'e.g. 50' : 'e.g. 10'}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                min={1}
                max={form.type === 'percent' ? 100 : undefined}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition"
              />
            </div>

            {/* Min order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Order Value (₹) <span className="font-normal text-gray-400">(0 = no minimum)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 200"
                value={form.min_order}
                onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))}
                min={0}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition"
              />
            </div>

            {/* Max uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Uses <span className="font-normal text-gray-400">(leave blank = unlimited)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                min={1}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition"
              />
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires On <span className="font-normal text-gray-400">(leave blank = never)</span>
              </label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition"
              />
            </div>
          </div>

          {createError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {createError}
            </p>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating…' : 'Create Code'}
            </Button>
          </div>
        </div>
      )}

      {/* Promo codes list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Tag size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-500">No promo codes yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first code above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => {
            const expired = isExpired(promo.expires_at)
            const pct = usagePct(promo)
            const fullyUsed = promo.max_uses !== null && promo.used_count >= promo.max_uses
            const statusOk = promo.is_active && !expired && !fullyUsed

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  statusOk ? 'border-gray-200' : 'border-gray-100 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Code + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-mechho-blue text-base tracking-wide">
                        {promo.code}
                      </span>
                      <span className="text-xs bg-mechho-mustard/20 text-mechho-blue font-semibold px-2 py-0.5 rounded-full">
                        {promo.type === 'flat' ? `₹${promo.value} off` : `${promo.value}% off`}
                      </span>
                      {promo.min_order > 0 && (
                        <span className="text-xs text-gray-500">
                          min {formatPrice(promo.min_order)}
                        </span>
                      )}
                      {/* Status badge */}
                      {!promo.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                      {expired && (
                        <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Expired</span>
                      )}
                      {fullyUsed && (
                        <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">Fully used</span>
                      )}
                      {statusOk && (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check size={10} />Active
                        </span>
                      )}
                    </div>

                    {/* Usage + expiry */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span>
                        {promo.max_uses
                          ? `${promo.used_count} / ${promo.max_uses} uses`
                          : `${promo.used_count} uses (unlimited)`}
                      </span>
                      {promo.expires_at && (
                        <span>
                          Expires {new Date(promo.expires_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    {/* Usage bar */}
                    {pct !== null && (
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-48">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(promo)}
                    disabled={toggling === promo.id}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all ${
                      promo.is_active
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    } disabled:opacity-50`}
                  >
                    {toggling === promo.id ? '…' : promo.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
