'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/budget', label: 'Budget' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/self-employed', label: 'Self-Employed' },
  { href: '/benefits', label: 'Benefits' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a3447] bg-[#0d1017]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-syne)', color: '#c9a84c' }}
          >
            TS<span className="text-[#e8eaf0]">Budget</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#c9a84c]/15 text-[#c9a84c]'
                    : 'text-[#7a8599] hover:text-[#e8eaf0] hover:bg-[#1c2433]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7a8599] hidden sm:block">2025/26 Tax Year</span>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-none">
        {links.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                active ? 'bg-[#c9a84c]/15 text-[#c9a84c]' : 'text-[#7a8599] hover:text-[#e8eaf0]'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}
