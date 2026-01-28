import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { Stack } from 'expo-router';
import { Asset } from 'expo-asset';
import { initializeAnalytics, trackEvent, getBuildVersion } from '../src/lib/analytics';
import { incrementAppOpen } from '../src/lib/reviewService';
import { PayInputProvider } from '../src/context/PayInputContext';
import { ComparisonsProvider } from '../src/context/ComparisonsContext';
import { initializeRevenueCat } from '../src/lib/subscriptions';

import { onboardingLogo } from '../src/assets/onboardingLogo';

export default function RootLayout() {
  useEffect(() => {
    // Preload onboarding logo so it shows with the rest of the first screen (avoids “logo loads last”)
    Asset.loadAsync(onboardingLogo).catch(() => {});
  }, []);

  useEffect(() => {
    // Defer heavy init until after first frame paints — avoids perceived delay on cold start
    const task = InteractionManager.runAfterInteractions(() => {
      const init = async () => {
        await initializeAnalytics();
        await initializeRevenueCat();
        await incrementAppOpen();
        trackEvent('app_opened', { source: 'cold', build_version: getBuildVersion() });
      };
      init();
    });
    return () => task.cancel();
  }, []);

  return (
    <PayInputProvider>
      <ComparisonsProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffffff' }
          }}
        />
      </ComparisonsProvider>
    </PayInputProvider>
  );
}
