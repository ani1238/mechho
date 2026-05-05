import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, MenuItem, Addon } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: MenuItem, addons?: Addon[]) => void
  removeItem: (itemId: string) => void
  updateQty: (itemId: string, qty: number) => void
  clearCart: () => void
  subtotal: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, addons = []) => {
        set((state) => {
          const existing = state.items.find((ci) => ci.item.id === item.id)
          if (existing) {
            return {
              items: state.items.map((ci) =>
                ci.item.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci
              ),
            }
          }
          return { items: [...state.items, { item, qty: 1, selected_addons: addons }] }
        })
      },

      removeItem: (itemId) => {
        set((state) => ({ items: state.items.filter((ci) => ci.item.id !== itemId) }))
      },

      updateQty: (itemId, qty) => {
        if (qty <= 0) {
          get().removeItem(itemId)
          return
        }
        set((state) => ({
          items: state.items.map((ci) =>
            ci.item.id === itemId ? { ...ci, qty } : ci
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce((acc, ci) => {
          const addonTotal = ci.selected_addons.reduce((a, ad) => a + ad.price, 0)
          return acc + (ci.item.price + addonTotal) * ci.qty
        }, 0),

      totalItems: () => get().items.reduce((acc, ci) => acc + ci.qty, 0),
    }),
    { name: 'mechho-cart' }
  )
)
