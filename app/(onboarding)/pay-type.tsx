import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { Colors, Spacing, moderateScale, isSmallDevice, isTablet, MAX_CONTENT_WIDTH } from '../../src/constants/theme';
import { OnboardingHeader, OptionCard } from '../../src/components';

const TOTAL_STEPS = 7;

export default function PayTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPayType } = usePayInput();

  useEffect(() => {
    trackEvent('onboarding_step_viewed', { step: 'pay_type' });
  }, []);

  const handleSelect = (type: 'salary' | 'hourly') => {
    setPayType(type);
    trackEvent('pay_type_selected', { pay_type: type });
    
    if (type === 'salary') {
      router.push('/(onboarding)/salary');
    } else {
      router.push('/(onboarding)/hourly');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.contentWrapper}>
        {/* Header with Back & Progress */}
        <OnboardingHeader currentStep={1} totalSteps={TOTAL_STEPS} />

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>How do you get paid?</Text>
          <Text style={styles.subtitle}>Choose the one that matches your job</Text>

          {/* Options */}
          <View style={styles.options}>
            {/* Hourly - Primary recommendation */}
            <OptionCard
              title="Hourly"
              subtitle="Paid per hour ($18/hr)"
              icon="time-outline"
              badge="Most common"
              recommended
              onPress={() => handleSelect('hourly')}
            />

            {/* Salary */}
            <OptionCard
              title="Salary"
              subtitle="Fixed yearly ($60,000/yr)"
              icon="briefcase-outline"
              onPress={() => handleSelect('salary')}
            />
          </View>

          {/* Footer Hint */}
          <Text style={styles.footerHint}>
            Most service, retail & warehouse jobs are hourly.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    ...(isTablet ? {
      alignItems: 'center' as const,
    } : {}),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: isTablet ? MAX_CONTENT_WIDTH : undefined,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: isSmallDevice ? Spacing.xl : Spacing.huge,
    width: '100%',
    maxWidth: isTablet ? MAX_CONTENT_WIDTH : undefined,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  options: {
    marginBottom: Spacing.xl,
  },
  footerHint: {
    fontSize: moderateScale(14),
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
