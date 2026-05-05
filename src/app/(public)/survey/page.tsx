'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/* ── Survey Question Data ─────────────────────────────────────────────────── */

const FISH_OPTIONS = [
  { value: 'rohu',        label: 'Rohu (Rui)',          emoji: '🐟' },
  { value: 'katla',       label: 'Katla',               emoji: '🐟' },
  { value: 'hilsa',       label: 'Hilsa (Ilish)',        emoji: '🐠' },
  { value: 'pabda',       label: 'Pabda',               emoji: '🐡' },
  { value: 'bhetki',      label: 'Bhetki',              emoji: '🐟' },
  { value: 'pomfret',     label: 'Pomfret',             emoji: '🐠' },
  { value: 'surmai',      label: 'Surmai (King Fish)',   emoji: '👑' },
  { value: 'prawn',       label: 'Prawn',               emoji: '🦐' },
  { value: 'crab',        label: 'Crab',                emoji: '🦀' },
  { value: 'bombay_duck', label: 'Bombay Duck (Loitta)', emoji: '🐡' },
  { value: 'other',       label: 'Other',               emoji: '✨' },
]

const PREP_OPTIONS = [
  { value: 'jhol',       label: 'Jhol (curry)',          emoji: '🍲' },
  { value: 'kalia',      label: 'Kalia (rich gravy)',    emoji: '🫕' },
  { value: 'paturi',     label: 'Paturi (mustard wrap)', emoji: '🌿' },
  { value: 'bhapa',      label: 'Bhapa (steamed)',       emoji: '♨️' },
  { value: 'sorshe',     label: 'Sorshe (mustard paste)',emoji: '🟡' },
  { value: 'fried',      label: 'Fried (simple fry)',    emoji: '🍳' },
  { value: 'rava_fry',   label: 'Rava Fry',             emoji: '🌾' },
  { value: 'biryani',    label: 'Biryani',              emoji: '🍛' },
  { value: 'roll',       label: 'Roll / Kathi',         emoji: '🌯' },
  { value: 'burger',     label: 'Burger-style',         emoji: '🍔' },
  { value: 'rice_bowl',  label: 'Rice Bowl',            emoji: '🍚' },
]

const PORTION_OPTIONS = [
  { value: 'single',    label: 'Just me (single)',        emoji: '🙋' },
  { value: '2_3',       label: 'For 2-3 people',          emoji: '👫' },
  { value: '4_6',       label: 'Family pack (4-6)',        emoji: '👨‍👩‍👧‍👦' },
  { value: '7_plus',    label: 'Party order (7+)',         emoji: '🎉' },
]

const PRICE_OPTIONS = [
  { value: 'under_150', label: 'Under ₹150',  emoji: '💚' },
  { value: '150_250',   label: '₹150 – ₹250', emoji: '💛' },
  { value: '250_400',   label: '₹250 – ₹400', emoji: '🧡' },
  { value: '400_plus',  label: '₹400+',        emoji: '❤️' },
]

const FREQUENCY_OPTIONS = [
  { value: 'daily',     label: 'Daily',          emoji: '📅' },
  { value: '2_3_week',  label: '2-3x per week',  emoji: '🔄' },
  { value: 'weekly',    label: 'Weekly',         emoji: '📆' },
  { value: 'occasional',label: 'Occasionally',   emoji: '🌟' },
]

/* ── Types ────────────────────────────────────────────────────────────────── */
interface SurveyState {
  fish_types: string[]
  preparations: string[]
  portion_size: string
  price_band: string
  frequency: string
  pincode: string
  name: string
  phone: string
}

/* ── Sub-components ───────────────────────────────────────────────────────── */
function CheckboxGrid({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string; emoji: string }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {options.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-2.5 cursor-pointer rounded-xl border-2 px-3 py-2.5 transition-all text-sm ${
              active
                ? 'border-mechho-mustard bg-mechho-mustard/10 font-semibold text-mechho-blue'
                : 'border-gray-200 hover:border-mechho-mustard/40 text-gray-700'
            }`}
          >
            <input
              type="checkbox"
              checked={active}
              onChange={() => onToggle(opt.value)}
              className="sr-only"
            />
            <span>{opt.emoji}</span>
            <span className="truncate">{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}

function RadioGrid({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string; emoji: string }[]
  selected: string
  onSelect: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = selected === opt.value
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 px-4 py-3 transition-all ${
              active
                ? 'border-mechho-blue bg-mechho-blue text-white font-semibold'
                : 'border-gray-200 hover:border-mechho-blue/40 text-gray-700'
            }`}
          >
            <input
              type="radio"
              checked={active}
              onChange={() => onSelect(opt.value)}
              className="sr-only"
            />
            <span className="text-xl">{opt.emoji}</span>
            <span className="text-sm">{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}

function QuestionCard({
  number,
  question,
  children,
}: {
  number: number
  question: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start gap-3 mb-5">
        <span className="shrink-0 w-7 h-7 rounded-full bg-mechho-blue text-white text-xs font-extrabold flex items-center justify-center">
          {number}
        </span>
        <h2 className="font-bold text-mechho-blue text-base leading-snug">{question}</h2>
      </div>
      {children}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function SurveyPage() {
  const [state, setState] = useState<SurveyState>({
    fish_types: [],
    preparations: [],
    portion_size: '',
    price_band: '',
    frequency: '',
    pincode: '',
    name: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  /* Progress: count filled sections out of 6 */
  const progress = useMemo(() => {
    const filled = [
      state.fish_types.length > 0,
      state.preparations.length > 0,
      state.portion_size !== '',
      state.price_band !== '',
      state.frequency !== '',
      state.pincode.trim().length > 0,
    ].filter(Boolean).length
    return Math.round((filled / 6) * 100)
  }, [state])

  function toggleCheck(field: 'fish_types' | 'preparations', value: string) {
    setState((s) => ({
      ...s,
      [field]: s[field].includes(value)
        ? s[field].filter((v) => v !== value)
        : [...s[field], value],
    }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function setRadio(field: 'portion_size' | 'price_band' | 'frequency', value: string) {
    setState((s) => ({ ...s, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function setTextField(field: 'pincode' | 'name' | 'phone', value: string) {
    setState((s) => ({ ...s, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (state.fish_types.length === 0) errs.fish_types = 'Please select at least one'
    if (state.preparations.length === 0) errs.preparations = 'Please select at least one'
    if (!state.portion_size) errs.portion_size = 'Please select an option'
    if (!state.price_band) errs.price_band = 'Please select an option'
    if (!state.frequency) errs.frequency = 'Please select an option'
    if (!state.pincode.trim()) errs.pincode = 'Pincode is required'
    if (state.phone && !/^\d{10}$/.test(state.phone))
      errs.phone = 'Enter a valid 10-digit number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.from('survey_responses').insert({
        name: state.name || null,
        phone: state.phone || null,
        pincode: state.pincode,
        fish_types: state.fish_types,
        preparations: state.preparations,
        portion_size: state.portion_size,
        price_band: state.price_band,
        frequency: state.frequency,
        comments: null,
      })
      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  /* ── Thank-you screen ────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10 text-center animate-slide-up border border-gray-100">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-2xl font-extrabold text-mechho-blue mb-2">Thank you!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your fish preferences help us build a better menu for Hyderabad.
          </p>
          <div className="bg-mechho-mustard/10 border-2 border-mechho-mustard/40 rounded-2xl p-5 mb-6">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">
              Your 10% off coupon
            </p>
            <p className="text-3xl font-extrabold text-mechho-blue tracking-widest">
              MECHHO10
            </p>
            <p className="text-xs text-gray-500 mt-1">Use it on your next pre-order!</p>
          </div>
          <a href="/preorder">
            <Button size="lg" className="w-full gap-2">
              🎉 Place a Pre-order →
            </Button>
          </a>
        </div>
      </div>
    )
  }

  /* ── Survey form ──────────────────────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block bg-mechho-mustard/15 text-mechho-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          2-Minute Survey
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-mechho-blue mb-2">
          🐠 Tell us your fish preference!
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Help us build the perfect menu — and get{' '}
          <span className="font-bold text-mechho-blue">10% off</span> your next order as a
          thank-you.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Progress</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-mechho-mustard rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Q1: Fish types */}
        <QuestionCard number={1} question="Which fish do you love? (Select all that apply)">
          <CheckboxGrid
            options={FISH_OPTIONS}
            selected={state.fish_types}
            onToggle={(v) => toggleCheck('fish_types', v)}
          />
          {errors.fish_types && (
            <p data-error className="text-xs text-red-600 mt-2">
              ⚠️ {errors.fish_types}
            </p>
          )}
        </QuestionCard>

        {/* Q2: Preparations */}
        <QuestionCard number={2} question="What preparations do you enjoy?">
          <CheckboxGrid
            options={PREP_OPTIONS}
            selected={state.preparations}
            onToggle={(v) => toggleCheck('preparations', v)}
          />
          {errors.preparations && (
            <p data-error className="text-xs text-red-600 mt-2">
              ⚠️ {errors.preparations}
            </p>
          )}
        </QuestionCard>

        {/* Q3: Portion size */}
        <QuestionCard number={3} question="What portion size works for you?">
          <RadioGrid
            options={PORTION_OPTIONS}
            selected={state.portion_size}
            onSelect={(v) => setRadio('portion_size', v)}
          />
          {errors.portion_size && (
            <p data-error className="text-xs text-red-600 mt-2">
              ⚠️ {errors.portion_size}
            </p>
          )}
        </QuestionCard>

        {/* Q4: Budget */}
        <QuestionCard number={4} question="What's your budget per meal?">
          <RadioGrid
            options={PRICE_OPTIONS}
            selected={state.price_band}
            onSelect={(v) => setRadio('price_band', v)}
          />
          {errors.price_band && (
            <p data-error className="text-xs text-red-600 mt-2">
              ⚠️ {errors.price_band}
            </p>
          )}
        </QuestionCard>

        {/* Q5: Frequency */}
        <QuestionCard number={5} question="How often would you order from Mechho?">
          <RadioGrid
            options={FREQUENCY_OPTIONS}
            selected={state.frequency}
            onSelect={(v) => setRadio('frequency', v)}
          />
          {errors.frequency && (
            <p data-error className="text-xs text-red-600 mt-2">
              ⚠️ {errors.frequency}
            </p>
          )}
        </QuestionCard>

        {/* Q6: Contact + pincode */}
        <QuestionCard
          number={6}
          question="Your delivery pincode — and optionally your name and phone for 10% off"
        >
          <div className="space-y-4">
            <Input
              id="pincode"
              label="Delivery Pincode *"
              placeholder="500000"
              inputMode="numeric"
              maxLength={6}
              value={state.pincode}
              onChange={(e) => setTextField('pincode', e.target.value.replace(/\D/g, ''))}
              error={errors.pincode}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="name"
                label="Your Name (optional)"
                placeholder="What do we call you?"
                value={state.name}
                onChange={(e) => setTextField('name', e.target.value)}
              />
              <Input
                id="phone"
                label="Phone (optional)"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile"
                maxLength={10}
                value={state.phone}
                onChange={(e) => setTextField('phone', e.target.value.replace(/\D/g, ''))}
                error={errors.phone}
              />
            </div>
            <p className="text-xs text-gray-400">
              📱 We'll send you the 10% off code via WhatsApp if you share your number.
            </p>
          </div>
        </QuestionCard>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {errors.submit}
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Submitting…' : '🐠 Submit Survey & Get 10% Off'}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Takes about 2 minutes · Your data stays private 🔒
          </p>
        </div>
      </form>
    </div>
  )
}
