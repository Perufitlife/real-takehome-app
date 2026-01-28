import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { Colors, Spacing, BorderRadius, scale, moderateScale, isTablet, MAX_CONTENT_WIDTH } from '../../src/constants/theme';
import { OnboardingHeader, PrimaryButton } from '../../src/components';

const TOTAL_STEPS = 7;

export default function OvertimeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();
  
  const [worksOvertime, setWorksOvertime] = useState<boolean | null>(null);
  const [multiplier, setMultiplier] = useState(1.5);

  const hoursPerWeek = payInput.hoursPerWeek || 40;
  const hasOvertimeHours = hoursPerWeek > 40;

  useEffect(() => {
    trackEvent('overtime_rules_viewed', { hoursPerWeek });
    
    // If user doesn't work overtime hours, auto-proceed after brief delay
    if (!hasOvertimeHours) {
      const timer = setTimeout(() => {
        payInput.setHasOvertime(false);
        trackEvent('overtime_auto_skipped', { reason: 'no_overtime_hours' });
        router.replace('/results?firstTime=true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOvertimeSelect = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWorksOvertime(value);
    
    if (!value) {
      // No overtime - proceed
      payInput.setHasOvertime(false);
      trackEvent('overtime_no');
      router.replace('/results?firstTime=true');
    } else {
      trackEvent('overtime_yes');
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    payInput.setHasOvertime(true);
    payInput.setOvertimeMultiplier(multiplier);
    trackEvent('overtime_multiplier_set', { multiplier });
    router.replace('/results?firstTime=true');
  };

  // Show loading state for non-overtime users
  if (!hasOvertimeHours) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.contentWrapper}>
          <OnboardingHeader currentStep={7} totalSteps={TOTAL_STEPS} showBack={false} />
          <View style={styles.loadingContent}>
            <Ionicons name="checkmark-circle" size={scale(64)} color={Colors.success} />
            <Text style={styles.loadingTitle}>Almost done!</Text>
            <Text style={styles.loadingSubtitle}>Calculating your take-home pay...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <OnboardingHeader currentStep={7} totalSteps={TOTAL_STEPS} />

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Do you work overtime?</Text>
          <Text style={styles.subtitle}>
            Hours over 40/week usually{'\n'}pay 1.5x your rate
          </Text>
        </View>

        {/* Options */}
        {worksOvertime === null && (
          <View style={styles.optionsContainer}>
            {/* Yes Option */}
            <TouchableOpacity
              style={[styles.optionCard, styles.optionCardHighlight]}
              onPress={() => handleOvertimeSelect(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, styles.optionIconHighlight]}>
                <Text style={styles.fireEmoji}>🔥</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Yes, sometimes/often</Text>
                <Text style={styles.optionSubtitle}>I work more than 40h/week</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(22)} color={Colors.textTertiary} />
            </TouchableOpacity>

            {/* No Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleOvertimeSelect(false)}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="time-outline" size={scale(28)} color={Colors.textSecondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>No / Rarely</Text>
                <Text style={styles.optionSubtitle}>Standard 40h weeks</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(22)} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Multiplier Slider (shown if Yes selected) */}
        {worksOvertime === true && (
          <View style={styles.sliderSection}>
            <Text style={styles.sliderLabel}>Your overtime multiplier</Text>
            
            <View style={styles.displayContainer}>
              <Text style={styles.displayValue}>{multiplier.toFixed(1)}x</Text>
              <Text style={styles.displayHint}>
                {multiplier === 1.5 ? 'Time and a half (most common)' : 
                 multiplier === 2.0 ? 'Double time' : 
                 'Custom rate'}
              </Text>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderMin}>1.0x</Text>
              <Slider
                style={styles.slider}
                minimumValue={1.0}
                maximumValue={2.0}
                step={0.1}
                value={multiplier}
                onValueChange={(val) => setMultiplier(Math.round(val * 10) / 10)}
                minimumTrackTintColor={Colors.success}
                maximumTrackTintColor={Colors.cardBorder}
                thumbTintColor={Colors.success}
              />
              <Text style={styles.sliderMax}>2.0x</Text>
            </View>

            {/* Quick select buttons */}
            <View style={styles.quickSelectContainer}>
              <TouchableOpacity
                style={[styles.quickSelectButton, multiplier === 1.5 && styles.quickSelectActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMultiplier(1.5);
                }}
              >
                <Text style={[styles.quickSelectText, multiplier === 1.5 && styles.quickSelectTextActive]}>
                  1.5x
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickSelectButton, multiplier === 2.0 && styles.quickSelectActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMultiplier(2.0);
                }}
              >
                <Text style={[styles.quickSelectText, multiplier === 2.0 && styles.quickSelectTextActive]}>
                  2.0x
                </Text>
              </TouchableOpacity>
            </View>

            {/* Change Selection */}
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => setWorksOvertime(null)}
            >
              <Text style={styles.changeText}>Change selection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTA (only when Yes is selected) */}
        {worksOvertime === true && (
          <View style={[styles.ctaSection, { paddingBottom: insets.bottom + Spacing.md }]}>
            <PrimaryButton
              title="See My Paycheck →"
              onPress={handleContinue}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    ...(isTablet ? { alignItems: 'center' as const } : {}),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: isTablet ? MAX_CONTENT_WIDTH : undefined,
  },
  loadingContainer: {
    justifyContent: 'flex-start',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  loadingSubtitle: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    textAlign: 'center',
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
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: scale(22),
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
  optionCardHighlight: {
    borderColor: Colors.success + '50',
    backgroundColor: Colors.success + '08',
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
  optionIconHighlight: {
    backgroundColor: Colors.success + '20',
  },
  fireEmoji: {
    fontSize: scale(26),
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
    textAlign: 'center',
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
    width: 40,
  },
  sliderMax: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    width: 40,
    textAlign: 'right',
  },
  quickSelectContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickSelectButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  quickSelectActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  quickSelectText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  quickSelectTextActive: {
    color: Colors.textInverse,
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
