'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/menu',     label: 'Menu' },
  { href: '/preorder', label: 'Pre-order' },
  { href: '/survey',   label: 'Fish Survey' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.totalItems())
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-mechho-mustard/20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/mechho-logo.jpg"
            alt="Mechho"
            width={44}
            height={44}
            className="rounded-full object-cover border-2 border-mechho-mustard"
          />
          <div className="leading-tight">
            <span className="font-extrabold text-mechho-blue text-lg tracking-tight block">
              Mechho
            </span>
            <span className="text-mechho-mustard text-[10px] font-semibold uppercase tracking-widest block -mt-0.5">
              Fried Fish · Kismatpur, Hyd
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium transition-colors pb-0.5 border-b-2',
                pathname === l.href
                  ? 'text-mechho-mustard border-mechho-mustard'
                  : 'text-gray-600 hover:text-mechho-blue border-transparent hover:border-mechho-mustard/40'
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
            className="relative p-2 text-mechho-blue hover:text-mechho-mustard transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-mechho-mustard text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-mechho-blue"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 flex flex-col gap-1 animate-slide-up">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                'py-3 text-sm font-medium border-b border-gray-100',
                pathname === l.href ? 'text-mechho-mustard font-semibold' : 'text-gray-700'
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
