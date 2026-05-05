import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('survey_responses')
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ response: data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/survey]', err)
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ responses: data })
}
