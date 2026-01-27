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
} as const;

interface PayInputContextType {
  payType: 'salary' | 'hourly' | null;
  annualSalary: number | null;
  hourlyRate: number | null;
  hoursPerWeek: number | null;
  state: string | null;
  filingStatus: 'single' | 'married' | 'head_of_household' | null;

  setPayType: (type: 'salary' | 'hourly') => void;
  setAnnualSalary: (amount: number) => void;
  setHourlyRate: (rate: number) => void;
  setHoursPerWeek: (hours: number) => void;
  setState: (state: string) => void;
  setFilingStatus: (status: 'single' | 'married' | 'head_of_household') => void;

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

  useEffect(() => {
    (async () => {
      try {
        const [loadedPayType, loadedAnnualSalary, loadedHourlyRate, loadedHoursPerWeek, loadedState, loadedFilingStatus] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.payType),
          AsyncStorage.getItem(STORAGE_KEYS.annualSalary),
          AsyncStorage.getItem(STORAGE_KEYS.hourlyRate),
          AsyncStorage.getItem(STORAGE_KEYS.hoursPerWeek),
          AsyncStorage.getItem(STORAGE_KEYS.state),
          AsyncStorage.getItem(STORAGE_KEYS.filingStatus),
        ]);
        if (loadedPayType) setPayTypeState(loadedPayType as 'salary' | 'hourly');
        if (loadedAnnualSalary != null) setAnnualSalaryState(Number(loadedAnnualSalary));
        if (loadedHourlyRate != null) setHourlyRateState(Number(loadedHourlyRate));
        if (loadedHoursPerWeek != null) setHoursPerWeekState(Number(loadedHoursPerWeek));
        if (loadedState) setStateState(loadedState);
        if (loadedFilingStatus) setFilingStatusState(loadedFilingStatus as 'single' | 'married' | 'head_of_household');
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
    AsyncStorage.multiRemove(Object.values(STORAGE_KEYS)).catch(() => {});
  };

  const value: PayInputContextType = {
    payType,
    annualSalary,
    hourlyRate,
    hoursPerWeek,
    state,
    filingStatus,
    setPayType,
    setAnnualSalary,
    setHourlyRate,
    setHoursPerWeek,
    setState,
    setFilingStatus,
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
