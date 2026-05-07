import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/admin/orders'

  const successRedirect = NextResponse.redirect(`${origin}${next}`)
  const errorRedirect = NextResponse.redirect(`${origin}/admin/login?error=auth_callback_failed`)

  // Build a Supabase client that writes cookies directly onto the redirect response
  function makeClient(response: NextResponse) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
  }

  if (token_hash && type) {
    // Magic link / OTP flow
    const { error } = await makeClient(successRedirect).auth.verifyOtp({
      token_hash,
      type: type as any,
    })
    if (!error) return successRedirect
  }

  if (code) {
    // OAuth / PKCE flow
    const { error } = await makeClient(successRedirect).auth.exchangeCodeForSession(code)
    if (!error) return successRedirect
  }

  // Something went wrong — back to login with error
  return errorRedirect
}
