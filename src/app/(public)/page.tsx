'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Clock, MapPin, ShieldCheck, ChefHat } from 'lucide-react'
import Button from '@/components/ui/Button'

const BESTSELLERS = [
  {
    name: 'Crispy Fish Fingers & Kasundi Dip',
    price: 179,
    tag: 'Most Ordered',
    image: '/images/menu/fish-fingers-kasundi.jpg',
    desc: 'Golden-fried fish fingers served with our signature Bengali kasundi mustard dip.',
  },
  {
    name: 'Fish Fry Rice Bowl',
    price: 249,
    tag: 'Staff Pick',
    image: '/images/menu/fish-finger-rice-bowl.jpg',
    desc: 'A hearty bowl of crispy fried fish over steamed rice with house sauce.',
  },
  {
    name: 'Peri Peri Fish Burger',
    price: 219,
    tag: 'Fan Favourite',
    image: '/images/menu/peri-peri-fish-burger.jpg',
    desc: 'Spicy peri peri crispy fish patty in a toasted bun with house slaw.',
  },
  {
    name: 'Mechho Feast Combo',
    price: 1099,
    tag: 'Best for Parties',
    image: '/images/menu/adda-combo.jpg',
    desc: 'Our biggest combo — feeds 4–6 people. Perfect for family get-togethers.',
  },
]

const FEATURES = [
  { icon: <ChefHat className="w-5 h-5" />,     title: 'Made Fresh Daily',     desc: 'Cooked to order at Kismatpur' },
  { icon: <Clock className="w-5 h-5" />,        title: '30–45 min Delivery', desc: 'Hot & crispy to your doorstep' },
  { icon: <ShieldCheck className="w-5 h-5" />,  title: 'FSSAI Licensed',     desc: 'Certified safe & hygienic' },
  { icon: <Star className="w-5 h-5" />,         title: 'Bengali Recipes',    desc: 'Authentic flavours, generations old' },
]

export default function HomePage() {
  return (
    <div className="animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-mechho-mustard via-mechho-mustard-lt to-[#f9d97a] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 flex flex-col lg:flex-row items-center gap-12">

          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-mechho-blue text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              Mechho · Kismatpur, Hyderabad
            </span>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-mechho-blue leading-[1.1] tracking-tight mb-5">
              Bengali Fish,<br />
              <span className="text-white drop-shadow-sm">Fast-Food Done Right.</span>
            </h1>

            <p className="text-mechho-blue/80 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Crispy fish fingers, rice bowls, burgers and buckets —
              crafted with authentic Bengali recipes. Bold flavours. Honest cooking.
              No Zomato. No commission. Order direct.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/menu">
                <Button size="lg" className="w-full sm:w-auto bg-mechho-blue hover:bg-mechho-blue/90 text-white gap-2 shadow-lg">
                  Order Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/preorder">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-mechho-blue text-mechho-blue hover:bg-mechho-blue hover:text-white gap-2">
                  Book a Party Feast
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['🧑', '👩', '🧔', '👨'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-mechho-mustard flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <p className="text-mechho-blue text-sm font-medium">
                <span className="font-extrabold">200+</span> happy orders delivered
              </p>
            </div>
          </div>

          {/* Right — hero image */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96">
              <div className="absolute inset-0 rounded-full bg-white/30 blur-2xl" />
              <Image
                src="/images/mechho-logo.jpg"
                alt="Mechho — Bengali Fried Fish Brand"
                fill
                className="object-cover rounded-full border-4 border-white shadow-2xl relative z-10"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Features strip ───────────────────────────────────────────────── */}
      <section className="bg-mechho-blue py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-mechho-mustard/20 flex items-center justify-center text-mechho-mustard-lt shrink-0 mt-0.5">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{f.title}</p>
                <p className="text-white/55 text-xs mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bestsellers ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-mechho-mustard text-xs font-bold uppercase tracking-widest mb-1">What we do best</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-mechho-blue">Our Bestsellers</h2>
          </div>
          <Link href="/menu" className="text-mechho-mustard font-semibold text-sm hover:underline hidden sm:flex items-center gap-1">
            Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BESTSELLERS.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-mechho-mustard text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                  {item.tag}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-mechho-blue text-sm leading-snug">{item.name}</h3>
                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{item.desc}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-extrabold text-mechho-blue text-xl">₹{item.price}</span>
                  <Link href="/menu">
                    <button className="bg-mechho-mustard hover:bg-mechho-mustard-lt text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                      Order →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/menu">
            <Button size="lg" className="bg-mechho-blue hover:bg-mechho-blue/90 text-white gap-2">
              See Full Menu <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Pre-order CTA ────────────────────────────────────────────────── */}
      <section className="bg-mechho-mustard-bg border-y border-mechho-mustard/20 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-mechho-mustard text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            Pre-orders · Minimum ₹1,500
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-mechho-blue mb-4">
            Planning a party or function?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Book your feast for the next day. We cater for home parties, pujas, office gatherings
            and family events — with bulk pricing and guaranteed freshness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/preorder">
              <Button size="lg" className="w-full sm:w-auto bg-mechho-blue hover:bg-mechho-blue/90 text-white gap-2 shadow-md">
                Book a Pre-order <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a
              href="https://wa.me/919938100944?text=Hi%20Mechho!%20I%20want%20to%20discuss%20a%20bulk%20order"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-mechho-blue text-mechho-blue hover:bg-mechho-blue hover:text-white">
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Survey Banner ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-mechho-blue rounded-2xl p-7 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-mechho-mustard-lt text-xs font-bold uppercase tracking-widest mb-2">2-minute survey</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
              Tell us your fish preferences
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Help shape our menu — which fish, which prep style, what quantity.
              Participants get <span className="text-mechho-mustard-lt font-semibold">10% off</span> their next order.
            </p>
          </div>
          <Link href="/survey" className="shrink-0">
            <Button className="bg-mechho-mustard hover:bg-mechho-mustard-lt text-white gap-2 whitespace-nowrap shadow-md">
              Take the Survey <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}

