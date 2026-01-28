import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { isTablet, MAX_CONTENT_WIDTH } from '../src/constants/theme';

export default function PaySummaryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Take-Home Pay</Text>
      <Text style={styles.subtitle}>What you actually get paid</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>TAKE-HOME BIWEEKLY</Text>
        <Text style={styles.amount}>$2,450</Text>
        <Text style={styles.period}>After tax (bi-weekly)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>TAKE-HOME WEEKLY</Text>
        <Text style={styles.amount}>$1,225</Text>
        <Text style={styles.period}>After tax (weekly)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>TAKE-HOME HOURLY</Text>
        <Text style={styles.amount}>$30.62</Text>
        <Text style={styles.period}>After tax (hourly)</Text>
      </View>

      <Text style={styles.footnote}>Based on $65K salary · 40h/wk · Texas</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    ...(isTablet ? {
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center' as const,
      width: '100%',
    } : {}),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  period: {
    fontSize: 16,
    color: '#666666',
  },
  footnote: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
});
