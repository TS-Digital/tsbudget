'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.replace('/dashboard'), 2000)
    }
  }

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto flex min-h-[calc(100dvh-73px)] max-w-6xl items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl">
            <h1 className="mb-1 text-xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
              Set new password
            </h1>
            <p className="mb-6 text-sm text-[var(--color-muted)]">Choose a strong password for your account.</p>

            {done ? (
              <div className="rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/8 p-4 text-sm text-[#22c55e]">
                Password updated. Redirecting to your dashboard…
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/8 p-3 text-sm text-[#ef4444]">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs text-[var(--color-muted)]">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-[var(--color-muted)]">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat new password"
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold text-[var(--color-bg)] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: '#c9a84c', fontFamily: 'var(--font-syne)' }}
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
