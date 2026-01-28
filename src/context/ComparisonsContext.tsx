import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobOffer } from '../lib/payCalculator';

const STORAGE_KEYS = {
  jobComparisons: 'saved_job_comparisons',
  stateComparisons: 'saved_state_comparisons',
} as const;

const MAX_SAVED_COMPARISONS = 10;

export interface SavedJobComparison {
  id: string;
  name: string;
  jobs: JobOffer[];
  winnerIndex: number;
  savedAt: string;
}

export interface SavedStateComparison {
  id: string;
  name: string;
  currentState: string;
  newState: string;
  difference: number;
  differencePerMonth: number;
  savedAt: string;
}

interface ComparisonsContextType {
  jobComparisons: SavedJobComparison[];
  stateComparisons: SavedStateComparison[];
  saveJobComparison: (comparison: Omit<SavedJobComparison, 'id' | 'savedAt'>) => void;
  saveStateComparison: (comparison: Omit<SavedStateComparison, 'id' | 'savedAt'>) => void;
  deleteJobComparison: (id: string) => void;
  deleteStateComparison: (id: string) => void;
  clearAllComparisons: () => void;
}

const ComparisonsContext = createContext<ComparisonsContextType | undefined>(undefined);

interface ComparisonsProviderProps {
  children: ReactNode;
}

export function ComparisonsProvider({ children }: ComparisonsProviderProps) {
  const [jobComparisons, setJobComparisons] = useState<SavedJobComparison[]>([]);
  const [stateComparisons, setStateComparisons] = useState<SavedStateComparison[]>([]);

  // Load saved comparisons on mount
  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    try {
      const [jobData, stateData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.jobComparisons),
        AsyncStorage.getItem(STORAGE_KEYS.stateComparisons),
      ]);

      if (jobData) {
        setJobComparisons(JSON.parse(jobData));
      }
      if (stateData) {
        setStateComparisons(JSON.parse(stateData));
      }
    } catch (error) {
      console.error('Error loading comparisons:', error);
    }
  };

  const saveJobComparison = (comparison: Omit<SavedJobComparison, 'id' | 'savedAt'>) => {
    const newComparison: SavedJobComparison = {
      ...comparison,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    };

    const updated = [newComparison, ...jobComparisons].slice(0, MAX_SAVED_COMPARISONS);
    setJobComparisons(updated);
    AsyncStorage.setItem(STORAGE_KEYS.jobComparisons, JSON.stringify(updated)).catch(console.error);
  };

  const saveStateComparison = (comparison: Omit<SavedStateComparison, 'id' | 'savedAt'>) => {
    const newComparison: SavedStateComparison = {
      ...comparison,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    };

    const updated = [newComparison, ...stateComparisons].slice(0, MAX_SAVED_COMPARISONS);
    setStateComparisons(updated);
    AsyncStorage.setItem(STORAGE_KEYS.stateComparisons, JSON.stringify(updated)).catch(console.error);
  };

  const deleteJobComparison = (id: string) => {
    const updated = jobComparisons.filter(c => c.id !== id);
    setJobComparisons(updated);
    AsyncStorage.setItem(STORAGE_KEYS.jobComparisons, JSON.stringify(updated)).catch(console.error);
  };

  const deleteStateComparison = (id: string) => {
    const updated = stateComparisons.filter(c => c.id !== id);
    setStateComparisons(updated);
    AsyncStorage.setItem(STORAGE_KEYS.stateComparisons, JSON.stringify(updated)).catch(console.error);
  };

  const clearAllComparisons = () => {
    setJobComparisons([]);
    setStateComparisons([]);
    AsyncStorage.multiRemove([
      STORAGE_KEYS.jobComparisons,
      STORAGE_KEYS.stateComparisons,
    ]).catch(console.error);
  };

  return (
    <ComparisonsContext.Provider
      value={{
        jobComparisons,
        stateComparisons,
        saveJobComparison,
        saveStateComparison,
        deleteJobComparison,
        deleteStateComparison,
        clearAllComparisons,
      }}
    >
      {children}
    </ComparisonsContext.Provider>
  );
}

export function useComparisons(): ComparisonsContextType {
  const context = useContext(ComparisonsContext);
  if (!context) {
    throw new Error('useComparisons must be used within ComparisonsProvider');
  }
  return context;
}
