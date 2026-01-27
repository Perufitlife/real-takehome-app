import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initializeAnalytics, trackEvent, getBuildVersion } from '../src/lib/analytics';
import { PayInputProvider } from '../src/context/PayInputContext';
import { initializeRevenueCat } from '../src/lib/subscriptions';

export default function RootLayout() {
  useEffect(() => {
    // Initialize PostHog and RevenueCat on app start
    const init = async () => {
      await initializeAnalytics();
      await initializeRevenueCat();
      
      // Track app opened event
      trackEvent('app_opened', {
        source: 'cold',
        build_version: getBuildVersion()
      });
    };
    
    init();
  }, []);

  return (
    <PayInputProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' }
        }}
      />
    </PayInputProvider>
  );
}
