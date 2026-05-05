import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-mechho-blue text-white/70 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <span className="text-mechho-mustard font-extrabold text-xl">🐟 Mechho</span>
          <p className="mt-2 text-sm">
            Bengali fried fish — fast-food format. Bold flavours, honest cooking.
            Kismatpur, Hyderabad.
          </p>
          <p className="mt-2 text-xs text-white/40">
            FSSAI Reg: <span className="text-white/60">23626028002059</span>
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white text-sm mb-3">Quick links</h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/menu',     label: 'Menu' },
              { href: '/preorder', label: 'Pre-order / Party' },
              { href: '/survey',   label: 'Fish Survey' },
              { href: '/about',    label: 'About Us' },
              { href: '/contact',  label: 'Contact' },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-mechho-mustard transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white text-sm mb-3">Contact us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mechho-mustard"
              >
                💬 WhatsApp us
              </a>
            </li>
            <li>📍 Kismatpur, Hyderabad</li>
            <li>🕐 Mon–Sun · 11 AM – 10 PM</li>
          </ul>
          <p className="mt-4 text-xs text-white/40">
            © {new Date().getFullYear()} Mechho — Fish Fry Co. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
