import Link from 'next/link'
import Button from '@/components/ui/Button'

const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? '919999999999'
const OWNER_PHONE = process.env.NEXT_PUBLIC_OWNER_PHONE ?? OWNER_WHATSAPP

const CONTACT_CARDS = [
  {
    emoji: '📞',
    label: 'Call us',
    value: `+${OWNER_PHONE}`,
    href: `tel:+${OWNER_PHONE}`,
    cta: 'Call now',
  },
  {
    emoji: '💬',
    label: 'WhatsApp',
    value: 'Chat directly',
    href: `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent('Hi Mechho! I have a question 🐟')}`,
    cta: 'Open WhatsApp',
    external: true,
  },
  {
    emoji: '📍',
    label: 'Address',
    value: 'Kismatpur, Hyderabad',
    href: 'https://maps.google.com/?q=Kismatpur,Hyderabad',
    cta: 'Open Maps',
    external: true,
  },
  {
    emoji: '🕐',
    label: 'Hours',
    value: 'Mon – Sun · 11 AM – 10 PM',
    href: null,
    cta: null,
  },
]

export default function ContactPage() {
  return (
    <div className="animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-mechho-blue to-mechho-blue-mid py-14 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-4 left-8 text-7xl">🐟</div>
          <div className="absolute bottom-4 right-8 text-5xl">💬</div>
        </div>
        <div className="relative max-w-2xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Get in touch 🐟
          </h1>
          <p className="text-white/70 text-lg">
            We're always happy to help — whether it's a question, a bulk order or just a chat
            about fish.
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-mechho-cream"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
        />
      </section>

      {/* ── Contact Cards ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_CARDS.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
            >
              <span className="text-4xl">{card.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="font-bold text-mechho-blue mt-1 text-sm">{card.value}</p>
              </div>
              {card.href && card.cta && (
                <a
                  href={card.href}
                  {...(card.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="mt-auto"
                >
                  <Button size="sm" variant="outline">
                    {card.cta}
                  </Button>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Party Order CTA ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="bg-gradient-to-r from-mechho-mustard/20 to-mechho-mustard/5 border-2 border-mechho-mustard/40 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-block bg-mechho-mustard text-mechho-blue text-xs font-bold px-3 py-1 rounded-full mb-3">
              🎉 PARTY ORDER
            </span>
            <h3 className="text-xl font-extrabold text-mechho-blue">
              Want to book a party order?
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Pre-order a feast for your next family gathering, puja or celebration. Minimum ₹1500.
              We'll WhatsApp you to confirm within 2 hours.
            </p>
          </div>
          <Link href="/preorder" className="shrink-0">
            <Button size="lg" className="gap-2 whitespace-nowrap">
              Book a Pre-order →
            </Button>
          </Link>
        </div>
      </section>

      {/* ── WhatsApp Direct ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">💬</span>
            <div>
              <p className="font-bold text-mechho-blue">Prefer to chat directly?</p>
              <p className="text-sm text-gray-500">
                Message us on WhatsApp for quick answers, menu queries or order changes.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent('Hi Mechho! 🐟 I have a question about my order.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="secondary" className="gap-2 whitespace-nowrap">
              💬 WhatsApp us
            </Button>
          </a>
        </div>
      </section>

      {/* ── Google Map ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-extrabold text-mechho-blue mb-5 text-center">
          📍 Find us in Kismatpur
        </h2>
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            src="https://maps.google.com/maps?q=Kismatpur,Hyderabad&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mechho Kitchen — Kismatpur, Hyderabad"
          />
        </div>
        <p className="text-center text-gray-500 text-sm mt-3">
          📍 Kismatpur, Hyderabad · 🕐 Mon–Sun · 11 AM – 10 PM
        </p>
      </section>
    </div>
  )
}
