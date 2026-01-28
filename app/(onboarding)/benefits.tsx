import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { Colors, Spacing, BorderRadius, scale, moderateScale, isSmallDevice } from '../../src/constants/theme';
import { OnboardingHeader, PrimaryButton } from '../../src/components';

const TOTAL_STEPS = 7;

export default function BenefitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();
  
  const [contributes, setContributes] = useState<boolean | null>(null);
  const [percentage, setPercentage] = useState(6);

  useEffect(() => {
    trackEvent('benefits_viewed');
  }, []);

  const handleContributeSelect = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContributes(value);
    
    if (!value) {
      // Skip - go to overtime immediately
      payInput.setContribution401k(null);
      payInput.setContributionType(null);
      trackEvent('401k_skipped');
      router.push('/(onboarding)/overtime');
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    payInput.setContribution401k(percentage);
    payInput.setContributionType('percent');
    trackEvent('401k_selected', { percentage });
    router.push('/(onboarding)/overtime');
  };

  // Calculate estimated monthly contribution
  const estimatedMonthly = () => {
    if (!payInput.hourlyRate && !payInput.annualSalary) return 0;
    
    let annualGross = 0;
    if (payInput.payType === 'hourly' && payInput.hourlyRate) {
      annualGross = payInput.hourlyRate * (payInput.hoursPerWeek || 40) * 52;
    } else if (payInput.annualSalary) {
      annualGross = payInput.annualSalary;
    }
    
    return Math.round((annualGross * (percentage / 100)) / 12);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      {/* Header */}
      <OnboardingHeader currentStep={6} totalSteps={TOTAL_STEPS} />

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Do you contribute to{'\n'}retirement savings?</Text>
        <Text style={styles.subtitle}>Most people skip this step</Text>
      </View>

      {/* Options */}
      {contributes === null && (
        <View style={styles.optionsContainer}>
          {/* Yes Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleContributeSelect(true)}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="wallet-outline" size={scale(28)} color={Colors.success} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Yes, I contribute</Text>
              <Text style={styles.optionSubtitle}>401k or similar pre-tax savings</Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(22)} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* No Option */}
          <TouchableOpacity
            style={[styles.optionCard, styles.optionCardRecommended]}
            onPress={() => handleContributeSelect(false)}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="close-circle-outline" size={scale(28)} color={Colors.textSecondary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>No / Skip</Text>
              <Text style={styles.optionSubtitle}>Most common choice</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Recommended</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Contribution Slider (shown if Yes selected) */}
      {contributes === true && (
        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>How much per paycheck?</Text>
          
          <View style={styles.displayContainer}>
            <Text style={styles.displayValue}>{percentage}%</Text>
            <Text style={styles.displayHint}>of your gross pay</Text>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderMin}>0%</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={15}
              step={1}
              value={percentage}
              onValueChange={(val) => setPercentage(Math.round(val))}
              minimumTrackTintColor={Colors.success}
              maximumTrackTintColor={Colors.cardBorder}
              thumbTintColor={Colors.success}
            />
            <Text style={styles.sliderMax}>15%</Text>
          </View>

          <View style={styles.estimateCard}>
            <Ionicons name="calculator-outline" size={scale(20)} color={Colors.success} />
            <Text style={styles.estimateText}>
              ~${estimatedMonthly().toLocaleString()}/month pre-tax
            </Text>
          </View>

          {/* Change Selection */}
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setContributes(null)}
          >
            <Text style={styles.changeText}>Change selection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA (only when Yes is selected) */}
      {contributes === true && (
        <View style={[styles.ctaSection, { paddingBottom: insets.bottom + Spacing.md }]}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
          />
        </View>
      )}
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
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: Spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  optionCardRecommended: {
    borderColor: Colors.success + '40',
  },
  optionIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  optionSubtitle: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: Colors.success,
  },
  sliderSection: {
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  displayValue: {
    fontSize: scale(48),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  displayHint: {
    fontSize: moderateScale(14),
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.xl,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMin: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    width: 35,
  },
  sliderMax: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    width: 35,
    textAlign: 'right',
  },
  estimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  estimateText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.success,
    marginLeft: Spacing.sm,
  },
  changeButton: {
    paddingVertical: Spacing.md,
  },
  changeText: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
  ctaSection: {
    paddingTop: Spacing.lg,
  },
});
