import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { Colors, Spacing, scale, moderateScale, isSmallDevice } from '../../src/constants/theme';
import { OnboardingHeader, NumericKeypad, PrimaryButton } from '../../src/components';

const TOTAL_STEPS = 7;
const MIN_SALARY = 5000;
const MAX_SALARY = 500000;

export default function SalaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAnnualSalary } = usePayInput();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('onboarding_step_viewed', { step: 'salary' });
  }, []);

  const handleNumber = (num: string) => {
    if (error) setError(null);
    
    if (amount === '' || amount === '0') {
      setAmount(num);
    } else if (amount.length < 8) {
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    if (error) setError(null);
    
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('');
    }
  };

  const handleContinue = () => {
    const numericAmount = Number(amount);
    
    if (numericAmount < MIN_SALARY) {
      setError('That looks too low for an annual salary.');
      return;
    }
    if (numericAmount > MAX_SALARY) {
      setError('That looks unusually high.');
      return;
    }

    setAnnualSalary(numericAmount);
    trackEvent('annual_salary_entered', { salary: numericAmount });
    router.push('/(onboarding)/hours');
  };

  const formatNumber = (value: string): string => {
    if (!value || value === '0') return '0';
    return Number(value).toLocaleString('en-US');
  };

  const numericAmount = Number(amount || '0');
  const isValid = numericAmount >= MIN_SALARY && numericAmount <= MAX_SALARY;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      {/* Header */}
      <OnboardingHeader currentStep={2} totalSteps={TOTAL_STEPS} />

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>What's your yearly salary?</Text>
        <Text style={styles.hint}>Before taxes</Text>
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={[styles.display, error && styles.displayError]}>
          <Text style={styles.dollarSign}>$ </Text>
          {formatNumber(amount)}
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
        <Text style={styles.rangeHint}>Most salaries: $30k–$120k</Text>
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
  underline: {
    width: scale(160),
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
