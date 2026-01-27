import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

let posthogClient: PostHog | null = null;

export const initializeAnalytics = async () => {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    console.warn('PostHog API key not found. Analytics will be disabled.');
    return;
  }

  try {
    posthogClient = await PostHog.initAsync(apiKey, {
      host,
      captureApplicationLifecycleEvents: true,
      captureDeepLinks: true,
    });
    console.log('PostHog initialized successfully');
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
};

export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Event not tracked:', eventName);
    return;
  }

  try {
    posthogClient.capture(eventName, properties);
  } catch (error) {
    console.error('Error tracking event:', eventName, error);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (!posthogClient) return;
  
  try {
    posthogClient.identify(userId, properties);
  } catch (error) {
    console.error('Error identifying user:', error);
  }
};

export const setUserProperty = (property: string, value: any) => {
  if (!posthogClient) return;
  
  try {
    posthogClient.capture('$set', { $set: { [property]: value } });
  } catch (error) {
    console.error('Error setting user property:', error);
  }
};

export const resetUser = () => {
  if (!posthogClient) return;
  
  try {
    posthogClient.reset();
  } catch (error) {
    console.error('Error resetting user:', error);
  }
};

// Helper to get build version
export const getBuildVersion = () => {
  return Constants.expoConfig?.version || '1.0.0';
};
