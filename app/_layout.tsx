import { useEffect } from 'react';
import { InteractionManager, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Asset } from 'expo-asset';
import * as Updates from 'expo-updates';
import { initializeAnalytics, trackEvent, getBuildVersion } from '../src/lib/analytics';
import { incrementAppOpen } from '../src/lib/reviewService';
import { PayInputProvider } from '../src/context/PayInputContext';
import { ComparisonsProvider } from '../src/context/ComparisonsContext';
import { initializeRevenueCat } from '../src/lib/subscriptions';

import { onboardingLogo } from '../src/assets/onboardingLogo';

async function checkForUpdates() {
  if (__DEV__) return; // Skip in development
  
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      Alert.alert(
        'Update Available',
        'A new version has been downloaded. Restart to apply the update.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Restart Now', onPress: () => Updates.reloadAsync() },
        ]
      );
    }
  } catch (error) {
    // Silently fail - don't block app usage if update check fails
    console.log('Error checking for updates:', error);
  }
}

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
        // Check for OTA updates after other init completes
        checkForUpdates();
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
