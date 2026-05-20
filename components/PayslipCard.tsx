'use client'

import type { TaxBreakdown, PayFrequency } from '@/types/finance'

const FREQ_LABEL: Record<PayFrequency, string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  four_weekly: '4-Weekly',
  monthly: 'Monthly',
  annual: 'Annual',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(n)
}

function pct(n: number) {
  return (n * 100).toFixed(1) + '%'
}

interface Props {
  breakdown: TaxBreakdown
  frequency: PayFrequency
}

interface Row {
  label: string
  annual: number
  period: number
  highlight?: boolean
  deduction?: boolean
}

export default function PayslipCard({ breakdown, frequency }: Props) {
  const b = breakdown
  const p = b.perPeriod
  const freqLabel = FREQ_LABEL[frequency]

  const rows: Row[] = [
    { label: 'Gross Income', annual: b.grossAnnual, period: p.gross, highlight: false },
    { label: 'Pension Deduction', annual: -b.pensionDeduction, period: -p.pension, deduction: true },
    { label: 'Income Tax', annual: -b.incomeTax, period: -p.incomeTax, deduction: true },
    { label: 'National Insurance', annual: -b.nationalInsurance, period: -p.ni, deduction: true },
    ...(b.studentLoan > 0
      ? [{ label: 'Student Loan', annual: -b.studentLoan, period: -p.studentLoan, deduction: true }]
      : []),
    { label: 'Net Take-Home', annual: b.netAnnual, period: p.net, highlight: true },
  ]

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
          Payslip Breakdown
        </h2>
        <span className="text-xs px-2 py-1 rounded-md bg-[#c9a84c]/15 text-[#c9a84c]">2025/26</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left px-6 py-3 text-[var(--color-muted)] font-medium">Item</th>
              <th className="text-right px-4 py-3 text-[var(--color-muted)] font-medium">{freqLabel}</th>
              <th className="text-right px-6 py-3 text-[var(--color-muted)] font-medium">Annual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className={`border-b border-[var(--color-border)]/50 ${row.highlight ? 'bg-[var(--color-surface-2)]' : ''}`}
              >
                <td className={`px-6 py-3 font-medium ${row.highlight ? 'text-[#c9a84c]' : 'text-[var(--color-text)]'}`}>
                  {row.label}
                </td>
                <td
                  className={`px-4 py-3 text-right font-mono text-sm ${
                    row.deduction ? 'text-[#ef4444]' : row.highlight ? 'text-[#22c55e] font-bold' : 'text-[var(--color-text)]'
                  }`}
                >
                  {row.deduction ? `−${fmt(Math.abs(row.period))}` : fmt(row.period)}
                </td>
                <td
                  className={`px-6 py-3 text-right font-mono text-sm ${
                    row.deduction ? 'text-[#ef4444]' : row.highlight ? 'text-[#22c55e] font-bold' : 'text-[var(--color-text)]'
                  }`}
                >
                  {row.deduction ? `−${fmt(Math.abs(row.annual))}` : fmt(row.annual)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rates */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4 border-t border-[var(--color-border)]">
        <div>
          <div className="text-xs text-[var(--color-muted)] mb-1">Effective Rate</div>
          <div className="text-2xl font-bold font-num" style={{ color: '#c9a84c' }}>
            {pct(b.effectiveRate)}
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--color-muted)] mb-1">Marginal Rate</div>
          <div className="text-2xl font-bold font-num" style={{ color: '#c9a84c' }}>
            {pct(b.marginalRate)}
          </div>
        </div>
      </div>
    </div>
  )
}
