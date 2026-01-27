import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { getHourlyRateBucket, getHoursPerWeekBucket } from '../../src/lib/payCalculator';

export default function FilingScreen() {
  const router = useRouter();
  const payInput = usePayInput();
  const [filingStatus, setFilingStatus] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('onboarding_step_viewed', {
      step: 'filing',
      path: '/(onboarding)/filing'
    });
  }, []);

  const handleSelect = (status: string) => {
    setFilingStatus(status);
  };

  const handleContinue = () => {
    if (filingStatus) {
      payInput.setFilingStatus(filingStatus as any);
    }

    // Track inputs completed
    trackEvent('inputs_completed', {
      pay_type: payInput.payType || 'hourly',
      hourly_rate_bucket: payInput.hourlyRate ? getHourlyRateBucket(payInput.hourlyRate) : 'unknown',
      hours_per_week_bucket: payInput.hoursPerWeek ? getHoursPerWeekBucket(payInput.hoursPerWeek) : 'unknown',
      state: payInput.state || 'unknown',
      filing_status: filingStatus || 'single',
      overtime_flag: (payInput.hoursPerWeek || 0) > 40,
    });

    router.push('/results');
  };

  const handleSkip = () => {
    trackEvent('inputs_completed', {
      pay_type: payInput.payType || 'hourly',
      hourly_rate_bucket: payInput.hourlyRate ? getHourlyRateBucket(payInput.hourlyRate) : 'unknown',
      hours_per_week_bucket: payInput.hoursPerWeek ? getHoursPerWeekBucket(payInput.hoursPerWeek) : 'unknown',
      state: payInput.state || 'unknown',
      filing_status: 'single',
      overtime_flag: (payInput.hoursPerWeek || 0) > 40,
    });

    router.push('/results');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your filing status?</Text>
      
      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            filingStatus === 'single' && styles.optionButtonSelected
          ]}
          onPress={() => handleSelect('single')}
        >
          <Text style={styles.optionText}>Single</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            filingStatus === 'married' && styles.optionButtonSelected
          ]}
          onPress={() => handleSelect('married')}
        >
          <Text style={styles.optionText}>Married</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            filingStatus === 'head_of_household' && styles.optionButtonSelected
          ]}
          onPress={() => handleSelect('head_of_household')}
        >
          <Text style={styles.optionText}>Head of household</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Helps improve tax accuracy (optional)</Text>

      {filingStatus ? (
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip this</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    color: '#000000',
  },
  options: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  optionButtonSelected: {
    backgroundColor: '#F0F0FF',
    borderColor: '#000000',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  hint: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  skipButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
  },
});
