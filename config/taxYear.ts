// 2025/26 UK tax year — update this file annually
export const TAX_YEAR = '2025/26'

// Thresholds are relative to taxable income (gross minus personal allowance).
// The personal allowance itself is handled by parseTaxCode / calculateTax.
export const ENGLAND_WALES_BANDS = [
  { from: 0,      to: 37700,    rate: 0.20 }, // basic   (£12,571–£50,270)
  { from: 37700,  to: 112570,   rate: 0.40 }, // higher  (£50,271–£125,140)
  { from: 112570, to: Infinity, rate: 0.45 }, // additional
]

export const SCOTLAND_BANDS = [
  { from: 0,      to: 2306,     rate: 0.19 }, // starter      (£12,571–£14,876)
  { from: 2306,   to: 13991,    rate: 0.20 }, // basic        (£14,877–£26,561)
  { from: 13991,  to: 31092,    rate: 0.21 }, // intermediate (£26,562–£43,662)
  { from: 31092,  to: 62430,    rate: 0.42 }, // higher       (£43,663–£75,000)
  { from: 62430,  to: 112570,   rate: 0.45 }, // advanced     (£75,001–£125,140)
  { from: 112570, to: Infinity, rate: 0.48 }, // top
]

export const NI_EMPLOYEE = {
  lower: 12570,
  upper: 50270,
  lowerRate: 0,
  midRate: 0.08,
  upperRate: 0.02,
}

export const NI_SELF_EMPLOYED = {
  class2WeeklyRate: 3.45,
  class2Threshold: 12570,
  class4Lower: 12570,
  class4Upper: 50270,
  class4LowerRate: 0.06,
  class4UpperRate: 0.02,
}

export const STUDENT_LOAN_THRESHOLDS = {
  plan1: { threshold: 22015, rate: 0.09 },
  plan2: { threshold: 27295, rate: 0.09 },
  plan4: { threshold: 27660, rate: 0.09 },
  plan5: { threshold: 25000, rate: 0.09 },
  postgrad: { threshold: 21000, rate: 0.06 },
}

export const PERSONAL_ALLOWANCE = 12570
export const PA_TAPER_THRESHOLD = 100000
export const BASIC_RATE_LIMIT = 50270
export const HIGHER_RATE_LIMIT = 125140
