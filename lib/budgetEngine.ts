import type { BudgetAllocation, BudgetCategory, BudgetMethod } from '@/types/finance'

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

export const DEFAULT_CATEGORIES: Omit<BudgetCategory, 'id'>[] = [
  { name: 'Rent / Mortgage', amount: 0, type: 'need' },
  { name: 'Utilities', amount: 0, type: 'need' },
  { name: 'Food & Groceries', amount: 0, type: 'need' },
  { name: 'Transport', amount: 0, type: 'need' },
  { name: 'Health & Gym', amount: 0, type: 'need' },
  { name: 'Subscriptions', amount: 0, type: 'want' },
  { name: 'Clothing', amount: 0, type: 'want' },
  { name: 'Entertainment', amount: 0, type: 'want' },
  { name: 'Debt Repayments', amount: 0, type: 'need' },
  { name: 'Savings', amount: 0, type: 'saving' },
  { name: 'Emergency Fund', amount: 0, type: 'saving' },
  { name: 'Investments', amount: 0, type: 'saving' },
  { name: 'Miscellaneous', amount: 0, type: 'want' },
]

export function createDefaultCategories(): BudgetCategory[] {
  return DEFAULT_CATEGORIES.map((c) => ({ ...c, id: makeId() }))
}

export function apply5030_20(netMonthly: number, categories: BudgetCategory[]): BudgetCategory[] {
  const needsBudget = netMonthly * 0.5
  const wanNetWorth = netMonthly * 0.3
  const savingsBudget = netMonthly * 0.2

  const needs = categories.filter((c) => c.type === 'need')
  const wants = categories.filter((c) => c.type === 'want')
  const savings = categories.filter((c) => c.type === 'saving')

  const distributeEvenly = (items: BudgetCategory[], total: number): BudgetCategory[] => {
    if (items.length === 0) return items
    const each = total / items.length
    return items.map((c) => ({ ...c, amount: Math.round(each * 100) / 100 }))
  }

  return [
    ...distributeEvenly(needs, needsBudget),
    ...distributeEvenly(wants, wanNetWorth),
    ...distributeEvenly(savings, savingsBudget),
  ]
}

export function applyPayYourselfFirst(netMonthly: number, savingsPct: number, categories: BudgetCategory[]): BudgetCategory[] {
  const savingsAmount = netMonthly * (savingsPct / 100)
  const remainder = netMonthly - savingsAmount
  const savingsCats = categories.filter((c) => c.type === 'saving')
  const nonSavings = categories.filter((c) => c.type !== 'saving')

  const eachSaving = savingsCats.length > 0 ? savingsAmount / savingsCats.length : 0
  const eachOther = nonSavings.length > 0 ? remainder / nonSavings.length : 0

  return [
    ...savingsCats.map((c) => ({ ...c, amount: Math.round(eachSaving * 100) / 100 })),
    ...nonSavings.map((c) => ({ ...c, amount: Math.round(eachOther * 100) / 100 })),
  ]
}

export function calcBudget(
  netMonthly: number,
  categories: BudgetCategory[],
  method: BudgetMethod,
  savingsPct = 20,
): BudgetAllocation {
  let cats = categories

  if (method === '50/30/20') {
    cats = apply5030_20(netMonthly, categories)
  } else if (method === 'pay_yourself_first') {
    cats = applyPayYourselfFirst(netMonthly, savingsPct, categories)
  }

  const totalCommitted = cats.reduce((s, c) => s + (c.type !== 'saving' ? c.amount : 0), 0)
  const totalSavings = cats.reduce((s, c) => s + (c.type === 'saving' ? c.amount : 0), 0)
  const leftOver = netMonthly - totalCommitted - totalSavings
  const savingsRate = netMonthly > 0 ? (totalSavings / netMonthly) * 100 : 0

  return { method, netMonthlyIncome: netMonthly, categories: cats, totalCommitted, totalSavings, leftOver, savingsRate }
}

export function calcCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  months: number,
): { month: number; balance: number }[] {
  const monthlyRate = annualRate / 100 / 12
  const results: { month: number; balance: number }[] = []
  let balance = principal
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
    results.push({ month: m, balance: Math.round(balance * 100) / 100 })
  }
  return results
}

export function calcDebtSnowball(
  debts: { id: string; name: string; balance: number; interestRate: number; minimumPayment: number }[],
  extraMonthly: number,
): { months: number; order: string[] } {
  const sorted = [...debts].sort((a, b) => a.balance - b.balance)
  let month = 0
  const remaining = sorted.map((d) => ({ ...d, balance: d.balance }))
  const order: string[] = []

  while (remaining.some((d) => d.balance > 0)) {
    month++
    if (month > 600) break // safety cap

    let extra = extraMonthly
    for (const debt of remaining) {
      if (debt.balance <= 0) continue
      const interest = (debt.balance * debt.interestRate) / 100 / 12
      debt.balance += interest
      const payment = debt.minimumPayment + extra
      if (debt.balance <= payment) {
        extra = payment - debt.balance
        debt.balance = 0
        if (!order.includes(debt.id)) order.push(debt.id)
      } else {
        debt.balance -= payment
        extra = 0
      }
    }
  }

  return { months: month, order }
}
