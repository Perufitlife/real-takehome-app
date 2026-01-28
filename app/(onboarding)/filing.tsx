import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { getHourlyRateBucket, getHoursPerWeekBucket } from '../../src/lib/payCalculator';
import { Colors, Spacing, BorderRadius, scale, moderateScale } from '../../src/constants/theme';
import { OnboardingHeader, PrimaryButton } from '../../src/components';

const TOTAL_STEPS = 7;

type FilingStatus = 'single' | 'married' | 'head_of_household';

const FILING_OPTIONS: { value: FilingStatus; title: string; subtitle: string }[] = [
  { value: 'single', title: 'Single', subtitle: 'Most common for W-2' },
  { value: 'married', title: 'Married', subtitle: 'Joint filing' },
  { value: 'head_of_household', title: 'Head of Household', subtitle: 'Single parents' },
];

export default function FilingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();
  const [selectedStatus, setSelectedStatus] = useState<FilingStatus>('single');
  const mountedAt = useRef<number>(Date.now());

  useEffect(() => {
    trackEvent('filing_shown');
  }, []);

  const completeOnboarding = (status: FilingStatus, skipped: boolean) => {
    payInput.setFilingStatus(status);

    trackEvent('inputs_completed', {
      pay_type: payInput.payType || 'hourly',
      hourly_rate_bucket: payInput.hourlyRate ? getHourlyRateBucket(payInput.hourlyRate) : 'unknown',
      hours_per_week_bucket: payInput.hoursPerWeek ? getHoursPerWeekBucket(payInput.hoursPerWeek) : 'unknown',
      state: payInput.state || 'unknown',
      filing_status: status,
      overtime_flag: (payInput.hoursPerWeek || 0) > 40,
    });

    const elapsed = Math.round((Date.now() - mountedAt.current) / 1000);
    trackEvent('onboarding_completed', {
      filing_status: status,
      filing_provided: !skipped,
      total_time_seconds: elapsed,
    });

    router.push('/(onboarding)/benefits');
  };

  const handleSelect = (status: FilingStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStatus(status);
    trackEvent('filing_selected', { status });
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    completeOnboarding(selectedStatus, false);
  };

  const handleSkip = () => {
    trackEvent('filing_skipped');
    completeOnboarding('single', true);
  };

  const buttonLabel = `Continue with ${selectedStatus === 'head_of_household' ? 'Head of Household' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      {/* Header */}
      <OnboardingHeader currentStep={5} totalSteps={TOTAL_STEPS} />

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Tax filing status</Text>
        <Text style={styles.optional}>(optional)</Text>
        <Text style={styles.subtitle}>Affects your tax bracket</Text>
      </View>

      {/* Radio Options */}
      <View style={styles.optionsContainer}>
        {FILING_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.radioOption,
              selectedStatus === option.value && styles.radioOptionSelected,
            ]}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.radioContent}>
              <Text style={[
                styles.radioTitle,
                selectedStatus === option.value && styles.radioTitleSelected,
              ]}>
                {option.title}
              </Text>
              <Text style={styles.radioSubtitle}>{option.subtitle}</Text>
            </View>
            <View style={[
              styles.radioCircle,
              selectedStatus === option.value && styles.radioCircleSelected,
            ]}>
              {selectedStatus === option.value && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA Section */}
      <View style={[styles.ctaSection, { paddingBottom: insets.bottom + Spacing.md }]}>
        <PrimaryButton
          title={buttonLabel}
          onPress={handleContinue}
        />
        
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip - use Single</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  optional: {
    fontSize: moderateScale(14),
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
  },
  optionsContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  radioOptionSelected: {
    backgroundColor: Colors.success + '10',
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  radioTitleSelected: {
    color: Colors.success,
  },
  radioSubtitle: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  radioCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.success,
  },
  radioInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: Colors.success,
  },
  spacer: {
    flex: 1,
  },
  ctaSection: {
    paddingTop: Spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  skipText: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
});
