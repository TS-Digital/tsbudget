'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import Nav from '@/components/Nav'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

type AuthMode = 'signin' | 'signup'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginShell() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto min-h-[calc(100dvh-73px)] max-w-6xl px-4 py-10">
          <div className="h-[520px] rounded-2xl border border-[#2a3447] bg-[#141920]" />
        </section>
      </main>
    </>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/dashboard'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), [])

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(nextPath)
    })
  }, [nextPath, router, supabase])

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError(null)
    setInfo(null)
    setPassword('')
  }

  async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) return

    setLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setInfo('Check your email to confirm your account, then sign in.')
        setMode('signin')
        setPassword('')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
      } else {
        router.replace(nextPath)
        router.refresh()
      }
    }

    setLoading(false)
  }

  async function handleGoogle() {
    if (!supabase) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto grid min-h-[calc(100dvh-73px)] max-w-6xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#c9a84c]">
              TSBudget account
            </p>
            <h1
              className="mb-5 text-4xl font-extrabold leading-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Save your budget, goals, and tax profile across pages.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#7a8599]">
              Sign in once and the calculator, budget planner, and dashboard can keep working from
              the same saved numbers instead of starting fresh every time.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ['Tax profile', 'Keep salary, tax code, pension, and student loan settings.'],
                ['Budget plan', 'Save categories and monthly income for later.'],
                ['Goals', 'Track targets from the dashboard.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-xl border border-[#2a3447] bg-[#141920] p-4">
                  <div
                    className="mb-1 text-sm font-bold text-[#e8eaf0]"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    {title}
                  </div>
                  <p className="text-xs leading-relaxed text-[#7a8599]">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2a3447] bg-[#141920] shadow-2xl">
            <div className="border-b border-[#2a3447] px-6 py-5">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="mt-1 text-sm text-[#7a8599]">
                {mode === 'signin' ? 'Welcome back.' : 'Start saving your TSBudget data.'}
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#2a3447]">
                {(['signin', 'signup'] as AuthMode[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => changeMode(tab)}
                    className={`py-2.5 text-sm font-semibold transition-colors ${
                      mode === tab
                        ? 'bg-[#c9a84c]/15 text-[#c9a84c]'
                        : 'text-[#7a8599] hover:bg-[#1c2433] hover:text-[#e8eaf0]'
                    }`}
                  >
                    {tab === 'signin' ? 'Sign in' : 'Sign up'}
                  </button>
                ))}
              </div>

              {!isSupabaseConfigured && (
                <div className="rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/8 p-3 text-sm text-[#ef4444]">
                  Supabase is not configured. Add `NEXT_PUBLIC_SUPABASE_URL` and
                  `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
                </div>
              )}

              {info && (
                <div className="rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/8 p-3 text-sm text-[#22c55e]">
                  {info}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/8 p-3 text-sm text-[#ef4444]">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="mb-1.5 block text-xs text-[#7a8599]">Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs text-[#7a8599]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-[#7a8599]">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !isSupabaseConfigured}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold text-[#0d1017] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: '#c9a84c', fontFamily: 'var(--font-syne)' }}
                >
                  {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#2a3447]" />
                <span className="text-xs text-[#7a8599]">or</span>
                <div className="h-px flex-1 bg-[#2a3447]" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading || !isSupabaseConfigured}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2a3447] px-4 py-3 text-sm font-semibold text-[#e8eaf0] transition-all hover:border-[#c9a84c]/40 hover:bg-[#1c2433] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue with Google
              </button>

              <p className="text-center text-xs text-[#7a8599]">
                Prefer to keep browsing?{' '}
                <Link href="/" className="font-semibold text-[#c9a84c] hover:text-[#e2c06e]">
                  Go back home
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
