import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { Colors, Spacing, scale, moderateScale, isSmallDevice } from '../../src/constants/theme';
import { OnboardingHeader, NumericKeypad, PrimaryButton } from '../../src/components';

const TOTAL_STEPS = 7;
const MIN_HOURS = 10;
const MAX_HOURS = 80;

// Quick select presets
const PRESETS = [20, 30, 40, 45, 50];

export default function HoursScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setHoursPerWeek } = usePayInput();
  const [hours, setHours] = useState('40');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('onboarding_hours_viewed');
  }, []);

  const handleNumber = (num: string) => {
    if (error) setError(null);
    
    if (hours === '0' || hours === '40') {
      setHours(num);
    } else if (hours.length < 3) {
      setHours(hours + num);
    }
  };

  const handleBackspace = () => {
    if (error) setError(null);
    
    if (hours.length > 1) {
      setHours(hours.slice(0, -1));
    } else {
      setHours('0');
    }
  };

  const handlePreset = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (error) setError(null);
    setHours(String(value));
  };

  const handleContinue = () => {
    const numericHours = Number(hours);
    
    if (numericHours < MIN_HOURS) {
      setError('That seems too low for weekly work.');
      return;
    }
    if (numericHours > MAX_HOURS) {
      setError('That seems unusually high.');
      return;
    }

    const isOvertime = numericHours > 40;
    setHoursPerWeek(numericHours);
    
    trackEvent('onboarding_hours_entered', {
      hoursPerWeek: numericHours,
      overtime: isOvertime
    });
    
    if (isOvertime) {
      trackEvent('overtime_user', { hoursPerWeek: numericHours });
    }
    
    router.push('/(onboarding)/state');
  };

  const numericHours = Number(hours || '40');
  const isOvertime = numericHours > 40;
  const isValid = numericHours >= MIN_HOURS && numericHours <= MAX_HOURS;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      {/* Header */}
      <OnboardingHeader currentStep={3} totalSteps={TOTAL_STEPS} />

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>How many hours per week?</Text>
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={[styles.display, error && styles.displayError]}>
          {hours || '40'}
          <Text style={styles.unit}> hrs</Text>
        </Text>
        <View style={[styles.underline, isOvertime && styles.underlineOvertime]} />
        
        {/* Dynamic hint */}
        <Text style={[styles.hint, isOvertime && styles.hintOvertime]}>
          {isOvertime ? 'Overtime starts after 40h' : 'Most full-time = 40h'}
        </Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Quick Select Presets */}
      <View style={styles.presetsContainer}>
        {PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetButton,
              Number(hours) === preset && styles.presetButtonActive,
            ]}
            onPress={() => handlePreset(preset)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.presetText,
              Number(hours) === preset && styles.presetTextActive,
            ]}>
              {preset}h
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Keypad */}
      <NumericKeypad
        onPress={handleNumber}
        onBackspace={handleBackspace}
      />

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.md }]}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!isValid}
        />
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  display: {
    fontSize: scale(42),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  displayError: {
    color: Colors.warning,
  },
  unit: {
    fontSize: scale(26),
    color: Colors.textSecondary,
  },
  underline: {
    width: scale(100),
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  underlineOvertime: {
    backgroundColor: Colors.success,
  },
  hint: {
    fontSize: moderateScale(14),
    color: Colors.textTertiary,
  },
  hintOvertime: {
    color: Colors.success,
    fontWeight: '500',
  },
  errorText: {
    fontSize: moderateScale(13),
    color: Colors.warning,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  presetButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    backgroundColor: Colors.cardBackground,
    borderRadius: scale(20),
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  presetButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  presetTextActive: {
    color: Colors.textInverse,
  },
  spacer: {
    flex: 1,
    minHeight: isSmallDevice ? Spacing.sm : Spacing.lg,
  },
  bottomSection: {
    marginTop: Spacing.md,
  },
});
