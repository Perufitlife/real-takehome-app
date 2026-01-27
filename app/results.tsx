import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { trackEvent } from '../src/lib/analytics';
import { usePayInput } from '../src/context/PayInputContext';

export default function ResultsScreen() {
  const router = useRouter();
  const payInput = usePayInput();
  const payResult = payInput.calculatePay();

  useEffect(() => {
    if (payResult) {
      trackEvent('results_viewed', {
        net_biweekly: Math.round(payResult.netBiweekly),
        net_weekly: Math.round(payResult.netWeekly),
        net_hourly: Math.round(payResult.netHourly * 100) / 100,
        gross_biweekly: Math.round(payResult.grossBiweekly),
        taxes_total: Math.round(payResult.totalTax),
        taxes_pct: Math.round(payResult.taxPercentage * 10) / 10
      });
    }
  }, []);

  const handleBreakdownClick = () => {
    trackEvent('breakdown_cta_clicked', {
      from_screen: 'results',
      pay_type: payInput.payType || 'unknown',
      state: payInput.state || 'unknown',
      overtime_flag: (payInput.hoursPerWeek || 0) > 40
    });
    
    router.push('/breakdown-locked');
  };

  if (!payResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error calculating pay</Text>
        <Text style={styles.errorText}>Please go back and check your inputs.</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const formatHourly = (amount: number) => {
    return `$${(Math.round(amount * 100) / 100).toFixed(2)}/hr`;
  };

  const getStateDisplay = (code: string) => {
    const states: Record<string, string> = {
      TX: 'Texas',
      FL: 'Florida',
      CA: 'California',
      NY: 'New York',
      IL: 'Illinois',
      PA: 'Pennsylvania',
      OH: 'Ohio',
      GA: 'Georgia',
      NC: 'North Carolina',
      MI: 'Michigan',
    };
    return states[code] || code;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your take-home pay</Text>

      <View style={styles.card}>
        <View style={styles.payRow}>
          <Text style={styles.payLabel}>Bi-weekly</Text>
          <Text style={styles.payAmount}>{formatCurrency(payResult.netBiweekly)}</Text>
        </View>
        
        <View style={styles.payRow}>
          <Text style={styles.payLabel}>Weekly</Text>
          <Text style={styles.payAmount}>{formatCurrency(payResult.netWeekly)}</Text>
        </View>
        
        <View style={styles.payRow}>
          <Text style={styles.payLabel}>Hourly</Text>
          <Text style={styles.payAmount}>{formatHourly(payResult.netHourly)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BASED ON</Text>
        <Text style={styles.sectionText}>
          {payInput.payType === 'hourly' 
            ? `${formatHourly(payInput.hourlyRate || 0)} · ${payInput.hoursPerWeek}h/week`
            : `${formatCurrency(payInput.annualSalary || 0)}/year · ${payInput.hoursPerWeek}h/week`
          } · {getStateDisplay(payInput.state || '')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INCLUDES</Text>
        <Text style={styles.sectionText}>Federal tax</Text>
        <Text style={styles.sectionText}>FICA & Medicare</Text>
        <Text style={styles.sectionText}>
          {payResult.stateTax > 0 ? 'State tax' : 'No state tax'}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleBreakdownClick}>
        <Text style={styles.buttonText}>See full breakdown →</Text>
      </TouchableOpacity>

      <Text style={styles.footnote}>Accurate for 2024 tax year</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
    color: '#000000',
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  payLabel: {
    fontSize: 17,
    color: '#666666',
  },
  payAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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
    marginTop: 16,
    marginBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
});
