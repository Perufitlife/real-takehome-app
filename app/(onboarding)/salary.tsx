import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';

export default function SalaryScreen() {
  const router = useRouter();
  const { setAnnualSalary } = usePayInput();
  const [amount, setAmount] = useState('65000');

  useEffect(() => {
    trackEvent('onboarding_step_viewed', {
      step: 'salary',
      path: '/(onboarding)/salary'
    });
  }, []);

  const handleNumber = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else if (amount.length < 8) {
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleContinue = () => {
    setAnnualSalary(parseInt(amount));
    router.push('/(onboarding)/hours');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your annual salary?</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.input}>$ {amount}</Text>
        <Text style={styles.hint}>Before taxes, bonuses and overtime</Text>
      </View>

      <Text style={styles.label}>Annual salary</Text>

      <View style={styles.keypad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, i) => (
          <View key={i} style={styles.keypadRow}>
            {row.map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.key}
                onPress={() => handleNumber(num)}
              >
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={styles.keypadRow}>
          <View style={styles.key} />
          <TouchableOpacity
            style={styles.key}
            onPress={() => handleNumber('0')}
          >
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.key, styles.backspaceKey]}
            onPress={handleBackspace}
          >
            <Text style={styles.keyText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {parseInt(amount) > 0 && (
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
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
  inputContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    color: '#999999',
  },
  label: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 40,
  },
  keypad: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  key: {
    width: 80,
    height: 60,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  backspaceKey: {
    backgroundColor: '#E5E5E5',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
