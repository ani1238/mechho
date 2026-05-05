import Link from 'next/link'
import Button from '@/components/ui/Button'

const PILLARS = [
  {
    emoji: '🐟',
    title: 'Authentic Bengali recipes',
    desc: 'Passed down through generations — every dish carries the deep, bold flavour of authentic Bengali fish cooking.',
  },
  {
    emoji: '⚡',
    title: 'Fast-food format, no compromise',
    desc: 'The speed and convenience of fast food, with the soul of Bengali cuisine. We never cut corners on flavour.',
  },
  {
    emoji: '📈',
    title: 'Built to scale',
    desc: 'Starting in Kismatpur, Hyderabad — with eyes on multiple outlets across the city and beyond.',
  },
]

const PROMISES = [
  {
    emoji: '🧼',
    title: 'Highest hygiene standards',
    desc: 'Our kitchen follows strict food safety norms. We clean, sanitise and inspect daily.',
  },
  {
    emoji: '🌿',
    title: 'Fresh ingredients, daily',
    desc: 'We source our fish and produce fresh every morning — no frozen shortcuts.',
  },
  {
    emoji: '📜',
    title: 'FSSAI licensed',
    desc: 'Reg. No: 23626028002059 · Valid till 01-Apr-2027 · Issued by FSSAI, Govt of Telangana.',
  },
]

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-mechho-blue via-mechho-blue-mid to-mechho-blue overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-6 left-6 text-7xl">🐟</div>
          <div className="absolute bottom-6 right-6 text-7xl">🍚</div>
          <div className="absolute top-1/2 right-1/4 text-5xl">🐠</div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center text-white">
          <span className="inline-block bg-mechho-mustard/20 border border-mechho-mustard/40 rounded-full px-4 py-1.5 text-mechho-mustard-lt text-sm font-medium mb-6">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-5">
            Bengali fried fish,
            <br />
            <span className="text-mechho-mustard">built into a brand.</span>
          </h1>
          <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Mechho started with a simple idea — take the bold, soulful flavours of authentic Bengali
            fish cooking and bring them into a modern fast-food format. We are building the fried fish
            brand that Bengal deserves — starting in Hyderabad, expanding everywhere.
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-mechho-cream"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
        />
      </section>

      {/* ── What makes us Mechho ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-mechho-blue">What makes us Mechho</h2>
          <p className="text-gray-500 mt-2">Three things we never compromise on.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
            >
              <span className="text-5xl">{p.emoji}</span>
              <h3 className="font-bold text-mechho-blue text-lg">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Promise ──────────────────────────────────────────────────── */}
      <section className="bg-mechho-blue/5 border-y border-mechho-blue/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-mechho-blue">Our Promise to You</h2>
            <p className="text-gray-500 mt-2">Every order, every time.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PROMISES.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-6 flex gap-4 shadow-sm border border-gray-100"
              >
                <span className="text-3xl shrink-0">{p.emoji}</span>
                <div>
                  <h3 className="font-bold text-mechho-blue mb-1">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-extrabold text-mechho-blue mb-10">Our first outlet</h2>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-mechho-mustard/20 to-mechho-blue/10 flex items-center justify-center text-6xl border-4 border-mechho-mustard/30">
            🐟
          </div>
          <h3 className="font-extrabold text-mechho-blue text-xl">Mechho — Outlet 01</h3>
          <p className="text-gray-500 max-w-sm text-sm leading-relaxed italic">
            "We cook every dish fresh, to order. No freezer shortcuts — just bold Bengali flavours every time."
          </p>
          <p className="text-gray-400 text-xs">📍 Kismatpur, Hyderabad</p>
        </div>
      </section>

      {/* ── Zomato CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-[#e23744]/10 to-[#e23744]/5 border border-[#e23744]/30 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-mechho-blue">
              🍽️ Find us on Zomato
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Order on Zomato for quick delivery — or pre-order directly with us for the best price.
            </p>
          </div>
          <a
            href="https://www.zomato.com/hyderabad/mechho"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="secondary" className="gap-2 whitespace-nowrap">
              View on Zomato →
            </Button>
          </a>
        </div>
      </section>

      {/* ── Pre-order CTA ────────────────────────────────────────────────── */}
      <section className="bg-mechho-blue mx-4 mb-12 rounded-3xl overflow-hidden">
        <div className="max-w-3xl mx-auto px-8 py-12 text-center text-white">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-extrabold mb-2">Planning something special?</h2>
          <p className="text-white/70 mb-7 text-sm max-w-md mx-auto">
            Book a pre-order for your next party, puja or family gathering. Minimum ₹1500.
          </p>
          <Link href="/preorder">
            <Button size="lg" className="gap-2">
              Book a Pre-order →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
