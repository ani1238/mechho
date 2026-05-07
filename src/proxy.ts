import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Dev bypass — set NEXT_PUBLIC_DEV_BYPASS_AUTH=true in .env.local to skip auth locally
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') {
    return NextResponse.next({ request })
  }

  // Let auth callback through — it sets the session cookie
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const ADMIN_EMAILS = ['anisumi1238@gmail.com', 'malicktaniya221@gmail.com']
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email ?? '')

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in admins away from login page
  if (request.nextUrl.pathname === '/admin/login' && isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/orders'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/auth/callback'],
}

