import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | Mechho',
  robots: { index: false, follow: false },
}

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'

  if (!devBypass) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const ADMIN_EMAILS = ['anisumi1238@gmail.com', 'malicktaniya221@gmail.com']
    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      redirect('/admin/login')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
