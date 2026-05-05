'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  ShoppingBag,
  Calendar,
  Utensils,
  BarChart2,
  Users,
  Menu,
  X,
  LogOut,
  Fish,
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/preorders', label: 'Pre-orders', icon: Calendar },
  { href: '/admin/menu', label: 'Menu', icon: Utensils },
  { href: '/admin/survey', label: 'Survey Results', icon: BarChart2 },
  { href: '/admin/customers', label: 'Customers', icon: Users },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full bg-mechho-blue">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-mechho-mustard flex items-center justify-center flex-shrink-0 shadow-sm">
            <Fish className="text-mechho-blue" size={19} />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Mechho</p>
            <p className="text-white/50 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-mechho-mustard text-mechho-blue shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10',
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut size={17} className="flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 h-full flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-mechho-blue h-14 flex items-center px-4 gap-3 shadow-lg">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Fish className="text-mechho-mustard" size={18} />
          <span className="text-white font-bold text-base">Mechho Admin</span>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
                aria-label="Close navigation"
              >
                <X size={22} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
