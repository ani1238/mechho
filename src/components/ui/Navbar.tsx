'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/menu',     label: 'Menu' },
  { href: '/preorder', label: 'Pre-order 🎉' },
  { href: '/survey',   label: 'Fish Survey' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.totalItems())
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-mechho-blue shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-mechho-mustard font-extrabold text-2xl tracking-tight">
            🐟 Mechho
          </span>
          <span className="text-white/60 text-xs font-medium hidden sm:block">
            Home Kitchen
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === l.href
                  ? 'text-mechho-mustard'
                  : 'text-white/80 hover:text-mechho-mustard-lt'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Cart + mobile burger */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative p-2 text-white hover:text-mechho-mustard transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-mechho-coral text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden bg-mechho-blue border-t border-white/10 px-4 pb-4 flex flex-col gap-3 animate-slide-up">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                'py-2 text-sm font-medium border-b border-white/10',
                pathname === l.href ? 'text-mechho-mustard' : 'text-white/80'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
