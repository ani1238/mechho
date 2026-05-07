import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.trim().toUpperCase()
  const subtotal = Number(searchParams.get('subtotal') ?? 0)

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 })
  }
  if (!data.is_active) {
    return NextResponse.json({ error: 'This promo code is inactive' }, { status: 400 })
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 })
  }
  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return NextResponse.json({ error: 'This promo code has been fully used' }, { status: 400 })
  }
  if (subtotal < data.min_order) {
    return NextResponse.json(
      { error: `Minimum order of ₹${data.min_order} required to use this code` },
      { status: 400 }
    )
  }

  let discount = 0
  if (data.type === 'flat') {
    discount = Math.min(Number(data.value), subtotal)
  } else {
    discount = Math.round((subtotal * Number(data.value)) / 100)
  }

  return NextResponse.json({
    code: data.code,
    type: data.type,
    value: Number(data.value),
    discount,
  })
}
