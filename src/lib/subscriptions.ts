import Purchases, { CustomerInfo, PurchasesOfferings } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let isConfigured = false;

// Detectar si estamos en Expo Go (desarrollo) vs build nativo (producción)
const isExpoGo = Constants.appOwnership === 'expo';

// Keys for AsyncStorage (Expo Go testing)
const PREMIUM_KEY = 'premium_status';
const PREMIUM_PLAN_KEY = 'premium_plan';

if (isExpoGo) {
  console.log('🟢 Running in Expo Go - Using local premium status');
}

export const initializeRevenueCat = async () => {
  const apiKey = process.env.REVENUECAT_API_KEY;
  
  if (!apiKey) {
    console.warn('RevenueCat API key not found. Subscriptions will be disabled.');
    return;
  }

  try {
    Purchases.configure({ apiKey });
    isConfigured = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
};

// Set premium status (for Expo Go testing)
export const setPremiumStatus = async (isPremium: boolean, plan?: 'monthly' | 'annual'): Promise<void> => {
  await AsyncStorage.setItem(PREMIUM_KEY, isPremium ? 'true' : 'false');
  if (plan) {
    await AsyncStorage.setItem(PREMIUM_PLAN_KEY, plan);
  }
};

// Get premium status (for Expo Go testing)
export const getPremiumStatus = async (): Promise<boolean> => {
  const status = await AsyncStorage.getItem(PREMIUM_KEY);
  return status === 'true';
};

// Get premium plan type
export const getPremiumPlan = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(PREMIUM_PLAN_KEY);
};

// Clear premium status (for testing/reset)
export const clearPremiumStatus = async (): Promise<void> => {
  await AsyncStorage.multiRemove([PREMIUM_KEY, PREMIUM_PLAN_KEY]);
};

export const checkEntitlement = async (entitlementId: string): Promise<boolean> => {
  // In Expo Go, check local storage
  if (isExpoGo) {
    const status = await AsyncStorage.getItem(PREMIUM_KEY);
    return status === 'true';
  }

  if (!isConfigured) {
    console.warn('RevenueCat not configured');
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[entitlementId] !== undefined;
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return false;
  }
};

export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  // Bypass en Expo Go - retornar mock offerings
  if (isExpoGo) {
    console.log('🟢 Expo Go: Returning mock offerings');
    return {
      current: {
        monthly: {
          product: {
            priceString: '$9.99',
            price: 9.99,
          },
        },
        annual: {
          product: {
            priceString: '$59.99',
            price: 59.99,
          },
        },
      },
    } as any;
  }

  if (!isConfigured) {
    console.warn('RevenueCat not configured');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
};

export const purchasePackage = async (pkg: any, plan?: 'monthly' | 'annual'): Promise<{ customerInfo: CustomerInfo }> => {
  // Bypass en Expo Go - simular compra exitosa y persistir
  if (isExpoGo) {
    console.log('🟢 Expo Go: Simulating successful purchase');
    // Simular un pequeño delay para que se vea real
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Persistir el estado premium
    await setPremiumStatus(true, plan);
    return { customerInfo: {} as CustomerInfo };
  }

  if (!isConfigured) {
    throw new Error('RevenueCat not configured');
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      throw new Error('Purchase cancelled');
    }
    console.error('Error purchasing package:', error);
    throw error;
  }
};

export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (!isConfigured) {
    console.warn('RevenueCat not configured');
    return null;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return null;
  }
};

// Helper to check if user has the full breakdown entitlement
export const hasFullBreakdown = async (): Promise<boolean> => {
  // In Expo Go, check local storage
  if (isExpoGo) {
    const status = await AsyncStorage.getItem(PREMIUM_KEY);
    return status === 'true';
  }
  
  return await checkEntitlement('full_breakdown');
};
