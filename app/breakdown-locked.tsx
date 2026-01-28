import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, isTablet, MAX_CONTENT_WIDTH } from '../src/constants/theme';

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

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.secondaryButtonText}>No Thanks</Text>
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
    ...(isTablet ? { alignItems: 'center' as const } : {}),
  },
  contentWrapper: {
    width: '100%',
    maxWidth: isTablet ? MAX_CONTENT_WIDTH : undefined,
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
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  footnote: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 24,
  },
});
