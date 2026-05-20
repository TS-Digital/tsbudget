'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Tab = 'signin' | 'signup'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ open, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  function changeTab(nextTab: Tab) {
    setTab(nextTab)
    setError(null)
    setInfo(null)
    setPassword('')
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const supabase = createClient()

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    if (tab === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setInfo('Check your email to confirm your account, then sign in.')
        setTab('signin')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        onSuccess()
        onClose()
      }
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#2a3447] bg-[#141920] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#2a3447]">
          <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
            {tab === 'signin' ? 'Sign in' : 'Create account'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#7a8599] hover:text-[#e8eaf0] text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-[#2a3447]">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => changeTab(t)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  tab === t ? 'bg-[#c9a84c]/15 text-[#c9a84c]' : 'text-[#7a8599] hover:text-[#e8eaf0]'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {info && (
            <div className="p-3 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/8 text-sm text-[#22c55e]">
              {info}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/8 text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs text-[#7a8599] mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-[#7a8599] mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#7a8599] mb-1.5">Password</label>
              <input
                type="password"
                placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-[#0d1017] disabled:opacity-60 transition-all hover:scale-[1.01]"
              style={{ background: '#c9a84c', fontFamily: 'var(--font-syne)' }}
            >
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2a3447]" />
            <span className="text-xs text-[#7a8599]">or</span>
            <div className="flex-1 h-px bg-[#2a3447]" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-medium text-sm border border-[#2a3447] text-[#e8eaf0] hover:bg-[#1c2433] hover:border-[#c9a84c]/40 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-[#7a8599] text-center">
            Your data is only used to save your budgets and goals. We never share it.
          </p>
        </div>
      </div>
    </div>
  )
}
