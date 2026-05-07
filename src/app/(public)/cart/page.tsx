'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, MapPin } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, generateWhatsAppOrderMessage } from '@/lib/utils'
import type { ServicePincode } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { MapLocationResult } from '@/components/ui/MapPinPicker'

const MapPinPicker = dynamic(() => import('@/components/ui/MapPinPicker'), { ssr: false })

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919000000000'
const UPI_ID = '8697695644-2@ybl'

type DeliveryType = 'delivery' | 'pickup'
type PaymentMethod = 'upi' | 'cod'

// QR code placeholder SVG
function QrPlaceholder() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="26" height="26" rx="2" stroke="#1a3a5c" strokeWidth="2.5" fill="none" />
      <rect x="9" y="9" width="12" height="12" rx="1" fill="#1a3a5c" />
      <rect x="36" y="2" width="26" height="26" rx="2" stroke="#1a3a5c" strokeWidth="2.5" fill="none" />
      <rect x="43" y="9" width="12" height="12" rx="1" fill="#1a3a5c" />
      <rect x="2" y="36" width="26" height="26" rx="2" stroke="#1a3a5c" strokeWidth="2.5" fill="none" />
      <rect x="9" y="43" width="12" height="12" rx="1" fill="#1a3a5c" />
      <rect x="36" y="36" width="7" height="7" rx="1" fill="#1a3a5c" />
      <rect x="47" y="36" width="7" height="7" rx="1" fill="#1a3a5c" />
      <rect x="36" y="47" width="7" height="7" rx="1" fill="#1a3a5c" />
      <rect x="47" y="47" width="7" height="7" rx="1" fill="#1a3a5c" />
    </svg>
  )
}

export default function CartPage() {
  const router = useRouter()
  const { items, updateQty, removeItem, clearCart, subtotal } = useCartStore()

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery')

  const [pincode, setPincode] = useState('')
  const [pincodeData, setPincodeData] = useState<ServicePincode | null>(null)
  const [pincodeError, setPincodeError] = useState('')
  const [pincodeLoading, setPincodeLoading] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [utrNumber, setUtrNumber] = useState('')

  const [specialInstructions, setSpecialInstructions] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Promo code state
  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState<{
    code: string; type: 'flat' | 'percent'; value: number; discount: number
  } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  // Map pin picker
  const [showMapPicker, setShowMapPicker] = useState(false)

  const handleMapConfirm = (result: MapLocationResult) => {
    setAddress(result.address)
    setShowMapPicker(false)
    if (result.pincode) {
      setPincode(result.pincode)
      setPincodeData(null)
      setPincodeError('')
      // Trigger pincode validation after state settles
      setTimeout(() => validatePincode(), 100)
    }
  }

  useEffect(() => setMounted(true), [])

  const cartSubtotal = subtotal()
  const deliveryFee =
    deliveryType === 'delivery' && pincodeData ? pincodeData.delivery_fee : 0
  const promoDiscount = promoApplied?.discount ?? 0
  const total = cartSubtotal + deliveryFee - promoDiscount

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) { setPromoError('Enter a promo code'); return }
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch(`/api/promo?code=${code}&subtotal=${cartSubtotal}`)
      const data = await res.json()
      if (!res.ok) {
        setPromoError(data.error ?? 'Invalid promo code')
        setPromoApplied(null)
      } else {
        setPromoApplied(data)
      }
    } catch {
      setPromoError('Could not apply promo. Try again.')
    } finally {
      setPromoLoading(false)
    }
  }

  const validatePincode = async () => {
    if (deliveryType !== 'delivery') return
    const trimmed = pincode.trim()
    if (!trimmed || trimmed.length !== 6) {
      setPincodeError('Enter a valid 6-digit pincode')
      setPincodeData(null)
      return
    }
    setPincodeLoading(true)
    setPincodeError('')
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('service_pincodes')
        .select('*')
        .eq('pincode', trimmed)
        .single()
      if (error || !data) {
        setPincodeData(null)
        setPincodeError("Sorry, we don't deliver to this pincode yet")
      } else {
        setPincodeData(data as ServicePincode)
        setPincodeError('')
      }
    } catch {
      setPincodeError('Could not validate pincode. Please try again.')
    } finally {
      setPincodeLoading(false)
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!customerName.trim()) errs.customerName = 'Your name is required'
    if (!/^\d{10}$/.test(phone.trim()))
      errs.phone = 'Enter a valid 10-digit mobile number'
    if (deliveryType === 'delivery') {
      if (!address.trim()) errs.address = 'Delivery address is required'
      if (!pincode.trim() || !pincodeData)
        errs.pincode = 'Enter a valid serviceable pincode'
    }
    if (paymentMethod === 'upi' && !utrNumber.trim())
      errs.utrNumber = 'Enter the UTR / Transaction ID after paying'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validate()) return
    setIsPlacingOrder(true)
    try {
      const supabase = createClient()

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          type: deliveryType,
          status: 'pending_review',
          customer_name: customerName.trim(),
          phone: phone.trim(),
          address: deliveryType === 'delivery' ? address.trim() : null,
          pincode: deliveryType === 'delivery' ? pincode.trim() : '',
          subtotal: cartSubtotal,
          delivery_fee: deliveryFee,
          discount: promoDiscount,
          promo_code: promoApplied?.code ?? null,
          total,
          payment_method: paymentMethod,
          payment_status: 'pending',
          upi_ref: paymentMethod === 'upi' ? utrNumber.trim() : null,
          notes: specialInstructions.trim() || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map((ci) => ({
          order_id: order.id,
          item_id: ci.item.id,
          qty: ci.qty,
          unit_price: ci.item.price,
          addons_json: ci.selected_addons,
        }))
      )
      if (itemsError) throw itemsError

      // Track promo usage
      if (promoApplied) {
        await fetch('/api/promo/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: promoApplied.code }),
        })
      }

      // Open WhatsApp with order summary in a new tab
      const waMessage = generateWhatsAppOrderMessage({
        id: order.id,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        type: deliveryType,
        items: items.map((ci) => ({
          name: ci.item.name,
          qty: ci.qty,
          price: ci.item.price,
        })),
        subtotal: cartSubtotal,
        discount: promoDiscount,
        promo_code: promoApplied?.code,
        total,
        address: deliveryType === 'delivery' ? address.trim() : undefined,
        payment_method: paymentMethod,
        notes: specialInstructions.trim() || undefined,
      })
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`, '_blank')

      clearCart()
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (err) {
      console.error('Order placement failed:', err)
      setErrors({
        general:
          'Something went wrong. Please try again or contact us on WhatsApp.',
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-mechho-cream flex items-center justify-center">
        <div className="animate-pulse text-mechho-blue text-lg">Loading cart…</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-mechho-cream flex flex-col items-center justify-center text-center px-4 py-24">
        <span className="text-8xl mb-6 select-none">🛒</span>
        <h2 className="text-2xl font-bold text-mechho-blue mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some delicious items from our menu!</p>
        <Link href="/menu">
          <Button size="lg" variant="primary">
            Browse Menu
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-mechho-cream py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-mechho-blue mb-6">🛒 Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: cart items (2/3) ── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((ci) => (
              <div
                key={ci.item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  {/* Veg/Non-veg indicator */}
                  <span
                    className="flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-sm border-2 bg-white"
                    style={{ borderColor: ci.item.is_veg ? '#2d7a4f' : '#e04f39' }}
                    title={ci.item.is_veg ? 'Veg' : 'Non-veg'}
                  >
                    <span
                      className="block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ci.item.is_veg ? '#2d7a4f' : '#e04f39' }}
                    />
                  </span>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-mechho-blue text-sm leading-snug">
                      {ci.item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatPrice(ci.item.price)} each
                    </p>
                    {ci.selected_addons.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        + {ci.selected_addons.map((a) => a.name).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Qty controls + remove */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => updateQty(ci.item.id, ci.qty - 1)}
                      className="w-7 h-7 rounded-full border-2 border-mechho-blue text-mechho-blue flex items-center justify-center hover:bg-mechho-blue hover:text-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} strokeWidth={3} />
                    </button>
                    <span className="w-5 text-center font-bold text-mechho-blue text-sm">
                      {ci.qty}
                    </span>
                    <button
                      onClick={() => updateQty(ci.item.id, ci.qty + 1)}
                      className="w-7 h-7 rounded-full border-2 border-mechho-blue text-mechho-blue flex items-center justify-center hover:bg-mechho-blue hover:text-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => removeItem(ci.item.id)}
                      className="ml-1 text-gray-300 hover:text-mechho-coral transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Item line total */}
                <div className="flex justify-end mt-2 pt-2 border-t border-gray-50">
                  <span className="text-sm font-bold text-mechho-blue">
                    {formatPrice(ci.item.price * ci.qty)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Right: order summary + form (1/3) ── */}
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-bold text-mechho-blue mb-3">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  <span>
                    {deliveryType === 'pickup'
                      ? 'Free (Pickup)'
                      : pincodeData
                      ? formatPrice(pincodeData.delivery_fee)
                      : '—'}
                  </span>
                </div>

                {/* Promo code */}
                {promoApplied ? (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span className="flex items-center gap-1">
                      🎟️ {promoApplied.code}
                      <button
                        onClick={() => { setPromoApplied(null); setPromoInput(''); setPromoError('') }}
                        className="ml-1 text-gray-400 hover:text-red-400 text-xs"
                        aria-label="Remove promo"
                      >✕</button>
                    </span>
                    <span>−{formatPrice(promoApplied.discount)}</span>
                  </div>
                ) : (
                  <div className="pt-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                        onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-mechho-blue/40 transition"
                      />
                      <button
                        onClick={applyPromo}
                        disabled={promoLoading}
                        className="px-3 py-1.5 bg-mechho-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
                      >
                        {promoLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                  </div>
                )}

                <div className="border-t pt-2 flex justify-between font-bold text-mechho-blue text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery type */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-bold text-mechho-blue mb-3">Delivery Type</h2>
              <div className="flex gap-2">
                {(['delivery', 'pickup'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setDeliveryType(type)
                      setPincodeData(null)
                      setPincodeError('')
                      setErrors((e) => ({ ...e, pincode: '' }))
                    }}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      deliveryType === type
                        ? 'bg-mechho-blue text-white border-mechho-blue'
                        : 'border-gray-200 text-gray-600 hover:border-mechho-blue'
                    }`}
                  >
                    {type === 'delivery' ? '🛵 Delivery' : '🏃 Pickup'}
                  </button>
                ))}
              </div>

              {/* Pincode validation for delivery */}
              {deliveryType === 'delivery' && (
                <div className="mt-3 space-y-1">
                  <Input
                    id="pincode"
                    label="Delivery Pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="e.g. 500089"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      setPincodeData(null)
                      setPincodeError('')
                    }}
                    onBlur={validatePincode}
                    error={errors.pincode || pincodeError}
                  />
                  {pincodeLoading && (
                    <p className="text-xs text-gray-400">Checking delivery area…</p>
                  )}
                  {pincodeData && !pincodeError && (
                    <p className="text-xs text-mechho-green font-medium">
                      ✓ We deliver here! Fee: {formatPrice(pincodeData.delivery_fee)} · ETA ~
                      {pincodeData.eta_minutes} mins
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Customer details */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
              <h2 className="font-bold text-mechho-blue">Your Details</h2>
              <Input
                id="name"
                label="Full Name"
                placeholder="e.g. Ritu Ghosh"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                error={errors.customerName}
              />
              <Input
                id="phone"
                label="Phone Number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                error={errors.phone}
              />
              {deliveryType === 'delivery' && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Delivery Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="flex items-center gap-1 text-xs text-mechho-blue font-semibold hover:underline"
                    >
                      <MapPin size={12} />
                      Pick on map
                    </button>
                  </div>
                  <textarea
                    id="address"
                    rows={3}
                    placeholder="House/flat no., street, landmark…"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition resize-none ${
                      errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-600">{errors.address}</p>
                  )}
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-bold text-mechho-blue mb-3">Payment</h2>
              <div className="flex gap-2">
                {(['upi', 'cod'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      paymentMethod === method
                        ? 'bg-mechho-blue text-white border-mechho-blue'
                        : 'border-gray-200 text-gray-600 hover:border-mechho-blue'
                    }`}
                  >
                    {method === 'upi' ? '📱 UPI' : '💵 Cash on Delivery'}
                  </button>
                ))}
              </div>

              {/* UPI flow */}
              {paymentMethod === 'upi' && (
                <div className="mt-4 space-y-3">
                  <div className="border-2 border-dashed border-mechho-mustard rounded-2xl p-5 text-center bg-mechho-cream">
                    <div className="flex justify-center mb-2">
                      <QrPlaceholder />
                    </div>
                    <p className="font-bold text-mechho-blue text-sm mt-1">
                      UPI: {UPI_ID}
                    </p>
                    <p className="text-mechho-blue/60 text-xs mt-0.5">Scan &amp; pay</p>
                    <p className="font-extrabold text-mechho-mustard text-xl mt-1">
                      {formatPrice(total)}
                    </p>
                  </div>
                  <Input
                    id="utr"
                    label="UTR / Transaction ID"
                    placeholder="12-digit UTR after payment"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    error={errors.utrNumber}
                  />
                </div>
              )}

              {paymentMethod === 'cod' && (
                <p className="text-xs text-gray-500 mt-3">
                  💰 Pay cash when your order arrives. No advance needed.
                </p>
              )}
            </div>

            {/* Special instructions */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <label htmlFor="notes" className="font-bold text-mechho-blue block mb-2">
                Special Instructions{' '}
                <span className="font-normal text-gray-400 text-xs">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Allergies, spice level, other requests…"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-mechho-blue/50 transition resize-none bg-white"
              />
            </div>

            {/* General error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            {/* Place Order CTA */}
            <Button
              size="lg"
              variant="primary"
              className="w-full rounded-2xl"
              disabled={isPlacingOrder}
              onClick={handlePlaceOrder}
            >
              {isPlacingOrder
                ? 'Placing Order…'
                : `Place Order · ${formatPrice(total)}`}
            </Button>

            <p className="text-xs text-center text-gray-400 pb-2">
              We'll send order updates on WhatsApp. 🙏
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Map pin picker modal */}
    {showMapPicker && (
      <MapPinPicker
        onConfirm={handleMapConfirm}
        onClose={() => setShowMapPicker(false)}
      />
    )}
  </>
  )
}
