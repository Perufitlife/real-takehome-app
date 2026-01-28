import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePayInput } from '../src/context/PayInputContext';
import { hasFullBreakdown } from '../src/lib/subscriptions';
import { Colors } from '../src/constants/theme';

export default function Index() {
  const router = useRouter();
  const payInput = usePayInput();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNavigation = async () => {
      try {
        const isPremium = await hasFullBreakdown();
        const isProfileComplete = payInput.isComplete();
        
        if (isPremium && isProfileComplete) {
          // Premium user with complete profile -> Dashboard
          router.replace('/(tabs)');
        } else if (isProfileComplete) {
          // Profile complete but not premium -> Results (show value before paywall)
          router.replace('/results?firstTime=true');
        } else {
          // New user -> Onboarding
          router.replace('/(onboarding)/info');
        }
      } catch (error) {
        console.error('Navigation check failed:', error);
        // Fallback to onboarding
        router.replace('/(onboarding)/info');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Small delay to ensure context is ready
    const timer = setTimeout(checkNavigation, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
