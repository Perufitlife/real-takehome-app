import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { trackEvent } from '../src/lib/analytics';
import { getOfferings, purchasePackage } from '../src/lib/subscriptions';

export default function PaywallScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offers = await getOfferings();
      setOfferings(offers);
      
      const monthlyPrice = offers?.current?.monthly?.product?.priceString || '$4.99';
      const yearlyPrice = offers?.current?.annual?.product?.priceString || '$29.99';
      
      trackEvent('paywall_viewed', {
        variant: 'default',
        price_monthly: monthlyPrice,
        price_yearly: yearlyPrice
      });
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!offerings?.current?.monthly) {
      Alert.alert('Error', 'No subscription available. Please try again later.');
      return;
    }

    setPurchasing(true);
    
    try {
      const pkg = offerings.current.monthly;
      await purchasePackage(pkg);
      
      trackEvent('trial_started', {
        plan: 'monthly',
        source: 'paywall_main'
      });
      
      router.push('/breakdown-full');
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        Alert.alert('Purchase Error', 'Failed to complete purchase. Please try again.');
      }
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleContinueWithout = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const monthlyPrice = offerings?.current?.monthly?.product?.priceString || '$4.99';
  const yearlyPrice = offerings?.current?.annual?.product?.priceString || '$29.99';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>See your real take-home pay</Text>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.featureText}>Every tax & deduction</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.featureText}>Overtime & extra hours</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.featureText}>Monthly & yearly forecasts</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.featureText}>Works in any state</Text>
        </View>
      </View>

      <View style={styles.pricingCard}>
        <Text style={styles.pricingText}>
          Most people earn back $20+/month in overtime decisions
        </Text>
      </View>

      <View style={styles.pricing}>
        <Text style={styles.priceMain}>Start free → then {monthlyPrice}/mo</Text>
        <Text style={styles.priceAlt}>or {yearlyPrice}/year (save 50%)</Text>
        <Text style={styles.priceNote}>Cancel anytime · No surprises</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, purchasing && styles.buttonDisabled]} 
        onPress={handleStartTrial}
        disabled={purchasing}
      >
        {purchasing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Start free trial</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.continueButton}
        onPress={handleContinueWithout}
        disabled={purchasing}
      >
        <Text style={styles.continueText}>Continue without</Text>
      </TouchableOpacity>

      <Text style={styles.footnote}>Accurate for 2024 US payroll</Text>
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
    marginBottom: 32,
    color: '#000000',
    textAlign: 'center',
  },
  features: {
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 24,
    marginRight: 12,
    color: '#000000',
  },
  featureText: {
    fontSize: 18,
    color: '#000000',
  },
  pricingCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  pricingText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  pricing: {
    alignItems: 'center',
    marginBottom: 24,
  },
  priceMain: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  priceAlt: {
    fontSize: 17,
    color: '#000000',
    marginBottom: 8,
  },
  priceNote: {
    fontSize: 15,
    color: '#999999',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
  },
  footnote: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
