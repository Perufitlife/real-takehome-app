import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateTakeHomePay, PayResult, PayInput } from '../lib/payCalculator';

const STORAGE_KEYS = {
  payType: 'payType',
  annualSalary: 'annualSalary',
  hourlyRate: 'hourlyRate',
  hoursPerWeek: 'hoursPerWeek',
  state: 'state',
  filingStatus: 'filingStatus',
  // New fields for benefits and overtime
  contribution401k: 'contribution401k',
  contributionType: 'contributionType',
  hasOvertime: 'hasOvertime',
  overtimeMultiplier: 'overtimeMultiplier',
} as const;

interface PayInputContextType {
  payType: 'salary' | 'hourly' | null;
  annualSalary: number | null;
  hourlyRate: number | null;
  hoursPerWeek: number | null;
  state: string | null;
  filingStatus: 'single' | 'married' | 'head_of_household' | null;
  // New fields
  contribution401k: number | null;
  contributionType: 'percent' | 'dollar' | null;
  hasOvertime: boolean | null;
  overtimeMultiplier: number;

  setPayType: (type: 'salary' | 'hourly') => void;
  setAnnualSalary: (amount: number) => void;
  setHourlyRate: (rate: number) => void;
  setHoursPerWeek: (hours: number) => void;
  setState: (state: string) => void;
  setFilingStatus: (status: 'single' | 'married' | 'head_of_household') => void;
  // New setters
  setContribution401k: (amount: number | null) => void;
  setContributionType: (type: 'percent' | 'dollar' | null) => void;
  setHasOvertime: (has: boolean | null) => void;
  setOvertimeMultiplier: (multiplier: number) => void;

  calculatePay: () => PayResult | null;
  resetInputs: () => void;
  isComplete: () => boolean;
}

const PayInputContext = createContext<PayInputContextType | undefined>(undefined);

interface PayInputProviderProps {
  children: ReactNode;
}

export function PayInputProvider({ children }: PayInputProviderProps) {
  const [payType, setPayTypeState] = useState<'salary' | 'hourly' | null>(null);
  const [annualSalary, setAnnualSalaryState] = useState<number | null>(null);
  const [hourlyRate, setHourlyRateState] = useState<number | null>(null);
  const [hoursPerWeek, setHoursPerWeekState] = useState<number | null>(null);
  const [state, setStateState] = useState<string | null>(null);
  const [filingStatus, setFilingStatusState] = useState<'single' | 'married' | 'head_of_household' | null>(null);
  // New state fields
  const [contribution401k, setContribution401kState] = useState<number | null>(null);
  const [contributionType, setContributionTypeState] = useState<'percent' | 'dollar' | null>(null);
  const [hasOvertime, setHasOvertimeState] = useState<boolean | null>(null);
  const [overtimeMultiplier, setOvertimeMultiplierState] = useState<number>(1.5);

  useEffect(() => {
    (async () => {
      try {
        const [
          loadedPayType, 
          loadedAnnualSalary, 
          loadedHourlyRate, 
          loadedHoursPerWeek, 
          loadedState, 
          loadedFilingStatus,
          loadedContribution401k,
          loadedContributionType,
          loadedHasOvertime,
          loadedOvertimeMultiplier,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.payType),
          AsyncStorage.getItem(STORAGE_KEYS.annualSalary),
          AsyncStorage.getItem(STORAGE_KEYS.hourlyRate),
          AsyncStorage.getItem(STORAGE_KEYS.hoursPerWeek),
          AsyncStorage.getItem(STORAGE_KEYS.state),
          AsyncStorage.getItem(STORAGE_KEYS.filingStatus),
          AsyncStorage.getItem(STORAGE_KEYS.contribution401k),
          AsyncStorage.getItem(STORAGE_KEYS.contributionType),
          AsyncStorage.getItem(STORAGE_KEYS.hasOvertime),
          AsyncStorage.getItem(STORAGE_KEYS.overtimeMultiplier),
        ]);
        if (loadedPayType) setPayTypeState(loadedPayType as 'salary' | 'hourly');
        if (loadedAnnualSalary != null) setAnnualSalaryState(Number(loadedAnnualSalary));
        if (loadedHourlyRate != null) setHourlyRateState(Number(loadedHourlyRate));
        if (loadedHoursPerWeek != null) setHoursPerWeekState(Number(loadedHoursPerWeek));
        if (loadedState) setStateState(loadedState);
        if (loadedFilingStatus) setFilingStatusState(loadedFilingStatus as 'single' | 'married' | 'head_of_household');
        // New fields
        if (loadedContribution401k != null) setContribution401kState(Number(loadedContribution401k));
        if (loadedContributionType) setContributionTypeState(loadedContributionType as 'percent' | 'dollar');
        if (loadedHasOvertime != null) setHasOvertimeState(loadedHasOvertime === 'true');
        if (loadedOvertimeMultiplier != null) setOvertimeMultiplierState(Number(loadedOvertimeMultiplier));
      } catch (e) {
        console.warn('PayInputContext: load from storage failed', e);
      }
    })();
  }, []);

  const setPayType = (type: 'salary' | 'hourly') => {
    setPayTypeState(type);
    AsyncStorage.setItem(STORAGE_KEYS.payType, type).catch(() => {});
  };

  const setAnnualSalary = (amount: number) => {
    setAnnualSalaryState(amount);
    AsyncStorage.setItem(STORAGE_KEYS.annualSalary, String(amount)).catch(() => {});
  };

  const setHourlyRate = (rate: number) => {
    setHourlyRateState(rate);
    AsyncStorage.setItem(STORAGE_KEYS.hourlyRate, String(rate)).catch(() => {});
  };

  const setHoursPerWeek = (hours: number) => {
    setHoursPerWeekState(hours);
    AsyncStorage.setItem(STORAGE_KEYS.hoursPerWeek, String(hours)).catch(() => {});
  };

  const setState = (stateValue: string) => {
    setStateState(stateValue);
    AsyncStorage.setItem(STORAGE_KEYS.state, stateValue).catch(() => {});
  };

  const setFilingStatus = (status: 'single' | 'married' | 'head_of_household') => {
    setFilingStatusState(status);
    AsyncStorage.setItem(STORAGE_KEYS.filingStatus, status).catch(() => {});
  };

  // New setters
  const setContribution401k = (amount: number | null) => {
    setContribution401kState(amount);
    if (amount !== null) {
      AsyncStorage.setItem(STORAGE_KEYS.contribution401k, String(amount)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.contribution401k).catch(() => {});
    }
  };

  const setContributionType = (type: 'percent' | 'dollar' | null) => {
    setContributionTypeState(type);
    if (type !== null) {
      AsyncStorage.setItem(STORAGE_KEYS.contributionType, type).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.contributionType).catch(() => {});
    }
  };

  const setHasOvertime = (has: boolean | null) => {
    setHasOvertimeState(has);
    if (has !== null) {
      AsyncStorage.setItem(STORAGE_KEYS.hasOvertime, String(has)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.hasOvertime).catch(() => {});
    }
  };

  const setOvertimeMultiplier = (multiplier: number) => {
    setOvertimeMultiplierState(multiplier);
    AsyncStorage.setItem(STORAGE_KEYS.overtimeMultiplier, String(multiplier)).catch(() => {});
  };

  const calculatePay = (): PayResult | null => {
    if (!payType || !hoursPerWeek || !state) return null;
    if (payType === 'hourly' && !hourlyRate) return null;
    if (payType === 'salary' && !annualSalary) return null;
    try {
      return calculateTakeHomePay({
        payType,
        hoursPerWeek,
        state,
        annualSalary: annualSalary || undefined,
        hourlyRate: hourlyRate || undefined,
        filingStatus: filingStatus || undefined,
        contribution401k: contribution401k || undefined,
        contributionType: contributionType || undefined,
        hasOvertime: hasOvertime || undefined,
        overtimeMultiplier: overtimeMultiplier,
      });
    } catch (error) {
      console.error('Error calculating pay:', error);
      return null;
    }
  };

  const isComplete = (): boolean => {
    if (!payType || !hoursPerWeek || !state) return false;
    if (payType === 'hourly' && !hourlyRate) return false;
    if (payType === 'salary' && !annualSalary) return false;
    return true;
  };

  const resetInputs = () => {
    setPayTypeState(null);
    setAnnualSalaryState(null);
    setHourlyRateState(null);
    setHoursPerWeekState(null);
    setStateState(null);
    setFilingStatusState(null);
    // Reset new fields
    setContribution401kState(null);
    setContributionTypeState(null);
    setHasOvertimeState(null);
    setOvertimeMultiplierState(1.5);
    AsyncStorage.multiRemove(Object.values(STORAGE_KEYS)).catch(() => {});
  };

  const value: PayInputContextType = {
    payType,
    annualSalary,
    hourlyRate,
    hoursPerWeek,
    state,
    filingStatus,
    contribution401k,
    contributionType,
    hasOvertime,
    overtimeMultiplier,
    setPayType,
    setAnnualSalary,
    setHourlyRate,
    setHoursPerWeek,
    setState,
    setFilingStatus,
    setContribution401k,
    setContributionType,
    setHasOvertime,
    setOvertimeMultiplier,
    calculatePay,
    resetInputs,
    isComplete,
  };

  return (
    <PayInputContext.Provider value={value}>
      {children}
    </PayInputContext.Provider>
  );
}

export function usePayInput() {
  const context = useContext(PayInputContext);
  if (context === undefined) {
    throw new Error('usePayInput must be used within a PayInputProvider');
  }
  return context;
}
