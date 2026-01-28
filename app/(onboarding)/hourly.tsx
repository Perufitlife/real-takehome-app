import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { Colors, Spacing, scale, moderateScale, isSmallDevice } from '../../src/constants/theme';
import { OnboardingHeader, NumericKeypad, PrimaryButton } from '../../src/components';

const TOTAL_STEPS = 7;
const MIN_HOURLY = 5;
const MAX_HOURLY = 200;

export default function HourlyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setHourlyRate } = usePayInput();
  const [rate, setRate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('onboarding_step_viewed', { step: 'hourly' });
  }, []);

  const handleNumber = (num: string) => {
    if (error) setError(null);
    
    if (rate === '' || rate === '0') {
      setRate(num);
    } else if (rate.length < 6) {
      setRate(rate + num);
    }
  };

  const handleBackspace = () => {
    if (error) setError(null);
    
    if (rate.length > 1) {
      setRate(rate.slice(0, -1));
    } else {
      setRate('');
    }
  };

  const handleContinue = () => {
    const numericRate = Number(rate);
    
    if (numericRate < MIN_HOURLY) {
      setError('That looks too low for an hourly rate.');
      return;
    }
    if (numericRate > MAX_HOURLY) {
      setError('That looks unusually high.');
      return;
    }

    setHourlyRate(numericRate);
    trackEvent('hourly_rate_entered', { hourlyRate: numericRate });
    router.push('/(onboarding)/hours');
  };

  const numericRate = Number(rate || '0');
  const isValid = numericRate >= MIN_HOURLY && numericRate <= MAX_HOURLY;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      {/* Header */}
      <OnboardingHeader currentStep={2} totalSteps={TOTAL_STEPS} />

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>What's your hourly rate?</Text>
        <Text style={styles.hint}>Before taxes</Text>
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={[styles.display, error && styles.displayError]}>
          <Text style={styles.dollarSign}>$ </Text>
          {rate || '0'}
          <Text style={styles.unit}> /hr</Text>
        </Text>
        <View style={styles.underline} />
        {error && <Text style={styles.errorText}>{error}</Text>}
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
        <Text style={styles.rangeHint}>Most rates: $10–$40/hr</Text>
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
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  hint: {
    fontSize: moderateScale(14),
    color: Colors.textTertiary,
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  display: {
    fontSize: scale(40),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  displayError: {
    color: Colors.warning,
  },
  dollarSign: {
    color: Colors.textSecondary,
  },
  unit: {
    fontSize: scale(26),
    color: Colors.textSecondary,
  },
  underline: {
    width: scale(140),
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  errorText: {
    fontSize: moderateScale(13),
    color: Colors.warning,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: isSmallDevice ? Spacing.md : Spacing.xl,
  },
  bottomSection: {
    marginTop: Spacing.lg,
  },
  rangeHint: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
