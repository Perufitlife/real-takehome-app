import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { trackEvent } from '../../src/lib/analytics';

export default function InfoScreen() {
  const router = useRouter();

  useEffect(() => {
    trackEvent('onboarding_step_viewed', {
      step: 'info',
      path: '/(onboarding)/info'
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your pay info</Text>
      <Text style={styles.subtitle}>
        Just a few basics to calculate your take-home pay:
      </Text>

      <View style={styles.list}>
        <View style={styles.listItem}>
          <Text style={styles.icon}>💼</Text>
          <Text style={styles.listText}>Salary or hourly rate</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.icon}>⏰</Text>
          <Text style={styles.listText}>Hours per week</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.listText}>State</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.listText}>Filing status (optional)</Text>
        </View>
      </View>

      <Text style={styles.footnote}>No income history required</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/(onboarding)/pay-type')}
      >
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
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000000',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 26,
  },
  list: {
    marginBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  listText: {
    fontSize: 17,
    color: '#000000',
  },
  footnote: {
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
});
