import Purchases, { CustomerInfo, PurchasesOfferings } from 'react-native-purchases';

let isConfigured = false;

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

export const checkEntitlement = async (entitlementId: string): Promise<boolean> => {
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

export const purchasePackage = async (pkg: any): Promise<{ customerInfo: CustomerInfo }> => {
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
  return await checkEntitlement('full_breakdown');
};
