import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, session_id, ...rest } = body as Record<string, any>

    if (!type || !session_id) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (type === 'cart_add') {
      const { item_id, item_name, price } = rest
      if (!item_name) return NextResponse.json({ ok: false }, { status: 400 })
      await supabase.from('cart_events').insert({ session_id, item_id, item_name, price })
    } else if (type === 'page_view') {
      const { page } = rest
      if (!page) return NextResponse.json({ ok: false }, { status: 400 })
      await supabase.from('page_views').insert({ session_id, page })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
