'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import type { Category, MenuItem } from '@/types'
import ItemCard from '@/components/menu/ItemCard'

const ALL = 'All'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="bg-gray-200 h-36" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 rounded w-14" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

type VegFilter = 'all' | 'veg' | 'non-veg'

const VEG_FILTERS: { value: VegFilter; label: string; activeClass: string }[] = [
  { value: 'all',     label: 'All',       activeClass: 'bg-mechho-blue text-white border-mechho-blue' },
  { value: 'veg',     label: '🟢 Veg',    activeClass: 'bg-mechho-green text-white border-mechho-green' },
  { value: 'non-veg', label: '🔴 Non-veg', activeClass: 'bg-mechho-coral text-white border-mechho-coral' },
]

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [vegFilter, setVegFilter] = useState<VegFilter>('all')
  const [mounted, setMounted] = useState(false)

  const { addItem, totalItems, subtotal } = useCartStore()

  useEffect(() => {
    setMounted(true)
    const fetchMenu = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('items')
          .select('*, category:categories(*)')
          .order('category_id')

        if (error) throw error

        const menuItems = (data ?? []) as MenuItem[]
        setItems(menuItems)

        // Derive ordered unique categories from the items themselves
        const seen = new Set<string>()
        const cats: Category[] = []
        for (const item of menuItems) {
          if (item.category && !seen.has(item.category.id)) {
            seen.add(item.category.id)
            cats.push(item.category as Category)
          }
        }
        cats.sort((a, b) => a.sort_order - b.sort_order)
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load menu:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (selectedCategory !== ALL && item.category?.name !== selectedCategory) return false
        if (vegFilter === 'veg' && !item.is_veg) return false
        if (vegFilter === 'non-veg' && item.is_veg) return false
        return true
      }),
    [items, selectedCategory, vegFilter]
  )

  const cartCount = mounted ? totalItems() : 0
  const cartSubtotal = mounted ? subtotal() : 0

  return (
    <div className="min-h-screen bg-mechho-cream pb-32">
      {/* Hero banner */}
      <div className="bg-mechho-blue text-white py-12 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">🐟 Our Menu</h1>
        <p className="text-mechho-mustard-lt mt-2 text-sm sm:text-base">
          Fresh catches, Bengali home-style cooking
        </p>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100">
        {/* Category tabs — horizontal scroll, hidden scrollbar */}
        <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[ALL, ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-mechho-blue text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Veg / Non-veg toggle */}
        <div className="flex gap-2 px-4 pb-3">
          {VEG_FILTERS.map(({ value, label, activeClass }) => (
            <button
              key={value}
              onClick={() => setVegFilter(value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                vegFilter === value
                  ? activeClass
                  : 'border-gray-300 text-gray-500 hover:border-gray-400 bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-7xl mb-4 select-none">🍽️</span>
            <p className="text-xl font-bold text-mechho-blue">No items found</p>
            <p className="text-sm text-gray-500 mt-1">Try changing the filters above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onAdd={addItem} />
            ))}
          </div>
        )}
      </div>

      {/* Floating View Cart bar */}
      {mounted && cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-5 pointer-events-none animate-slide-up">
          <Link
            href="/cart"
            className="pointer-events-auto flex items-center justify-between bg-mechho-blue text-white rounded-2xl px-5 py-4 shadow-2xl hover:bg-mechho-blue-mid transition-colors max-w-lg mx-auto"
          >
            <div className="flex items-center gap-3">
              <span className="bg-mechho-mustard text-mechho-blue text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                {cartCount}
              </span>
              <span className="text-sm font-medium">
                {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-mechho-mustard">{formatPrice(cartSubtotal)}</span>
              <span className="text-white/70 text-sm">View Cart →</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
