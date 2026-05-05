import { createClient } from '@/lib/supabase/server'
import type { Category, MenuItem } from '@/types'
import MenuClient from './MenuClient'

export const revalidate = 60 // refresh menu every 60 seconds

export default async function MenuPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('items')
    .select('*, category:categories(*)')
    .eq('is_available', true)
    .order('category_id')

  if (error) {
    console.error('Menu fetch error:', error)
  }

  const items = (data ?? []) as MenuItem[]

  // Derive ordered unique categories
  const seen = new Set<string>()
  const categories: Category[] = []
  for (const item of items) {
    if (item.category && !seen.has(item.category.id)) {
      seen.add(item.category.id)
      categories.push(item.category as Category)
    }
  }
  categories.sort((a, b) => a.sort_order - b.sort_order)

  return <MenuClient items={items} categories={categories} />
}
