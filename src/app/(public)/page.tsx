'use client'

import Link from 'next/link'
import { ArrowRight, Star, Clock, MapPin, Truck } from 'lucide-react'
import Button from '@/components/ui/Button'

const BESTSELLERS = [
  {
    name: 'Crispy Fish Fingers & Kasundi Dip',
    price: 179,
    tag: '⭐ Most Ordered',
    emoji: '🐟',
    desc: 'Golden-fried fish fingers with our signature kasundi mustard dip',
    isVeg: false,
  },
  {
    name: 'Fish Fry Rice Bowl',
    price: 249,
    tag: '🔥 Staff Pick',
    emoji: '🍚',
    desc: 'Crispy fried fish over steamed rice with house sauce — full meal',
    isVeg: false,
  },
  {
    name: 'Classic Fish Fry Mechho Bucket',
    price: 449,
    tag: '🪣 Best for Sharing',
    emoji: '🪣',
    desc: 'A bucket of perfectly fried fish pieces — perfect for 2-3 people',
    isVeg: false,
  },
  {
    name: 'Mechho Feast Combo - Large Order',
    price: 1099,
    tag: '🎉 Party Favourite',
    emoji: '🎊',
    desc: 'Our biggest combo — feeds 4-6 people. Perfect for family gatherings',
    isVeg: false,
  },
]

const FEATURES = [
  { icon: <Clock className="w-6 h-6" />, title: '30-45 min delivery', desc: 'Hot & fresh to your door' },
  { icon: <MapPin className="w-6 h-6" />, title: 'Kismatpur, Hyderabad', desc: 'Local home kitchen' },
  { icon: <Truck className="w-6 h-6" />, title: 'Free pickup', desc: 'Collect from our kitchen' },
  { icon: <Star className="w-6 h-6" />, title: 'Bengali recipes', desc: 'Authentic home flavours' },
]

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-mechho-blue via-mechho-blue-mid to-mechho-blue overflow-hidden">
        {/* Decorative wave */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-8 text-8xl">🐟</div>
          <div className="absolute bottom-8 right-8 text-8xl">🐠</div>
          <div className="absolute top-1/2 left-1/3 text-6xl">🎣</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center text-white">
          <div className="inline-block bg-mechho-mustard/20 border border-mechho-mustard/40 rounded-full px-4 py-1.5 text-mechho-mustard-lt text-sm font-medium mb-6">
            🏠 Home Kitchen · Kismatpur, Hyderabad
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            Bengali Fish,
            <br />
            <span className="text-mechho-mustard">Fast-Food Format</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10">
            Crispy fish fingers, rice bowls, burgers & buckets made with
            authentic Bengali recipes — straight from our home kitchen to your door.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Order Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/preorder">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-mechho-blue gap-2">
                🎉 Book a Feast
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-mechho-cream"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ── Features strip ───────────────────────────────────────────────── */}
      <section className="bg-mechho-cream py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-mechho-blue/10 flex items-center justify-center text-mechho-blue">
                {f.icon}
              </div>
              <p className="font-semibold text-mechho-blue text-sm">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bestsellers ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-mechho-blue">Our Bestsellers</h2>
            <p className="text-gray-500 mt-1">What everyone keeps coming back for</p>
          </div>
          <Link href="/menu" className="text-mechho-mustard font-semibold text-sm hover:underline hidden sm:block">
            See full menu →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BESTSELLERS.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group"
            >
              {/* Image placeholder */}
              <div className="bg-gradient-to-br from-mechho-blue/5 to-mechho-mustard/10 h-40 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                {item.emoji}
              </div>

              <div className="p-4">
                <span className="text-[10px] font-bold bg-mechho-mustard/15 text-mechho-blue px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
                <h3 className="font-bold text-mechho-blue mt-2 text-sm leading-snug">{item.name}</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-extrabold text-mechho-blue text-lg">₹{item.price}</span>
                  <Link href="/menu">
                    <Button size="sm">Add +</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/menu">
            <Button size="lg" variant="secondary" className="gap-2">
              View Full Menu <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Pre-order CTA ────────────────────────────────────────────────── */}
      <section className="bg-mechho-blue mx-4 mb-8 rounded-3xl overflow-hidden">
        <div className="max-w-4xl mx-auto px-8 py-12 text-center text-white">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-3xl font-extrabold mb-3">Planning a party or function?</h2>
          <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
            Book your feast for the next day. We take pre-orders starting ₹1500
            for gatherings, home parties, puja events and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/preorder">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Book a Pre-order <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP}?text=${encodeURIComponent('Hi Mechho! I want to discuss a bulk/party order 🎉')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-mechho-blue">
                💬 WhatsApp us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Survey Banner ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 mb-14">
        <div className="bg-gradient-to-r from-mechho-mustard/20 to-mechho-mustard/5 border border-mechho-mustard/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-mechho-blue">
              🐠 Tell us your fish preference!
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Help us decide what to add to the menu — take our 2-minute fish survey
              and get 10% off your next order.
            </p>
          </div>
          <Link href="/survey" className="shrink-0">
            <Button variant="secondary" className="gap-2 whitespace-nowrap">
              Take Survey <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
