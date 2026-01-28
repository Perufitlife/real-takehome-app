import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackEvent } from './analytics';

const STORAGE_KEYS = {
  reviewRequested: 'review_requested_at',
  reviewRequestCount: 'review_request_count',
  appOpenCount: 'app_open_count',
  calculationsCount: 'calculations_count',
  comparisonsSaved: 'comparisons_saved_count',
} as const;

const MIN_APP_OPENS = 3;
const MIN_CALCULATIONS = 2;
const COOLDOWN_DAYS = 60;
const MAX_REQUESTS_PER_YEAR = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function getNumber(key: string): Promise<number> {
  const value = await AsyncStorage.getItem(key);
  return value != null ? parseInt(value, 10) || 0 : 0;
}

async function getString(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

async function setNumber(key: string, value: number): Promise<void> {
  await AsyncStorage.setItem(key, String(value));
}

async function setString(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function incrementAppOpen(): Promise<void> {
  const count = await getNumber(STORAGE_KEYS.appOpenCount);
  await setNumber(STORAGE_KEYS.appOpenCount, count + 1);
}

export async function incrementCalculations(): Promise<void> {
  const count = await getNumber(STORAGE_KEYS.calculationsCount);
  await setNumber(STORAGE_KEYS.calculationsCount, count + 1);
}

export async function incrementComparisonsSaved(): Promise<void> {
  const count = await getNumber(STORAGE_KEYS.comparisonsSaved);
  await setNumber(STORAGE_KEYS.comparisonsSaved, count + 1);
}

async function getReviewRequestCount(): Promise<number> {
  return getNumber(STORAGE_KEYS.reviewRequestCount);
}

async function getLastReviewRequestAt(): Promise<number | null> {
  const value = await getString(STORAGE_KEYS.reviewRequested);
  return value != null ? parseInt(value, 10) : null;
}

async function isWithinCooldown(): Promise<{ within: boolean; daysSinceLast: number | null }> {
  const lastAt = await getLastReviewRequestAt();
  if (lastAt == null) return { within: false, daysSinceLast: null };
  const daysSinceLast = (Date.now() - lastAt) / MS_PER_DAY;
  return { within: daysSinceLast < COOLDOWN_DAYS, daysSinceLast };
}

async function isWithinYearLimit(): Promise<boolean> {
  const lastAt = await getLastReviewRequestAt();
  if (lastAt == null) return true;
  const oneYearAgo = Date.now() - 365 * MS_PER_DAY;
  if (lastAt < oneYearAgo) return true;
  const count = await getReviewRequestCount();
  return count < MAX_REQUESTS_PER_YEAR;
}

export async function shouldRequestReview(): Promise<{
  eligible: boolean;
  reason?: string;
  appOpens: number;
  calculations: number;
  requestCount: number;
  daysSinceLast: number | null;
}> {
  const appOpens = await getNumber(STORAGE_KEYS.appOpenCount);
  const calculations = await getNumber(STORAGE_KEYS.calculationsCount);
  const requestCount = await getReviewRequestCount();
  const { within: cooldownActive, daysSinceLast } = await isWithinCooldown();
  const withinYearLimit = await isWithinYearLimit();

  if (appOpens < MIN_APP_OPENS) {
    return {
      eligible: false,
      reason: 'min_app_opens',
      appOpens,
      calculations,
      requestCount,
      daysSinceLast,
    };
  }
  if (calculations < MIN_CALCULATIONS) {
    return {
      eligible: false,
      reason: 'min_calculations',
      appOpens,
      calculations,
      requestCount,
      daysSinceLast,
    };
  }
  if (cooldownActive) {
    return {
      eligible: false,
      reason: 'cooldown_active',
      appOpens,
      calculations,
      requestCount,
      daysSinceLast,
    };
  }
  if (!withinYearLimit) {
    return {
      eligible: false,
      reason: 'max_requests_per_year',
      appOpens,
      calculations,
      requestCount,
      daysSinceLast,
    };
  }

  const available = await StoreReview.isAvailableAsync();
  if (!available) {
    return {
      eligible: false,
      reason: 'store_review_unavailable',
      appOpens,
      calculations,
      requestCount,
      daysSinceLast,
    };
  }

  return {
    eligible: true,
    appOpens,
    calculations,
    requestCount,
    daysSinceLast,
  };
}

export async function maybeRequestReview(trigger: string): Promise<boolean> {
  const check = await shouldRequestReview();

  if (!check.eligible) {
    trackEvent('review_skipped', {
      trigger,
      reason: check.reason,
      app_opens: check.appOpens,
      calculations: check.calculations,
      request_count: check.requestCount,
      days_since_last: check.daysSinceLast ?? undefined,
    });
    return false;
  }

  try {
    await StoreReview.requestReview();
    const newCount = check.requestCount + 1;
    await setNumber(STORAGE_KEYS.reviewRequestCount, newCount);
    await setString(STORAGE_KEYS.reviewRequested, String(Date.now()));

    trackEvent('review_requested', {
      trigger,
      app_opens: check.appOpens,
      calculations: check.calculations,
      request_count: newCount,
    });
    return true;
  } catch (error) {
    console.error('Review request failed:', error);
    trackEvent('review_request_failed', {
      trigger,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return false;
  }
}
