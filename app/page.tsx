import Link from 'next/link'
import Nav from '@/components/Nav'

const features = [
  {
    href: '/calculator',
    icon: '£',
    title: 'Tax Calculator',
    desc: 'PAYE, self-employed, directors. All UK tax codes. Scotland toggle. Student loans.',
    color: '#c9a84c',
  },
  {
    href: '/budget',
    icon: '⬡',
    title: 'Budget Planner',
    desc: '50/30/20, zero-based, pay yourself first, or your own custom split.',
    color: '#22c55e',
  },
  {
    href: '/dashboard',
    icon: '◎',
    title: 'Financial Dashboard',
    desc: 'Savings projections, debt payoff timeline, compound interest, AI-powered tips.',
    color: '#818cf8',
  },
  {
    href: '/self-employed',
    icon: '◈',
    title: 'Self-Employed Module',
    desc: 'Profit after expenses, VAT reserve, Self-Assessment estimate, director salary split.',
    color: '#fb923c',
  },
  {
    href: '/benefits',
    icon: '◇',
    title: 'Benefits Calculator',
    desc: 'Universal Credit taper, work allowance, budgeting from benefits income.',
    color: '#34d399',
  },
]

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a3447] text-xs text-[#7a8599] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse inline-block" />
            2025/26 Tax Year — updated to HMRC latest rates
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Know exactly what you{' '}
            <span style={{ color: '#c9a84c' }}>take home</span>
            <br />and where it should go.
          </h1>

          <p className="text-lg text-[#7a8599] max-w-2xl mx-auto mb-10 leading-relaxed">
            TSBudget calculates your UK after-tax pay, helps you allocate every pound, and gives
            you an AI-powered plan to save and invest smarter — whether you&apos;re employed,
            self-employed, a director, on benefits, or studying.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[#0d1017] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#c9a84c' }}
            >
              Calculate my take-home pay
              <span>→</span>
            </Link>
            <Link
              href="/budget"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-[#2a3447] text-[#e8eaf0] hover:border-[#c9a84c]/50 hover:bg-[#1c2433] transition-all"
            >
              Plan my budget
            </Link>
          </div>
        </section>

        {/* Feature grid */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group relative p-6 rounded-2xl border border-[#2a3447] bg-[#141920] hover:border-[#c9a84c]/40 hover:bg-[#1c2433] transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: `${f.color}18`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3
                  className="text-lg font-bold mb-2 group-hover:text-[#c9a84c] transition-colors"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-[#7a8599] leading-relaxed">{f.desc}</p>
                <span className="absolute top-6 right-6 text-[#2a3447] group-hover:text-[#c9a84c] transition-colors text-lg">
                  →
                </span>
              </Link>
            ))}

            {/* AI tip teaser card */}
            <div className="p-6 rounded-2xl border border-[#818cf8]/30 bg-[#818cf8]/5 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 bg-[#818cf8]/15 text-[#818cf8]">
                ✦
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: 'var(--font-syne)', color: '#a5b4fc' }}
              >
                AI-Powered Insights
              </h3>
              <p className="text-sm text-[#7a8599] leading-relaxed">
                TSBudget AI reads your numbers and gives you 3 specific, actionable budgeting tips
                — powered by Claude AI.
              </p>
            </div>
          </div>
        </section>

        {/* Quick stats bar */}
        <section className="border-t border-[#2a3447] py-10 bg-[#141920]">
          <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              ['All tax codes', 'Including K codes, BR, D0, NT'],
              ['5 profile types', 'PAYE, SE, Director, Benefits, Student'],
              ['Scotland rates', 'Separate income tax bands'],
              ['5 loan plans', 'Plans 1, 2, 4, 5 & Postgrad'],
            ].map(([label, sub]) => (
              <div key={label}>
                <div
                  className="text-lg font-bold mb-1"
                  style={{ fontFamily: 'var(--font-syne)', color: '#c9a84c' }}
                >
                  {label}
                </div>
                <div className="text-xs text-[#7a8599]">{sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <footer className="border-t border-[#2a3447] py-6 text-center">
          <p className="text-xs text-[#7a8599] max-w-2xl mx-auto px-4">
            TSBudget provides estimates for guidance only. Figures are based on 2025/26 HMRC
            rates. Consult a qualified accountant for regulated financial advice.
          </p>
        </footer>
      </main>
    </>
  )
}
