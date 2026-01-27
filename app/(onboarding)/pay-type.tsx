import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';

export default function PayTypeScreen() {
  const router = useRouter();
  const { setPayType } = usePayInput();

  useEffect(() => {
    trackEvent('onboarding_step_viewed', {
      step: 'pay_type',
      path: '/(onboarding)/pay-type'
    });
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
    <View style={styles.container}>
      <Text style={styles.title}>How are you paid?</Text>
      
      <TouchableOpacity 
        style={styles.optionButton}
        onPress={() => handleSelect('salary')}
      >
        <Text style={styles.optionText}>Salary</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionButton}
        onPress={() => handleSelect('hourly')}
      >
        <Text style={styles.optionText}>Hourly</Text>
      </TouchableOpacity>
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
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
    color: '#000000',
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
});
