'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Fish, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin/orders`,
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-mechho-blue flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mechho-mustard mb-4 shadow-lg">
            <Fish className="text-mechho-blue" size={30} />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Mechho Admin</h1>
          <p className="text-white/50 text-sm mt-1">Bengali Fish Home Kitchen</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4 py-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-2">
                <Mail className="text-green-600" size={26} />
              </div>
              <h2 className="text-gray-900 text-lg font-semibold">Check your email ✉️</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We&apos;ve sent a magic link to{' '}
                <strong className="text-gray-700 break-all">{email}</strong>.
                Click the link to sign in to the admin panel.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-mechho-blue-mid text-sm underline underline-offset-2 hover:no-underline mt-2"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-gray-900 font-semibold text-lg">Sign in</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your admin email to receive a magic link
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="admin@mechho.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error ?? undefined}
                  required
                  autoFocus
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  className="w-full"
                  size="md"
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    'Send Magic Link'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Only authorized administrators can access this panel
        </p>
      </div>
    </div>
  )
}
