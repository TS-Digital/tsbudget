import {
  ENGLAND_WALES_BANDS,
  SCOTLAND_BANDS,
  NI_EMPLOYEE,
  NI_SELF_EMPLOYED,
  STUDENT_LOAN_THRESHOLDS,
  PA_TAPER_THRESHOLD,
} from '@/config/taxYear'
import { parseTaxCode } from '@/lib/taxCodeParser'
import type { TaxInput, TaxBreakdown, ParsedTaxCode } from '@/types/finance'

const PERIODS: Record<string, number> = {
  weekly: 52,
  fortnightly: 26,
  four_weekly: 13,
  monthly: 12,
  annual: 1,
}

function taperPersonalAllowance(basePa: number, grossIncome: number): number {
  if (grossIncome <= PA_TAPER_THRESHOLD) return basePa
  const reduction = Math.floor((grossIncome - PA_TAPER_THRESHOLD) / 2)
  return Math.max(0, basePa - reduction)
}

function calcIncomeTax(taxableIncome: number, bands: typeof ENGLAND_WALES_BANDS): number {
  if (taxableIncome <= 0) return 0
  let tax = 0
  for (const band of bands) {
    if (taxableIncome <= band.from) break
    const bandable = Math.min(taxableIncome, band.to) - band.from
    tax += bandable * band.rate
  }
  return Math.max(0, tax)
}

function calcNIEmployee(grossAnnual: number): number {
  const { lower, upper, midRate, upperRate } = NI_EMPLOYEE
  if (grossAnnual <= lower) return 0
  const mid = Math.min(grossAnnual, upper) - lower
  const above = Math.max(0, grossAnnual - upper)
  return mid * midRate + above * upperRate
}

function calcNISelfEmployed(profit: number): number {
  const { class2WeeklyRate, class2Threshold, class4Lower, class4Upper, class4LowerRate, class4UpperRate } =
    NI_SELF_EMPLOYED
  let ni = 0
  if (profit > class2Threshold) {
    ni += class2WeeklyRate * 52
  }
  if (profit > class4Lower) {
    const mid = Math.min(profit, class4Upper) - class4Lower
    const above = Math.max(0, profit - class4Upper)
    ni += mid * class4LowerRate + above * class4UpperRate
  }
  return ni
}

function calcStudentLoan(grossAnnual: number, plan: string): number {
  const config = STUDENT_LOAN_THRESHOLDS[plan as keyof typeof STUDENT_LOAN_THRESHOLDS]
  if (!config) return 0
  const repayable = Math.max(0, grossAnnual - config.threshold)
  return repayable * config.rate
}

function getMarginalRate(taxableIncome: number, scotland: boolean): number {
  const bands = scotland ? SCOTLAND_BANDS : ENGLAND_WALES_BANDS
  for (let i = bands.length - 1; i >= 0; i--) {
    if (taxableIncome > bands[i].from) return bands[i].rate
  }
  return 0
}

export function calculateTax(input: TaxInput): TaxBreakdown {
  const { grossIncome, taxCode, payFrequency, pensionPct, studentLoanPlan, scotland, employmentType } = input
  const periods = PERIODS[payFrequency] ?? 12

  const parsed: ParsedTaxCode = parseTaxCode(taxCode)
  const bands = scotland ? SCOTLAND_BANDS : ENGLAND_WALES_BANDS

  // Pension deduction comes off gross before tax
  const pensionDeduction = grossIncome * (pensionPct / 100)
  const incomeAfterPension = grossIncome - pensionDeduction

  // Taper PA only for standard (non K-code) codes
  const basePa = parsed.personalAllowance
  const pa = parsed.isKCode || basePa <= 0 ? basePa : taperPersonalAllowance(basePa, incomeAfterPension)

  // Taxable income: for K codes, pa is negative (adds to income)
  const taxableIncome = parsed.isKCode
    ? incomeAfterPension + Math.abs(pa)
    : Math.max(0, incomeAfterPension - pa)

  const incomeTax = parseTaxCode(taxCode).raw.toUpperCase().includes('D0')
    ? Math.max(0, incomeAfterPension) * 0.40
    : parseTaxCode(taxCode).raw.toUpperCase().includes('D1')
    ? Math.max(0, incomeAfterPension) * 0.45
    : parseTaxCode(taxCode).raw.toUpperCase() === 'BR'
    ? Math.max(0, incomeAfterPension) * 0.20
    : calcIncomeTax(taxableIncome, bands)

  const nationalInsurance =
    employmentType === 'self_employed' || employmentType === 'director'
      ? calcNISelfEmployed(grossIncome)
      : calcNIEmployee(grossIncome)

  const studentLoan = studentLoanPlan !== 'none' ? calcStudentLoan(grossIncome, studentLoanPlan) : 0

  const totalDeductions = incomeTax + nationalInsurance + studentLoan + pensionDeduction
  const netAnnual = Math.max(0, grossIncome - totalDeductions)

  const effectiveRate = grossIncome > 0 ? (incomeTax + nationalInsurance) / grossIncome : 0
  const marginalRate = getMarginalRate(taxableIncome, scotland)

  return {
    grossAnnual: grossIncome,
    personalAllowance: Math.max(0, pa),
    taxableIncome,
    incomeTax,
    nationalInsurance,
    studentLoan,
    pensionDeduction,
    netAnnual,
    effectiveRate,
    marginalRate,
    perPeriod: {
      gross: grossIncome / periods,
      incomeTax: incomeTax / periods,
      ni: nationalInsurance / periods,
      studentLoan: studentLoan / periods,
      pension: pensionDeduction / periods,
      net: netAnnual / periods,
    },
  }
}
