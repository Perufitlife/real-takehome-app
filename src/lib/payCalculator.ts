// Pay Calculator for US Workers
// Includes Federal Tax, FICA, and State Tax calculations

export interface PayInput {
  payType: 'salary' | 'hourly';
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek: number;
  state: string; // 'TX', 'CA', etc.
  filingStatus?: 'single' | 'married' | 'head_of_household';
}

export interface PayResult {
  grossAnnual: number;
  grossBiweekly: number;
  grossWeekly: number;
  grossHourly: number;
  
  federalTax: number;
  federalTaxBiweekly: number;
  ficaTax: number;
  ficaTaxBiweekly: number;
  stateTax: number;
  stateTaxBiweekly: number;
  totalTax: number;
  taxPercentage: number;
  
  netAnnual: number;
  netBiweekly: number;
  netWeekly: number;
  netHourly: number;
}

// 2024 Federal Tax Brackets
const FEDERAL_TAX_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// Standard Deductions 2024
const STANDARD_DEDUCTIONS_2024 = {
  single: 14600,
  married: 29200,
  head_of_household: 21900,
};

// FICA Tax Rates
const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_WAGE_BASE = 168600; // 2024
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009; // Additional 0.9% on income over $200k
const ADDITIONAL_MEDICARE_THRESHOLD = 200000;

// State Tax Rates (simplified for MVP)
const STATE_TAX_RATES: Record<string, number> = {
  TX: 0, // No state income tax
  FL: 0,
  NV: 0,
  WA: 0,
  WY: 0,
  SD: 0,
  TN: 0,
  AK: 0,
  NH: 0,
  CA: 0.093, // Simplified CA rate
  NY: 0.065, // Simplified NY rate
  IL: 0.0495,
  PA: 0.0307,
  OH: 0.039,
  GA: 0.0575,
  NC: 0.0475,
  MI: 0.0425,
  MA: 0.05,
  VA: 0.0575,
  NJ: 0.0637,
};

function calculateFederalTax(
  grossAnnual: number,
  filingStatus: 'single' | 'married' | 'head_of_household' = 'single'
): number {
  const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus];
  const taxableIncome = Math.max(0, grossAnnual - standardDeduction);
  
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus];
  let tax = 0;
  
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }
  }
  
  return tax;
}

function calculateFICA(grossAnnual: number): number {
  // Social Security (capped)
  const socialSecurityWages = Math.min(grossAnnual, SOCIAL_SECURITY_WAGE_BASE);
  const socialSecurityTax = socialSecurityWages * SOCIAL_SECURITY_RATE;
  
  // Medicare (not capped)
  let medicareTax = grossAnnual * MEDICARE_RATE;
  
  // Additional Medicare tax on high earners
  if (grossAnnual > ADDITIONAL_MEDICARE_THRESHOLD) {
    const additionalMedicareWages = grossAnnual - ADDITIONAL_MEDICARE_THRESHOLD;
    medicareTax += additionalMedicareWages * ADDITIONAL_MEDICARE_RATE;
  }
  
  return socialSecurityTax + medicareTax;
}

function calculateStateTax(grossAnnual: number, state: string): number {
  const rate = STATE_TAX_RATES[state] || 0;
  return grossAnnual * rate;
}

export function calculateTakeHomePay(input: PayInput): PayResult {
  // Calculate gross annual income
  let grossAnnual: number;
  
  if (input.payType === 'hourly' && input.hourlyRate) {
    grossAnnual = input.hourlyRate * input.hoursPerWeek * 52;
  } else if (input.payType === 'salary' && input.annualSalary) {
    grossAnnual = input.annualSalary;
  } else {
    throw new Error('Invalid pay input');
  }
  
  // Calculate taxes
  const filingStatus = input.filingStatus || 'single';
  const federalTax = calculateFederalTax(grossAnnual, filingStatus);
  const ficaTax = calculateFICA(grossAnnual);
  const stateTax = calculateStateTax(grossAnnual, input.state);
  
  const totalTax = federalTax + ficaTax + stateTax;
  const netAnnual = grossAnnual - totalTax;
  
  // Calculate different pay periods
  const grossBiweekly = grossAnnual / 26;
  const grossWeekly = grossAnnual / 52;
  const grossHourly = grossAnnual / (input.hoursPerWeek * 52);
  
  const netBiweekly = netAnnual / 26;
  const netWeekly = netAnnual / 52;
  const netHourly = netAnnual / (input.hoursPerWeek * 52);
  
  const federalTaxBiweekly = federalTax / 26;
  const ficaTaxBiweekly = ficaTax / 26;
  const stateTaxBiweekly = stateTax / 26;
  
  const taxPercentage = (totalTax / grossAnnual) * 100;
  
  return {
    grossAnnual,
    grossBiweekly,
    grossWeekly,
    grossHourly,
    
    federalTax,
    federalTaxBiweekly,
    ficaTax,
    ficaTaxBiweekly,
    stateTax,
    stateTaxBiweekly,
    totalTax,
    taxPercentage,
    
    netAnnual,
    netBiweekly,
    netWeekly,
    netHourly,
  };
}

// Helper function to bucket hourly rate for analytics
export function getHourlyRateBucket(hourlyRate: number): string {
  if (hourlyRate < 15) return '<15';
  if (hourlyRate < 20) return '15-20';
  if (hourlyRate < 30) return '20-30';
  if (hourlyRate < 40) return '30-40';
  return '>40';
}

// Helper function to bucket hours per week for analytics
export function getHoursPerWeekBucket(hours: number): string {
  if (hours <= 20) return '<=20';
  if (hours <= 39) return '21-39';
  if (hours === 40) return '40';
  return '>40';
}
