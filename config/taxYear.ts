// 2025/26 UK tax year — update this file annually
export const TAX_YEAR = '2025/26'

export const ENGLAND_WALES_BANDS = [
  { from: 0, to: 12570, rate: 0 },
  { from: 12570, to: 50270, rate: 0.20 },
  { from: 50270, to: 125140, rate: 0.40 },
  { from: 125140, to: Infinity, rate: 0.45 },
]

export const SCOTLAND_BANDS = [
  { from: 0, to: 12570, rate: 0 },
  { from: 12570, to: 14876, rate: 0.19 },
  { from: 14876, to: 26561, rate: 0.20 },
  { from: 26561, to: 43662, rate: 0.21 },
  { from: 43662, to: 75000, rate: 0.42 },
  { from: 75000, to: 125140, rate: 0.45 },
  { from: 125140, to: Infinity, rate: 0.48 },
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
