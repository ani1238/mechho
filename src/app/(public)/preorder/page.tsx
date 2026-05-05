'use client'

import { useState, useMemo } from 'react'
import { getTomorrowDateString, isPreorderCutoffPassed } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/* ── Menu Data ────────────────────────────────────────────────────────────── */

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

const MENU_ITEMS: MenuItem[] = [
  // Burgers
  { id: 'peri-peri-fish-burger',   name: 'Peri Peri Fish Burger',             price: 219, category: 'Burgers' },
  { id: 'kolkata-fish-burger',     name: 'Kolkata Fish Burger',               price: 189, category: 'Burgers' },
  { id: 'fish-strips-burger',      name: 'Fish Strips Burger',                price: 199, category: 'Burgers' },
  { id: 'veggie-burger',           name: 'Veggie Burger',                     price: 199, category: 'Burgers' },
  // Snacks
  { id: 'crispy-fish-fingers',     name: 'Crispy Fish Fingers and Kasundi Dip', price: 179, category: 'Snacks' },
  { id: 'kolkata-fish-cutlet',     name: 'Kolkata Fish Cutlet',               price: 169, category: 'Snacks' },
  { id: 'golden-fish-bites',       name: 'Golden Fish Bites (Popcorn)',       price: 149, category: 'Snacks' },
  { id: 'butter-garlic-fish-roll', name: 'Butter Garlic Fish Roll',           price: 189, category: 'Snacks' },
  { id: 'kolkata-fish-kathi-roll', name: 'Kolkata Fish Kathi Roll',           price: 189, category: 'Snacks' },
  { id: 'golden-fried-prawns',     name: 'Golden Fried Prawns',               price: 200, category: 'Snacks' },
  { id: 'crispy-onion-rings',      name: 'Classic Crispy Onion Rings',        price: 109, category: 'Snacks' },
  { id: 'peri-peri-masala-fries',  name: 'Peri Peri Masala Fries',           price: 99,  category: 'Snacks' },
  { id: 'veggie-finger-fries',     name: 'Veggie Finger Fries',               price: 179, category: 'Snacks' },
  // Bowls
  { id: 'fish-paturi-bowl',        name: 'Fish Paturi Bowl',                  price: 239, category: 'Bowls' },
  { id: 'fish-fry-rice-bowl',      name: 'Fish Fry Rice Bowl',                price: 249, category: 'Bowls' },
  { id: 'fish-finger-rice-bowl',   name: 'Fish Finger Rice Bowl',             price: 239, category: 'Bowls' },
  { id: 'fish-popcorn-rice-bowl',  name: 'Fish Popcorn Rice Bowl',            price: 229, category: 'Bowls' },
  { id: 'fish-rava-fry-rice-bowl', name: 'Fish Rava Fry Rice Bowl',           price: 259, category: 'Bowls' },
  { id: 'fried-prawns-rice-bowl',  name: 'Fried Prawns Rice Bowl',            price: 299, category: 'Bowls' },
  { id: 'veggie-fingers-rice-bowl',name: 'Veggie Fingers Rice Bowl',          price: 219, category: 'Bowls' },
  // Buckets
  { id: 'classic-fish-fry-bucket', name: 'Classic Fish Fry Mechho Bucket',   price: 449, category: 'Buckets' },
  { id: 'rava-fry-bucket',         name: 'Rava Fry Bucket',                   price: 499, category: 'Buckets' },
  // Combos
  { id: 'solo-fish-combo',         name: 'Solo Fish Combo',                   price: 299, category: 'Combos' },
  { id: 'snacker-combo',           name: 'Snacker Combo',                     price: 229, category: 'Combos' },
  { id: 'adda-combo',              name: 'Adda Combo',                        price: 399, category: 'Combos' },
  { id: 'bari-combo',              name: 'Bari Combo',                        price: 799, category: 'Combos' },
  { id: 'mechho-feast-combo',      name: 'Mechho Feast Combo',                price: 1099, category: 'Combos' },
]

const CATEGORIES = ['Burgers', 'Snacks', 'Bowls', 'Buckets', 'Combos']
const MIN_ORDER = 1500

/* ── Types ────────────────────────────────────────────────────────────────── */
type SelectedItems = Record<string, number>

interface FormState {
  customer_name: string
  phone: string
  address: string
  pincode: string
  slot_time: 'lunch' | 'dinner'
  pax: number
  special_requests: string
  upi_ref: string
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function PreorderPage() {
  const tomorrowDate = getTomorrowDateString()
  const cutoffPassed = isPreorderCutoffPassed()
  const ownerWa = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? ''

  const [form, setForm] = useState<FormState>({
    customer_name: '',
    phone: '',
    address: '',
    pincode: '',
    slot_time: 'lunch',
    pax: 2,
    special_requests: '',
    upi_ref: '',
  })
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  /* Derived */
  const subtotal = useMemo(
    () =>
      Object.entries(selectedItems).reduce((sum, [id, qty]) => {
        const item = MENU_ITEMS.find((i) => i.id === id)
        return sum + (item ? item.price * qty : 0)
      }, 0),
    [selectedItems],
  )
  const selectedCount = Object.values(selectedItems).filter((q) => q > 0).length
  const advance = Math.ceil(subtotal / 2)

  /* Handlers */
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  function toggleItem(id: string) {
    setSelectedItems((prev) => {
      if (prev[id]) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: 1 }
    })
    if (errors.items) setErrors((e) => ({ ...e, items: '' }))
  }

  function updateQty(id: string, delta: number) {
    setSelectedItems((prev) => {
      const next = (prev[id] ?? 0) + delta
      if (next <= 0) {
        const copy = { ...prev }
        delete copy[id]
        return copy
      }
      return { ...prev, [id]: next }
    })
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required'
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number'
    if (!form.address.trim()) errs.address = 'Delivery address is required'
    if (!form.pincode.trim()) errs.pincode = 'Pincode is required'
    if (form.pax < 2) errs.pax = 'Minimum 2 people'
    if (selectedCount === 0) errs.items = 'Please select at least one item'
    if (subtotal < MIN_ORDER) errs.subtotal = `Minimum order is ₹${MIN_ORDER}`
    if (!form.upi_ref.trim()) errs.upi_ref = 'Enter the UTR after completing UPI payment'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const supabase = createClient()
    try {
      const notes = [
        cutoffPassed ? '[LATE ORDER — submitted after 8 PM cutoff]' : '',
        form.special_requests ? `Requests: ${form.special_requests}` : '',
        `Pax: ${form.pax}`,
      ]
        .filter(Boolean)
        .join(' | ')

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          type: 'preorder',
          status: 'pending_review',
          customer_name: form.customer_name,
          phone: form.phone,
          address: form.address,
          pincode: form.pincode,
          slot_date: tomorrowDate,
          slot_time: form.slot_time,
          subtotal,
          delivery_fee: 0,
          total: subtotal,
          payment_method: 'upi',
          payment_status: 'pending',
          upi_ref: form.upi_ref,
          notes,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = Object.entries(selectedItems).map(([itemId, qty]) => {
        const item = MENU_ITEMS.find((i) => i.id === itemId)!
        return { order_id: order.id, item_id: itemId, qty, unit_price: item.price, addons_json: [] }
      })

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      /* Open WhatsApp for owner */
      const itemLines = Object.entries(selectedItems)
        .map(([id, qty]) => {
          const item = MENU_ITEMS.find((i) => i.id === id)!
          return `• ${qty}× ${item.name} — ₹${item.price * qty}`
        })
        .join('\n')

      const waMsg = encodeURIComponent(
        `🐟 *New Pre-order — Mechho!*\n\n` +
          `👤 ${form.customer_name} | 📞 ${form.phone}\n` +
          `📅 ${tomorrowDate} · ${form.slot_time === 'lunch' ? '☀️ Lunch (12–3 PM)' : '🌙 Dinner (7–10 PM)'}\n` +
          `👥 ${form.pax} people | 📍 ${form.address}, ${form.pincode}\n\n` +
          `${itemLines}\n\n` +
          `💰 Total: ₹${subtotal} | UPI Advance: ₹${advance} | UTR: ${form.upi_ref}\n` +
          (form.special_requests ? `📝 ${form.special_requests}\n` : '') +
          `\nPlease confirm! 🙏`,
      )

      if (ownerWa) {
        window.open(`https://wa.me/${ownerWa}?text=${waMsg}`, '_blank')
      }

      setSuccessOrderId(order.id)
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Something went wrong. Please try again or WhatsApp us directly.' })
    } finally {
      setLoading(false)
    }
  }

  /* ── Success screen ───────────────────────────────────────────────────── */
  if (successOrderId) {
    const ref = successOrderId.slice(-6).toUpperCase()
    const waMsg = encodeURIComponent(
      `Hi Mechho! I just placed pre-order #${ref} — please confirm 🙏`,
    )
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10 text-center animate-slide-up border border-gray-100">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-2xl font-extrabold text-mechho-blue mb-2">Pre-order received!</h1>
          <p className="text-gray-500 text-sm mb-2">
            Order <span className="font-bold text-mechho-blue">#{ref}</span>
          </p>
          <p className="text-gray-600 mb-8">
            We'll WhatsApp you within 2 hours to confirm. Keep an eye on your messages!
          </p>
          <a
            href={`https://wa.me/${ownerWa}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button size="lg" className="w-full gap-2">
              💬 Chat with us on WhatsApp
            </Button>
          </a>
          <p className="text-xs text-gray-400 mt-4">
            Didn't hear back in 2 hours? WhatsApp us directly.
          </p>
        </div>
      </div>
    )
  }

  /* ── Main form ────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-mechho-blue">
          🎉 Pre-order for Tomorrow
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Delivery on{' '}
          <span className="font-semibold text-mechho-blue">{tomorrowDate}</span> · Minimum order
          ₹{MIN_ORDER}
        </p>
      </div>

      {/* Cutoff banner */}
      {cutoffPassed && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-amber-800">Pre-orders for tomorrow are closed.</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Come back before 8 PM. You can still submit — we'll treat it as a late order
              pending review and WhatsApp you.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Left: form fields ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-mechho-blue text-lg mb-4">📋 Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="customer_name"
                  label="Full Name *"
                  placeholder="Your name"
                  value={form.customer_name}
                  onChange={(e) => setField('customer_name', e.target.value)}
                  error={errors.customer_name}
                />
                <Input
                  id="phone"
                  label="Phone *"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
                  error={errors.phone}
                />
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Delivery Address *
                </label>
                <textarea
                  placeholder="House/flat number, street, area…"
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  rows={3}
                  className={`mt-1 w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition resize-none ${
                    errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-red-600 mt-1">{errors.address}</p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="pincode"
                  label="Pincode *"
                  inputMode="numeric"
                  placeholder="500000"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, ''))}
                  error={errors.pincode}
                />
                <div className="flex flex-col gap-1">
                  <label htmlFor="pax" className="text-sm font-medium text-gray-700">
                    Number of people *
                  </label>
                  <input
                    id="pax"
                    type="number"
                    min={2}
                    value={form.pax}
                    onChange={(e) => setField('pax', Math.max(2, Number(e.target.value)))}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition ${
                      errors.pax ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.pax && <p className="text-xs text-red-600">{errors.pax}</p>}
                </div>
              </div>
            </div>

            {/* Slot */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-mechho-blue text-lg mb-4">🕐 Delivery Slot</h2>
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    { value: 'lunch',  label: 'Lunch',  time: '12 PM – 3 PM',  emoji: '☀️' },
                    { value: 'dinner', label: 'Dinner', time: '7 PM – 10 PM', emoji: '🌙' },
                  ] as const
                ).map((slot) => (
                  <label
                    key={slot.value}
                    className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center gap-1.5 transition-all ${
                      form.slot_time === slot.value
                        ? 'border-mechho-mustard bg-mechho-mustard/10'
                        : 'border-gray-200 hover:border-mechho-mustard/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot_time"
                      value={slot.value}
                      checked={form.slot_time === slot.value}
                      onChange={() => setField('slot_time', slot.value)}
                      className="sr-only"
                    />
                    <span className="text-3xl">{slot.emoji}</span>
                    <span className="font-bold text-mechho-blue">{slot.label}</span>
                    <span className="text-xs text-gray-500">{slot.time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Item selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-mechho-blue text-lg mb-1">🍽️ Choose Your Items</h2>
              <p className="text-sm text-gray-500 mb-4">Select items and set quantities</p>

              {errors.items && (
                <p className="text-sm text-red-600 mb-3 flex items-center gap-1">
                  ⚠️ {errors.items}
                </p>
              )}
              {errors.subtotal && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-red-700">
                  ⚠️ {errors.subtotal}
                </div>
              )}

              <div className="space-y-7">
                {CATEGORIES.map((cat) => {
                  const items = MENU_ITEMS.filter((i) => i.category === cat)
                  return (
                    <div key={cat}>
                      <h3 className="font-extrabold text-xs text-mechho-blue uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
                        {cat}
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => {
                          const isSelected = !!selectedItems[item.id]
                          const qty = selectedItems[item.id] ?? 0
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
                                isSelected
                                  ? 'bg-mechho-blue/5 border border-mechho-blue/20'
                                  : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                              }`}
                            >
                              <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleItem(item.id)}
                                  className="w-4 h-4 accent-mechho-blue rounded shrink-0"
                                />
                                <span
                                  className={`text-sm truncate ${
                                    isSelected ? 'font-semibold text-mechho-blue' : 'text-gray-700'
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </label>

                              <div className="flex items-center gap-3 ml-2 shrink-0">
                                <span className="text-sm font-bold text-mechho-blue">
                                  ₹{item.price}
                                </span>
                                {isSelected && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateQty(item.id, -1)}
                                      className="w-7 h-7 rounded-lg bg-mechho-blue/10 text-mechho-blue font-bold text-base flex items-center justify-center hover:bg-mechho-blue/20 transition"
                                    >
                                      −
                                    </button>
                                    <span className="w-6 text-center text-sm font-bold text-mechho-blue">
                                      {qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateQty(item.id, 1)}
                                      className="w-7 h-7 rounded-lg bg-mechho-mustard text-mechho-blue font-bold text-base flex items-center justify-center hover:bg-mechho-mustard-lt transition"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Special requests */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-mechho-blue text-lg mb-4">📝 Special Requests</h2>
              <textarea
                placeholder="Any dietary needs, allergies or special instructions… (optional)"
                value={form.special_requests}
                onChange={(e) => setField('special_requests', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition resize-none"
              />
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-mechho-blue text-lg mb-1">
                💳 Advance Payment (50%)
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Pay 50% advance via UPI to confirm your pre-order. Balance due on delivery.
              </p>

              <div className="bg-mechho-mustard/10 border border-mechho-mustard/40 rounded-xl p-5 mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Pay via UPI to
                </p>
                <p className="text-2xl font-extrabold text-mechho-blue tracking-wide">
                  mechho@upi
                </p>
                {subtotal > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Advance amount:{' '}
                    <span className="font-extrabold text-mechho-blue text-lg">₹{advance}</span>
                    <span className="text-gray-400 text-xs ml-2">(50% of ₹{subtotal})</span>
                  </p>
                )}
              </div>

              <Input
                id="upi_ref"
                label="UTR / Transaction Reference Number *"
                placeholder="e.g. 424242424242"
                value={form.upi_ref}
                onChange={(e) => setField('upi_ref', e.target.value.trim())}
                error={errors.upi_ref}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Find the UTR in your UPI app's payment history after completing the transfer.
              </p>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {errors.submit}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading
                ? 'Placing order…'
                : `🎉 Place Pre-order${subtotal > 0 ? ` · ₹${subtotal}` : ''}`}
            </Button>
          </div>

          {/* ── Right: sticky summary ────────────────────────────────────── */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-24">
              <div className="bg-mechho-blue rounded-2xl text-white p-6 shadow-lg">
                <h2 className="font-bold text-lg mb-3">🧾 Order Summary</h2>
                <p className="text-xs text-white/50 mb-4">
                  📅 {tomorrowDate} ·{' '}
                  {form.slot_time === 'lunch' ? '☀️ Lunch (12–3 PM)' : '🌙 Dinner (7–10 PM)'}
                </p>

                {selectedCount === 0 ? (
                  <p className="text-white/40 text-sm py-6 text-center border border-white/10 rounded-xl">
                    No items selected yet
                  </p>
                ) : (
                  <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(selectedItems).map(([id, qty]) => {
                      const item = MENU_ITEMS.find((i) => i.id === id)!
                      return (
                        <li key={id} className="flex justify-between text-sm gap-2">
                          <span className="text-white/80 truncate">
                            {qty}× {item.name}
                          </span>
                          <span className="font-semibold shrink-0">₹{item.price * qty}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}

                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Subtotal</span>
                    <span className="font-extrabold text-xl text-mechho-mustard">
                      ₹{subtotal}
                    </span>
                  </div>
                  {advance > 0 && (
                    <div className="flex justify-between items-center text-xs text-white/60">
                      <span>50% advance due now</span>
                      <span>₹{advance}</span>
                    </div>
                  )}

                  {subtotal > 0 && subtotal < MIN_ORDER && (
                    <div className="mt-2 bg-amber-400/20 border border-amber-400/30 rounded-xl px-3 py-2 text-xs text-amber-300">
                      ⚠️ Add ₹{MIN_ORDER - subtotal} more to reach minimum (₹{MIN_ORDER})
                    </div>
                  )}
                  {subtotal >= MIN_ORDER && (
                    <div className="mt-2 bg-mechho-green/20 border border-mechho-green/30 rounded-xl px-3 py-2 text-xs text-green-300">
                      ✅ Minimum order met!
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 text-xs text-white/40 space-y-1">
                  <p>• Free delivery for pre-orders</p>
                  <p>• Confirm via WhatsApp within 2 hrs</p>
                  <p>
                    • UPI:{' '}
                    <span className="text-mechho-mustard font-semibold">mechho@upi</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
