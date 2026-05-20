import Nav from '@/components/Nav'
import MarketSnapshot from '@/components/MarketSnapshot'
import InvestCalculator from '@/components/InvestCalculator'
import AssetComparison from '@/components/AssetComparison'
import ISATracker from '@/components/ISATracker'

const INVESTMENT_VEHICLES = [
  {
    name: 'Cash ISA',
    limit: '£20,000/yr',
    taxBenefit: 'Interest tax-free',
    risk: 'Low',
    riskColor: '#22c55e',
    desc: 'A savings account where interest is earned free of income tax. Best for short-term savings or emergency funds.',
    link: 'https://www.moneyhelper.org.uk/en/savings/types-of-savings/cash-isas',
  },
  {
    name: 'Stocks & Shares ISA',
    limit: '£20,000/yr',
    taxBenefit: 'Growth + dividends tax-free',
    risk: 'Medium',
    riskColor: '#c9a84c',
    desc: 'Invest in funds, ETFs, or shares inside a tax-free wrapper. Growth and income are completely tax-free.',
    link: 'https://www.moneyhelper.org.uk/en/savings/types-of-savings/stocks-and-shares-isas',
  },
  {
    name: 'Lifetime ISA (LISA)',
    limit: '£4,000/yr',
    taxBenefit: '25% government bonus',
    risk: 'Low–High',
    riskColor: '#818cf8',
    desc: 'For first-time buyers or retirement. Government adds 25% (up to £1,000/yr). Age 18–39 only.',
    link: 'https://www.moneyhelper.org.uk/en/savings/types-of-savings/lifetime-isa',
  },
  {
    name: 'SIPP (Pension)',
    limit: 'Up to £60,000/yr',
    taxBenefit: 'Tax relief on contributions',
    risk: 'Medium',
    riskColor: '#c9a84c',
    desc: 'Self-Invested Personal Pension. HMRC tops up contributions with tax relief. Funds locked until age 57+.',
    link: 'https://www.moneyhelper.org.uk/en/pensions-and-retirement/pensions-basics/self-invested-personal-pension-sipp',
  },
  {
    name: 'General Investment Account',
    limit: 'Unlimited',
    taxBenefit: 'CGT allowance (£3,000/yr 2025/26)',
    risk: 'Varies',
    riskColor: '#fb923c',
    desc: 'Invest without limits but gains and dividends above tax-free allowances are taxable. Flexible withdrawals.',
    link: 'https://www.moneyhelper.org.uk/en/savings/investing/investment-accounts',
  },
]

function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-[#fb923c]/30 bg-[#fb923c]/5 text-sm">
      <span className="text-[#fb923c] shrink-0 text-lg">⚠</span>
      <p className="text-[var(--color-muted)]">
        <strong className="text-[#fb923c]">Educational purposes only.</strong>{' '}
        Market data is delayed up to 15 minutes. Projections use historical average returns — past
        performance does not guarantee future results. Investing carries risk and you may get back
        less than you invest. For regulated financial advice, consult an{' '}
        <a
          href="https://register.fca.org.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[var(--color-text)] transition-colors"
        >
          FCA-authorised adviser
        </a>
        .
      </p>
    </div>
  )
}

export default function InvestPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        <div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
            Markets &amp; Investing
          </h1>
          <p className="text-[var(--color-muted)] mb-5">
            Live market snapshot, UK investment vehicles, compound calculator, and ISA tracker.
          </p>
          <DisclaimerBanner />
        </div>

        {/* Section 1: Live Market Snapshot */}
        <section>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            Live Market Snapshot
          </h2>
          <MarketSnapshot />
        </section>

        {/* Section 2: UK Investment Vehicles */}
        <section>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
            UK Investment Options
          </h2>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            All ISA types share a single £20,000 annual allowance (except LISA which has its own £4,000 sub-limit).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INVESTMENT_VEHICLES.map((v) => (
              <div
                key={v.name}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>{v.name}</h3>
                  <span
                    className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${v.riskColor}20`, color: v.riskColor }}
                  >
                    {v.risk}
                  </span>
                </div>

                <p className="text-sm text-[var(--color-muted)] flex-1 leading-relaxed mb-4">{v.desc}</p>

                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Annual limit</span>
                    <span className="font-medium text-[var(--color-text)]">{v.limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Tax benefit</span>
                    <span className="font-medium" style={{ color: '#22c55e' }}>{v.taxBenefit}</span>
                  </div>
                </div>

                <a
                  href={v.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[var(--color-muted)] hover:text-[#c9a84c] transition-colors"
                >
                  Learn more on MoneyHelper →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Investment Calculator */}
        <section>
          <InvestCalculator />
        </section>

        {/* Section 4 + 5: Asset Comparison & ISA Tracker */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetComparison />
          <ISATracker />
        </section>

        {/* Footer disclaimer */}
        <DisclaimerBanner />

        <footer className="text-center text-xs text-[var(--color-muted)] pb-4">
          NetWorth provides estimates for guidance only. Consult a qualified accountant or
          FCA-authorised financial adviser for regulated advice.
        </footer>
      </main>
    </>
  )
}
