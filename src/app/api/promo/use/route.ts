import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = createAdminClient()

    // Read current count then increment (atomic enough for a small food brand)
    const { data } = await supabase
      .from('promo_codes')
      .select('used_count')
      .eq('code', code)
      .single()

    if (data) {
      await supabase
        .from('promo_codes')
        .update({ used_count: (data.used_count ?? 0) + 1 })
        .eq('code', code)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
