'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import AuthModal from '@/components/AuthModal'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'

const links = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/budget', label: 'Budget' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/invest', label: 'Markets' },
  { href: '/self-employed', label: 'Self-Employed' },
  { href: '/benefits', label: 'Benefits' },
]

function initials(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined
  if (name) return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  return (user.email?.[0] ?? '?').toUpperCase()
}

export default function Nav() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Lazily import to avoid crashing when Supabase env vars aren't set
  useEffect(() => {
    if (!isSupabaseConfigured) return

    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setUser(data.user))
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user ?? null)
      })
      return () => subscription.unsubscribe()
    })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [menuOpen])

  async function signOut() {
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    setMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex flex-col leading-none shrink-0">
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-syne)', color: '#c9a84c' }}
            >
              Net<span className="text-[var(--color-text)]">Worth</span>
            </span>
            <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted)] mt-0.5">
              by TS Digital
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#c9a84c]/15 text-[#c9a84c]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Auth area */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-[var(--color-muted)] hidden lg:block">2025/26</span>

            <button
              type="button"
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {isSupabaseConfigured && (
              user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[var(--color-bg)] transition-transform hover:scale-105"
                    style={{ background: '#c9a84c', fontFamily: 'var(--font-syne)' }}
                  >
                    {initials(user)}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-10 w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[var(--color-border)]">
                        <p className="text-xs font-medium text-[var(--color-text)] truncate">{user.email}</p>
                        <p className="text-xs text-[var(--color-muted)]">Signed in</p>
                      </div>
                      <button
                        onClick={signOut}
                        className="w-full text-left px-4 py-3 text-sm text-[var(--color-muted)] hover:text-[#ef4444] hover:bg-[var(--color-surface-2)] transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[#c9a84c]/50 hover:text-[#c9a84c] transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
          {links.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  active ? 'bg-[#c9a84c]/15 text-[#c9a84c]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setAuthOpen(false)}
      />
    </>
  )
}
