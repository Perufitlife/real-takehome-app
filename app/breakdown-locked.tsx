import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BreakdownLockedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Full breakdown</Text>

      <View style={styles.lockCard}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockText}>Unlock to see your full breakdown</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/paywall')}
      >
        <Text style={styles.buttonText}>See full breakdown</Text>
      </TouchableOpacity>

      <Text style={styles.footnote}>Accurate for 2024 bi-weekly payroll</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 60,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
    color: '#000000',
    textAlign: 'center',
  },
  lockCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 60,
    alignItems: 'center',
    marginBottom: 40,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
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
  footnote: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 24,
  },
});
