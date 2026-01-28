import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePayInput } from '../src/context/PayInputContext';
import { hasFullBreakdown } from '../src/lib/subscriptions';
import { Colors, Spacing } from '../src/constants/theme';

export default function BreakdownFullScreen() {
  const router = useRouter();
  const payInput = usePayInput();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const payResult = payInput.calculatePay();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const access = await hasFullBreakdown();
    setHasAccess(access);
    
    if (!access) {
      // Redirect to paywall if no access
      router.replace('/paywall');
    }
  };

  if (hasAccess === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!payResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.errorText}>Unable to calculate breakdown.</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const formatPercent = (percent: number) => {
    return `${(Math.round(percent * 10) / 10).toFixed(1)}%`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => router.push('/(tabs)')}
      >
        <Ionicons name="close" size={28} color={Colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Full breakdown</Text>
      <Text style={styles.subtitle}>Your complete pay analysis</Text>

      {/* Gross Income Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GROSS INCOME</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Annual</Text>
          <Text style={styles.value}>{formatCurrency(payResult.grossAnnual)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bi-weekly</Text>
          <Text style={styles.value}>{formatCurrency(payResult.grossBiweekly)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Weekly</Text>
          <Text style={styles.value}>{formatCurrency(payResult.grossWeekly)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Hourly</Text>
          <Text style={styles.value}>${payResult.grossHourly.toFixed(2)}/hr</Text>
        </View>
      </View>

      {/* Deductions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DEDUCTIONS (ANNUAL)</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Federal Income Tax</Text>
          <Text style={styles.value}>{formatCurrency(payResult.federalTax)}</Text>
        </View>
        <View style={styles.rowDetail}>
          <Text style={styles.detailText}>
            Based on {payInput.filingStatus || 'single'} filing status
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>FICA (Social Security & Medicare)</Text>
          <Text style={styles.value}>{formatCurrency(payResult.ficaTax)}</Text>
        </View>
        <View style={styles.rowDetail}>
          <Text style={styles.detailText}>6.2% SS + 1.45% Medicare</Text>
        </View>
        
        {payResult.stateTax > 0 && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>State Income Tax</Text>
              <Text style={styles.value}>{formatCurrency(payResult.stateTax)}</Text>
            </View>
            <View style={styles.rowDetail}>
              <Text style={styles.detailText}>{payInput.state} state tax</Text>
            </View>
          </>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.labelBold}>Total Taxes</Text>
          <Text style={styles.valueBold}>{formatCurrency(payResult.totalTax)}</Text>
        </View>
        <View style={styles.rowDetail}>
          <Text style={styles.detailText}>
            {formatPercent(payResult.taxPercentage)} of gross income
          </Text>
        </View>
      </View>

      {/* Net Income Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NET TAKE-HOME PAY</Text>
        
        <View style={styles.row}>
          <Text style={styles.labelBold}>Annual</Text>
          <Text style={styles.valueHighlight}>{formatCurrency(payResult.netAnnual)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.labelBold}>Bi-weekly</Text>
          <Text style={styles.valueHighlight}>{formatCurrency(payResult.netBiweekly)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.labelBold}>Weekly</Text>
          <Text style={styles.valueHighlight}>{formatCurrency(payResult.netWeekly)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.labelBold}>Hourly</Text>
          <Text style={styles.valueHighlight}>${payResult.netHourly.toFixed(2)}/hr</Text>
        </View>
      </View>

      {/* Monthly & Yearly Forecast */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FORECAST</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Monthly (net)</Text>
          <Text style={styles.value}>{formatCurrency(payResult.netAnnual / 12)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Yearly (net)</Text>
          <Text style={styles.value}>{formatCurrency(payResult.netAnnual)}</Text>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          * Estimates only, not tax advice. Actual amounts may vary based on additional deductions, credits, and local taxes. Calculations based on 2024 tax year.
        </Text>
      </View>
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
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowDetail: {
    paddingBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#000000',
  },
  labelBold: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  value: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  valueBold: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
  },
  valueHighlight: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  detailText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  disclaimer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
});
