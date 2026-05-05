'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import type { Category, MenuItem } from '@/types'
import ItemCard from '@/components/menu/ItemCard'

type VegFilter = 'all' | 'veg' | 'non-veg'

const VEG_FILTERS: { value: VegFilter; label: string; activeClass: string }[] = [
  { value: 'all',     label: 'All',        activeClass: 'bg-mechho-blue text-white border-mechho-blue' },
  { value: 'veg',     label: '🟢 Veg',     activeClass: 'bg-mechho-green text-white border-mechho-green' },
  { value: 'non-veg', label: '🔴 Non-veg', activeClass: 'bg-mechho-coral text-white border-mechho-coral' },
]

export default function MenuClient({
  items,
  categories,
}: {
  items: MenuItem[]
  categories: Category[]
}) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [vegFilter, setVegFilter] = useState<VegFilter>('all')

  const { addItem, totalItems, subtotal } = useCartStore()
  const cartCount = totalItems()
  const cartSubtotal = subtotal()

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (selectedCategory !== 'All' && item.category?.name !== selectedCategory) return false
        if (vegFilter === 'veg' && !item.is_veg) return false
        if (vegFilter === 'non-veg' && item.is_veg) return false
        return true
      }),
    [items, selectedCategory, vegFilter]
  )

  return (
    <div className="min-h-screen bg-mechho-cream pb-32">
      {/* Hero banner */}
      <div className="bg-mechho-blue text-white py-12 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">🐟 Our Menu</h1>
        <p className="mt-2 text-sm sm:text-base opacity-80">
          Fresh catches, Bengali home-style cooking
        </p>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100">
        <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {['All', ...categories.map((c) => c.name)].map((cat) => (
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
        {filteredItems.length === 0 ? (
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

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-5">
          <Link
            href="/cart"
            className="flex items-center justify-between bg-mechho-blue text-white rounded-2xl px-5 py-4 shadow-2xl hover:opacity-90 transition-opacity max-w-lg mx-auto"
          >
            <div className="flex items-center gap-3">
              <span className="bg-mechho-mustard text-mechho-blue text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
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
