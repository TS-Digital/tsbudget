import { PERSONAL_ALLOWANCE } from '@/config/taxYear'
import type { ParsedTaxCode } from '@/types/finance'

export function parseTaxCode(raw: string): ParsedTaxCode {
  const code = raw.trim().toUpperCase().replace(/\s/g, '')
  const isNonCumulative = code.endsWith('W1') || code.endsWith('M1') || code.endsWith('X')
  const base = code.replace(/(W1|M1|X)$/, '')

  // NT — no tax at all
  if (base === 'NT') {
    return { personalAllowance: Infinity, isNonCumulative, isKCode: false, raw }
  }

  // BR — basic rate on everything, zero PA
  if (base === 'BR') {
    return { personalAllowance: 0, isNonCumulative, isKCode: false, raw }
  }

  // D0 — higher rate, zero PA
  if (base === 'D0') {
    return { personalAllowance: 0, isNonCumulative, isKCode: false, raw }
  }

  // D1 — additional rate, zero PA
  if (base === 'D1') {
    return { personalAllowance: 0, isNonCumulative, isKCode: false, raw }
  }

  // 0T — zero PA
  if (base === '0T') {
    return { personalAllowance: 0, isNonCumulative, isKCode: false, raw }
  }

  // M — recipient of marriage allowance transfer (PA + 10%)
  if (base === 'M') {
    return { personalAllowance: Math.round(PERSONAL_ALLOWANCE * 1.1), isNonCumulative, isKCode: false, raw }
  }

  // N — donor of marriage allowance transfer (PA - 10%)
  if (base === 'N') {
    return { personalAllowance: Math.round(PERSONAL_ALLOWANCE * 0.9), isNonCumulative, isKCode: false, raw }
  }

  // K codes — negative PA, adds to taxable income
  if (base.startsWith('K')) {
    const num = parseInt(base.slice(1), 10)
    if (!isNaN(num)) {
      return { personalAllowance: -(num * 10), isNonCumulative, isKCode: true, raw }
    }
  }

  // Standard numeric code e.g. 1257L, 1185L
  const match = base.match(/^(\d+)[A-Z]?$/)
  if (match) {
    const pa = parseInt(match[1], 10) * 10
    return { personalAllowance: pa, isNonCumulative, isKCode: false, raw }
  }

  // Fallback to standard PA
  return { personalAllowance: PERSONAL_ALLOWANCE, isNonCumulative, isKCode: false, raw }
}
