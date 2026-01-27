import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';

const US_STATES = [
  { code: 'TX', name: 'Texas (No state tax)' },
  { code: 'FL', name: 'Florida (No state tax)' },
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'IL', name: 'Illinois' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'OH', name: 'Ohio' },
  { code: 'GA', name: 'Georgia' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'MI', name: 'Michigan' },
];

export default function StateScreen() {
  const router = useRouter();
  const { setState } = usePayInput();
  const [selectedState, setSelectedState] = useState('TX');

  useEffect(() => {
    trackEvent('onboarding_step_viewed', {
      step: 'state',
      path: '/(onboarding)/state'
    });
  }, []);

  const handleSelect = (code: string) => {
    setSelectedState(code);
  };

  const handleContinue = () => {
    setState(selectedState);
    router.push('/(onboarding)/filing');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Which state do you work in?</Text>
      
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {US_STATES.map((state) => (
          <TouchableOpacity
            key={state.code}
            style={[
              styles.stateOption,
              selectedState === state.code && styles.stateOptionSelected
            ]}
            onPress={() => handleSelect(state.code)}
          >
            <Text style={styles.stateName}>{state.name}</Text>
            {selectedState === state.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.hint}>State taxes affect your take-home pay</Text>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#000000',
  },
  list: {
    flex: 1,
    marginBottom: 16,
  },
  stateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  stateOptionSelected: {
    backgroundColor: '#F0F0FF',
    borderColor: '#000000',
  },
  stateName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
  },
  checkmark: {
    fontSize: 20,
    color: '#000000',
  },
  hint: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 16,
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
