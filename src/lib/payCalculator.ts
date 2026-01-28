// Pay Calculator for US Workers
// Includes Federal Tax, FICA, and State Tax calculations

export interface PayInput {
  payType: 'salary' | 'hourly';
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek: number;
  state: string; // 'TX', 'CA', etc.
  filingStatus?: 'single' | 'married' | 'head_of_household';
  // New fields for benefits and overtime
  contribution401k?: number;
  contributionType?: 'percent' | 'dollar';
  hasOvertime?: boolean;
  overtimeMultiplier?: number;
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
  const overtimeMultiplier = input.overtimeMultiplier || 1.5;
  
  if (input.payType === 'hourly' && input.hourlyRate) {
    // Check if user works overtime and has enabled overtime calculation
    if (input.hasOvertime && input.hoursPerWeek > 40) {
      const regularHours = 40;
      const overtimeHours = input.hoursPerWeek - 40;
      const regularPay = input.hourlyRate * regularHours * 52;
      const overtimePay = input.hourlyRate * overtimeMultiplier * overtimeHours * 52;
      grossAnnual = regularPay + overtimePay;
    } else {
      grossAnnual = input.hourlyRate * input.hoursPerWeek * 52;
    }
  } else if (input.payType === 'salary' && input.annualSalary) {
    grossAnnual = input.annualSalary;
  } else {
    throw new Error('Invalid pay input');
  }
  
  // Calculate 401k contribution (pre-tax deduction)
  let contribution401kAnnual = 0;
  if (input.contribution401k && input.contribution401k > 0) {
    if (input.contributionType === 'percent') {
      contribution401kAnnual = grossAnnual * (input.contribution401k / 100);
    } else {
      // Dollar amount per paycheck (assume biweekly = 26 paychecks)
      contribution401kAnnual = input.contribution401k * 26;
    }
    // Cap at IRS limit ($23,000 for 2024)
    contribution401kAnnual = Math.min(contribution401kAnnual, 23000);
  }
  
  // Taxable income is gross minus 401k contribution
  const taxableIncome = grossAnnual - contribution401kAnnual;
  
  // Calculate taxes on taxable income (after 401k)
  const filingStatus = input.filingStatus || 'single';
  const federalTax = calculateFederalTax(taxableIncome, filingStatus);
  const ficaTax = calculateFICA(grossAnnual); // FICA is on gross, not reduced by 401k
  const stateTax = calculateStateTax(taxableIncome, input.state); // Most states also exclude 401k
  
  const totalTax = federalTax + ficaTax + stateTax;
  
  // Net is gross minus taxes minus 401k contribution
  const netAnnual = grossAnnual - totalTax - contribution401kAnnual;
  
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

// ===== NEW FEATURES =====

// Overtime Pay Calculator
export interface OvertimeScenario {
  extraHours: number;
  grossIncrease: number;
  taxesIncrease: number;
  netIncrease: number;
  effectiveTaxRate: number;
}

export function calculateOvertimePay(
  hourlyRate: number,
  regularHours: number,
  extraHours: number,
  state: string,
  filingStatus: 'single' | 'married' | 'head_of_household' = 'single'
): OvertimeScenario {
  // Base pay calculation
  const baseAnnual = hourlyRate * regularHours * 52;
  
  // Overtime is 1.5x rate
  const overtimeRate = hourlyRate * 1.5;
  const overtimeAnnual = overtimeRate * extraHours * 52;
  const newAnnual = baseAnnual + overtimeAnnual;
  
  // Calculate taxes for base and new
  const baseTaxes = 
    calculateFederalTax(baseAnnual, filingStatus) +
    calculateFICA(baseAnnual) +
    calculateStateTax(baseAnnual, state);
  
  const newTaxes = 
    calculateFederalTax(newAnnual, filingStatus) +
    calculateFICA(newAnnual) +
    calculateStateTax(newAnnual, state);
  
  const grossIncrease = overtimeAnnual;
  const taxesIncrease = newTaxes - baseTaxes;
  const netIncrease = grossIncrease - taxesIncrease;
  const effectiveTaxRate = (taxesIncrease / grossIncrease) * 100;
  
  return {
    extraHours,
    grossIncrease,
    taxesIncrease,
    netIncrease,
    effectiveTaxRate,
  };
}

// Job Comparison
export interface JobOffer {
  name: string;
  hourlyRate: number;
  hoursPerWeek: number;
  state: string;
}

export interface JobComparisonResult {
  job: JobOffer;
  grossAnnual: number;
  netAnnual: number;
  netBiweekly: number;
  netMonthly: number;
  taxPercentage: number;
}

export function compareJobs(
  jobs: JobOffer[],
  filingStatus: 'single' | 'married' | 'head_of_household' = 'single'
): JobComparisonResult[] {
  return jobs.map(job => {
    const result = calculateTakeHomePay({
      payType: 'hourly',
      hourlyRate: job.hourlyRate,
      hoursPerWeek: job.hoursPerWeek,
      state: job.state,
      filingStatus,
    });
    
    return {
      job,
      grossAnnual: result.grossAnnual,
      netAnnual: result.netAnnual,
      netBiweekly: result.netBiweekly,
      netMonthly: result.netAnnual / 12,
      taxPercentage: result.taxPercentage,
    };
  });
}

// State Comparison
export interface StateComparisonResult {
  currentState: string;
  newState: string;
  currentNetAnnual: number;
  newNetAnnual: number;
  difference: number;
  differencePerMonth: number;
  currentTaxRate: number;
  newTaxRate: number;
}

export function compareStates(
  hourlyRate: number,
  hoursPerWeek: number,
  currentState: string,
  newState: string,
  filingStatus: 'single' | 'married' | 'head_of_household' = 'single'
): StateComparisonResult {
  const currentResult = calculateTakeHomePay({
    payType: 'hourly',
    hourlyRate,
    hoursPerWeek,
    state: currentState,
    filingStatus,
  });
  
  const newResult = calculateTakeHomePay({
    payType: 'hourly',
    hourlyRate,
    hoursPerWeek,
    state: newState,
    filingStatus,
  });
  
  const difference = newResult.netAnnual - currentResult.netAnnual;
  
  return {
    currentState,
    newState,
    currentNetAnnual: currentResult.netAnnual,
    newNetAnnual: newResult.netAnnual,
    difference,
    differencePerMonth: difference / 12,
    currentTaxRate: currentResult.taxPercentage,
    newTaxRate: newResult.taxPercentage,
  };
}

// Monthly Forecast
export interface WeekForecast {
  weekNumber: number;
  hours: number;
  overtimeHours: number;
  grossPay: number;
  netPay: number;
}

export interface MonthlyForecast {
  weeks: WeekForecast[];
  totalGross: number;
  totalNet: number;
  totalHours: number;
  avgWeeklyNet: number;
}

export function forecastMonthly(
  hourlyRate: number,
  weeklyHours: number[],
  state: string,
  filingStatus: 'single' | 'married' | 'head_of_household' = 'single'
): MonthlyForecast {
  const weeks: WeekForecast[] = weeklyHours.map((hours, index) => {
    const regularHours = Math.min(hours, 40);
    const overtimeHours = Math.max(0, hours - 40);
    
    // Calculate weekly gross
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * 1.5;
    const weeklyGross = regularPay + overtimePay;
    
    // Estimate net (approximate weekly from annual)
    const annualEstimate = weeklyGross * 52;
    const result = calculateTakeHomePay({
      payType: 'hourly',
      hourlyRate,
      hoursPerWeek: hours,
      state,
      filingStatus,
    });
    const weeklyNet = result.netWeekly;
    
    return {
      weekNumber: index + 1,
      hours,
      overtimeHours,
      grossPay: weeklyGross,
      netPay: weeklyNet,
    };
  });
  
  const totalGross = weeks.reduce((sum, week) => sum + week.grossPay, 0);
  const totalNet = weeks.reduce((sum, week) => sum + week.netPay, 0);
  const totalHours = weeks.reduce((sum, week) => sum + week.hours, 0);
  
  return {
    weeks,
    totalGross,
    totalNet,
    totalHours,
    avgWeeklyNet: totalNet / weeks.length,
  };
}

// Yearly Forecast
export interface YearlyForecast {
  monthlyNet: number[];
  totalNet: number;
  avgMonthlyNet: number;
  totalHours: number;
  avgWeeklyHours: number;
}

export function forecastYearly(
  hourlyRate: number,
  avgHoursPerWeek: number,
  state: string,
  filingStatus: 'single' | 'married' | 'head_of_household' = 'single'
): YearlyForecast {
  const result = calculateTakeHomePay({
    payType: 'hourly',
    hourlyRate,
    hoursPerWeek: avgHoursPerWeek,
    state,
    filingStatus,
  });
  
  // Monthly projection (52 weeks / 12 months)
  const monthlyNet = result.netAnnual / 12;
  
  return {
    monthlyNet: Array(12).fill(monthlyNet),
    totalNet: result.netAnnual,
    avgMonthlyNet: monthlyNet,
    totalHours: avgHoursPerWeek * 52,
    avgWeeklyHours: avgHoursPerWeek,
  };
}

// Tax Bracket Proximity
export interface TaxBracketInfo {
  currentBracket: number;
  nextBracket: number;
  distanceToNextBracket: number;
  withinThreshold: boolean; // Within $5k of next bracket
}

export function calculateTaxBracketProximity(
  grossAnnual: number,
  filingStatus: 'single' | 'married' | 'head_of_household' = 'single'
): TaxBracketInfo {
  const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus];
  const taxableIncome = Math.max(0, grossAnnual - standardDeduction);
  
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus];
  let currentBracket = 0.10;
  let nextBracket = 0.12;
  let distanceToNextBracket = 0;
  
  for (let i = 0; i < brackets.length; i++) {
    if (taxableIncome >= brackets[i].min && taxableIncome < brackets[i].max) {
      currentBracket = brackets[i].rate;
      if (i < brackets.length - 1) {
        nextBracket = brackets[i + 1].rate;
        distanceToNextBracket = brackets[i].max - taxableIncome;
      }
      break;
    }
  }
  
  return {
    currentBracket: currentBracket * 100,
    nextBracket: nextBracket * 100,
    distanceToNextBracket,
    withinThreshold: distanceToNextBracket > 0 && distanceToNextBracket < 5000,
  };
}

// Get state name from code
export function getStateName(code: string): string {
  const states: Record<string, string> = {
    TX: 'Texas', FL: 'Florida', CA: 'California', NY: 'New York',
    IL: 'Illinois', PA: 'Pennsylvania', OH: 'Ohio', GA: 'Georgia',
    NC: 'North Carolina', MI: 'Michigan', MA: 'Massachusetts',
    VA: 'Virginia', NJ: 'New Jersey', NV: 'Nevada', WA: 'Washington',
    WY: 'Wyoming', SD: 'South Dakota', TN: 'Tennessee', AK: 'Alaska',
    NH: 'New Hampshire', AZ: 'Arizona', IN: 'Indiana', MO: 'Missouri',
    MD: 'Maryland', WI: 'Wisconsin', CO: 'Colorado', MN: 'Minnesota',
    SC: 'South Carolina', AL: 'Alabama', LA: 'Louisiana', KY: 'Kentucky',
    OR: 'Oregon', OK: 'Oklahoma', CT: 'Connecticut', UT: 'Utah',
    IA: 'Iowa', AR: 'Arkansas', MS: 'Mississippi', KS: 'Kansas',
    NM: 'New Mexico', NE: 'Nebraska', ID: 'Idaho', WV: 'West Virginia',
    HI: 'Hawaii', ME: 'Maine', MT: 'Montana', RI: 'Rhode Island',
    DE: 'Delaware', ND: 'North Dakota', VT: 'Vermont', DC: 'Washington DC',
  };
  return states[code] || code;
}

// Get all states with tax info
export function getAllStatesWithTax(): Array<{code: string; name: string; taxRate: number}> {
  return Object.keys(STATE_TAX_RATES).map(code => ({
    code,
    name: getStateName(code),
    taxRate: STATE_TAX_RATES[code],
  })).sort((a, b) => a.name.localeCompare(b.name));
}
