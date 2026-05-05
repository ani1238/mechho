'use client'

import type { MenuItem } from '@/types'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

function getItemEmoji(item: MenuItem): string {
  const name = item.name.toLowerCase()
  const categoryName = item.category?.name ?? ''

  // Name-based overrides (evaluated top-down, first match wins)
  if (name.includes('prawn') || name.includes('prawns')) return '🦐'
  if (name.includes('onion ring')) return '🧅'
  if (name.includes('fries') || name.includes('french fries')) return '🍟'
  if (name.includes('veggie') || name.includes('onion')) return '🥗'

  // Category fallback
  switch (categoryName) {
    case 'Burgers':        return '🍔'
    case 'Snacks':         return '🐟'
    case 'Rice Bowls':     return '🍚'
    case 'Buckets':        return '🪣'
    case 'Combos':         return '🎊'
    case 'Salad':          return '🥗'
    case 'Accompaniments': return '🍽️'
    default:               return '🐟'
  }
}

interface ItemCardProps {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}

export default function ItemCard({ item, onAdd }: ItemCardProps) {
  const emoji = getItemEmoji(item)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 group">
      {/* Image / Emoji area */}
      <div className="relative bg-mechho-cream h-36 flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-300">
            {emoji}
          </span>
        )}

        {/* Bestseller badge */}
        {item.is_bestseller && (
          <span className="absolute top-2 left-2 bg-mechho-mustard text-mechho-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            ⭐ Bestseller
          </span>
        )}

        {/* Veg / Non-veg FSSAI-style indicator */}
        <span
          className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-sm border-2 bg-white"
          style={{ borderColor: item.is_veg ? '#2d7a4f' : '#e04f39' }}
          title={item.is_veg ? 'Vegetarian' : 'Non-vegetarian'}
        >
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.is_veg ? '#2d7a4f' : '#e04f39' }}
          />
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <h3 className="font-semibold text-mechho-blue text-sm leading-snug line-clamp-2">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 flex-1 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-1.5">
          <span className="font-bold text-mechho-blue text-base">
            {formatPrice(item.price)}
          </span>
          {item.is_available ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onAdd(item)}
              className="rounded-lg"
            >
              + Add
            </Button>
          ) : (
            <span className="text-xs text-gray-400 font-medium italic">Sold out</span>
          )}
        </div>
      </div>
    </div>
  )
}
