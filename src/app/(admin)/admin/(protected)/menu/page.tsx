'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MenuItem, Category } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { Leaf, Star, AlertCircle, Search, Check, Pencil, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemWithCategory = MenuItem & { category: Category | null }

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
  color = 'green',
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  color?: 'green' | 'yellow'
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mechho-blue/40 disabled:opacity-50 disabled:cursor-not-allowed',
        checked
          ? color === 'yellow'
            ? 'bg-mechho-mustard'
            : 'bg-mechho-green'
          : 'bg-gray-200',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onToggleAvailable,
  onToggleBestseller,
  onPriceSave,
  updating,
}: {
  item: ItemWithCategory
  onToggleAvailable: (id: string) => void
  onToggleBestseller: (id: string) => void
  onPriceSave: (id: string, price: number) => Promise<void>
  updating: string | null
}) {
  const [editPrice, setEditPrice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setEditPrice(item.price.toString())
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const savePrice = async () => {
    if (editPrice === null) return
    const val = parseFloat(editPrice)
    if (isNaN(val) || val <= 0) {
      setEditPrice(null)
      return
    }
    setSaving(true)
    await onPriceSave(item.id, val)
    setSaving(false)
    setEditPrice(null)
  }

  const busy = updating === item.id

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0',
        !item.is_available && 'opacity-50',
      )}
    >
      {/* Veg/Non-veg dot */}
      <div
        className={cn(
          'w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center',
          item.is_veg ? 'border-mechho-green' : 'border-red-500',
        )}
      >
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            item.is_veg ? 'bg-mechho-green' : 'bg-red-500',
          )}
        />
      </div>

      {/* Name + tags */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm truncate">{item.name}</span>
          {item.is_bestseller && (
            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-mechho-mustard/15 text-yellow-700 rounded font-medium">
              <Star size={10} fill="currentColor" />
              Best
            </span>
          )}
          {item.is_veg && (
            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded font-medium">
              <Leaf size={10} />
              Veg
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
        )}
      </div>

      {/* Price — inline edit */}
      <div className="flex-shrink-0 w-28">
        {editPrice !== null ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">₹</span>
            <input
              ref={inputRef}
              type="number"
              min={1}
              step={0.01}
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') savePrice()
                if (e.key === 'Escape') setEditPrice(null)
              }}
              onBlur={savePrice}
              className="w-16 px-2 py-1 text-sm border border-mechho-blue rounded-lg focus:outline-none focus:ring-1 focus:ring-mechho-blue"
            />
            {saving ? (
              <span className="w-4 h-4 border border-mechho-blue border-t-transparent rounded-full animate-spin" />
            ) : (
              <button
                onClick={() => setEditPrice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 group text-sm font-semibold text-gray-900 hover:text-mechho-blue transition-colors"
            title="Click to edit price"
          >
            {formatPrice(item.price)}
            <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
          </button>
        )}
      </div>

      {/* Availability toggle */}
      <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
        <Toggle
          checked={item.is_available}
          onChange={() => onToggleAvailable(item.id)}
          disabled={busy}
          color="green"
        />
        <span className="text-xs text-gray-400">{item.is_available ? 'On' : 'Off'}</span>
      </div>

      {/* Bestseller toggle */}
      <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
        <Toggle
          checked={item.is_bestseller}
          onChange={() => onToggleBestseller(item.id)}
          disabled={busy}
          color="yellow"
        />
        <span className="text-xs text-gray-400">Best</span>
      </div>

      {/* Busy spinner */}
      {busy && (
        <div className="w-4 h-4 border-2 border-mechho-blue border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const [items, setItems] = useState<ItemWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)

  const supabase = useRef(createClient()).current

  const fetchItems = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('items')
      .select('*, category:categories(id, name, sort_order, image_url)')
      .order('name')

    if (err) {
      setError(err.message)
    } else {
      setItems((data ?? []) as ItemWithCategory[])
      setError(null)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleToggleAvailable = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    setUpdating(id)
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_available: !i.is_available } : i)),
    )
    await supabase.from('items').update({ is_available: !item.is_available }).eq('id', id)
    setUpdating(null)
  }

  const handleToggleBestseller = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    setUpdating(id)
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_bestseller: !i.is_bestseller } : i)),
    )
    await supabase.from('items').update({ is_bestseller: !item.is_bestseller }).eq('id', id)
    setUpdating(null)
  }

  const handlePriceSave = async (id: string, price: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, price } : i)))
    const { error: err } = await supabase.from('items').update({ price }).eq('id', id)
    if (!err) {
      setSavedId(id)
      setTimeout(() => setSavedId(null), 2000)
    } else {
      fetchItems()
    }
  }

  // Group by category
  const filtered = items.filter(
    (i) =>
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.name.toLowerCase().includes(search.toLowerCase()),
  )

  const grouped = filtered.reduce<Record<string, ItemWithCategory[]>>((acc, item) => {
    const cat = item.category?.name ?? 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const categoryOrder = [
    ...new Set(
      items
        .slice()
        .sort((a, b) => (a.category?.sort_order ?? 99) - (b.category?.sort_order ?? 99))
        .map((i) => i.category?.name ?? 'Uncategorized'),
    ),
  ]

  const sortedCategories = categoryOrder.filter((c) => grouped[c])

  const totalItems = items.length
  const availableItems = items.filter((i) => i.is_available).length
  const unavailableItems = totalItems - availableItems

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {availableItems}/{totalItems} items available
            {unavailableItems > 0 && (
              <span className="ml-2 text-orange-500 font-medium">· {unavailableItems} unavailable</span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/30 w-52"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-mechho-green bg-mechho-green/20" />
          Veg
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-red-500 bg-red-100" />
          Non-veg
        </span>
        <span className="flex items-center gap-1.5 ml-4">
          <span className="text-mechho-green font-medium">Toggle</span> = Availability
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-yellow-600 font-medium">Toggle</span> = Bestseller
        </span>
        <span className="flex items-center gap-1.5">
          <Pencil size={12} className="text-gray-400" /> Click price to edit
        </span>
      </div>

      {/* Save confirmation toast */}
      {savedId && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-slide-up">
          <Check size={16} />
          Price updated
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Items by category */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-10 bg-gray-50 border-b border-gray-100 animate-pulse" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-14 border-b border-gray-100 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : sortedCategories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p>No items found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((cat) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{cat}</h2>
                <span className="text-xs text-gray-400">{grouped[cat].length} items</span>
              </div>

              {/* Column headers — desktop only */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 border-b border-gray-100 text-xs text-gray-400 font-medium">
                <div className="w-4" />
                <div className="flex-1">Name</div>
                <div className="w-28">Price</div>
                <div className="w-16 text-center">Available</div>
                <div className="w-16 text-center">Bestseller</div>
              </div>

              {/* Items */}
              {grouped[cat].map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggleAvailable={handleToggleAvailable}
                  onToggleBestseller={handleToggleBestseller}
                  onPriceSave={handlePriceSave}
                  updating={updating}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
