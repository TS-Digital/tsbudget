export type EmploymentType =
  | 'employed'
  | 'self_employed'
  | 'director'
  | 'benefits'
  | 'student'

export type PayFrequency = 'weekly' | 'fortnightly' | 'four_weekly' | 'monthly' | 'annual'

export type StudentLoanPlan = 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad'

export type BudgetMethod = 'custom' | '50/30/20' | 'zero' | 'pay_yourself_first'

export type ExpenseType = 'need' | 'want' | 'saving'

export interface TaxInput {
  employmentType: EmploymentType
  grossIncome: number
  taxCode: string
  payFrequency: PayFrequency
  pensionPct: number
  studentLoanPlan: StudentLoanPlan
  scotland: boolean
}

export interface ParsedTaxCode {
  personalAllowance: number
  isNonCumulative: boolean
  isKCode: boolean
  raw: string
}

export interface TaxBreakdown {
  grossAnnual: number
  personalAllowance: number
  taxableIncome: number
  incomeTax: number
  nationalInsurance: number
  studentLoan: number
  pensionDeduction: number
  netAnnual: number
  effectiveRate: number
  marginalRate: number
  perPeriod: {
    gross: number
    incomeTax: number
    ni: number
    studentLoan: number
    pension: number
    net: number
  }
}

export interface BudgetCategory {
  id: string
  name: string
  amount: number
  type: ExpenseType
}

export interface IncomeSource {
  id: string
  name: string
  amount: number
  frequency: PayFrequency
}

export interface BudgetAllocation {
  method: BudgetMethod
  netMonthlyIncome: number
  categories: BudgetCategory[]
  totalCommitted: number
  totalSavings: number
  leftOver: number
  savingsRate: number
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
}

export interface DebtItem {
  id: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
}

export interface CompoundProjection {
  month: number
  balance: number
}
