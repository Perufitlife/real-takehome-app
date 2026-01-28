import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { trackEvent } from '../src/lib/analytics';
import { usePayInput } from '../src/context/PayInputContext';
import { getOfferings, purchasePackage, hasFullBreakdown } from '../src/lib/subscriptions';
import { calculateOvertimePay, getStateName } from '../src/lib/payCalculator';
import { Colors, Spacing, BorderRadius, formatCurrency, scale, moderateScale } from '../src/constants/theme';
import { PrimaryButton } from '../src/components';

const isExpoGo = Constants.appOwnership === 'expo';

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const payInput = usePayInput();
  
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [offerings, setOfferings] = useState<any>(null);
  const [canClose, setCanClose] = useState(false);

  const isFromOnboarding = params.from === 'onboarding';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check if user can close (already premium)
      const isPremium = await hasFullBreakdown();
      setCanClose(isPremium || !isFromOnboarding);
      
      const offers = await getOfferings();
      setOfferings(offers);
      
      trackEvent('paywall_viewed', {
        source: params.from || 'unknown',
        hourly_rate: payInput.hourlyRate,
        state: payInput.state,
      });
    } catch (error) {
      console.error('Error loading paywall:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate personalized potential savings
  const calculatePotentialSavings = () => {
    const hourlyRate = payInput.hourlyRate || 18;
    const hoursPerWeek = payInput.hoursPerWeek || 40;
    const state = payInput.state || 'TX';
    
    // Calculate what 5 extra hours/week would earn
    const overtimeScenario = calculateOvertimePay(
      hourlyRate,
      40,
      5,
      state,
      payInput.filingStatus || 'single'
    );
    
    // Annual net increase from 5h/week overtime
    const yearlyOvertimeGain = overtimeScenario.netIncrease;
    
    // Add potential from job switching (assume $2/hr better offer)
    const jobSwitchGain = 2 * hoursPerWeek * 52 * 0.75; // 75% after taxes
    
    // State optimization (if in high tax state)
    const stateGain = state === 'CA' ? 2000 : state === 'NY' ? 1500 : 500;
    
    return Math.round(yearlyOvertimeGain + jobSwitchGain + stateGain);
  };

  const potentialSavings = calculatePotentialSavings();
  const monthlyPrice = offerings?.current?.monthly?.product?.priceString || '$9.99';
  const annualPrice = offerings?.current?.annual?.product?.priceString || '$59.99';
  const monthlyEquivalent = '$4.99';
  const savingsPercent = '50%';

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchasing(true);
    
    trackEvent('purchase_started', { plan: selectedPlan });
    
    try {
      const pkg = selectedPlan === 'annual' 
        ? offerings?.current?.annual 
        : offerings?.current?.monthly;
      
      await purchasePackage(pkg, selectedPlan);
      
      trackEvent('purchase_completed', { 
        plan: selectedPlan,
        revenue: selectedPlan === 'annual' ? 59.99 : 9.99,
      });
      
      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Purchase error:', error);
      trackEvent('purchase_cancelled', { plan: selectedPlan });
    } finally {
      setPurchasing(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent('restore_purchases_clicked');
    // In production, would restore purchases
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      {/* Close Button (only if allowed) */}
      {canClose && (
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={scale(28)} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}

      {/* Personalized Hero */}
      <View style={styles.heroSection}>
        <Text style={styles.heroContext}>
          Based on {formatCurrency(payInput.hourlyRate || 18)}/hr in {getStateName(payInput.state || 'TX')}...
        </Text>
        <Text style={styles.heroTitle}>
          You could earn{'\n'}
          <Text style={styles.heroAmount}>{formatCurrency(potentialSavings)}</Text> more
        </Text>
        <Text style={styles.heroSubtitle}>per year with the right decisions</Text>
      </View>

      {/* Plan Selection */}
      <View style={styles.plansContainer}>
        {/* Monthly Plan */}
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedPlan('monthly');
            trackEvent('plan_selected', { plan: 'monthly' });
          }}
          activeOpacity={0.7}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Monthly</Text>
          </View>
          <Text style={styles.planPrice}>{monthlyPrice}</Text>
          <Text style={styles.planPeriod}>/month</Text>
        </TouchableOpacity>

        {/* Annual Plan */}
        <TouchableOpacity
          style={[styles.planCard, styles.planCardAnnual, selectedPlan === 'annual' && styles.planCardSelected]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedPlan('annual');
            trackEvent('plan_selected', { plan: 'annual' });
          }}
          activeOpacity={0.7}
        >
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Annual</Text>
          </View>
          <Text style={styles.planPrice}>{annualPrice}</Text>
          <Text style={styles.planPeriod}>/year</Text>
          <View style={styles.savingsInfo}>
            <Text style={styles.monthlyEquivalent}>= {monthlyEquivalent}/mo</Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>SAVE {savingsPercent}</Text>
            </View>
            <Text style={styles.bonusText}>+ Bonus tools upcoming</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>What you unlock:</Text>
        <FeatureItem icon="flash" text="Unlimited overtime scenarios" />
        <FeatureItem icon="trophy" text="Compare up to 5 job offers" />
        <FeatureItem icon="airplane" text="All 50 state tax comparisons" />
        <FeatureItem icon="document-text" text="Full tax breakdown" />
        <FeatureItem icon="bookmark" text="Save unlimited comparisons" />
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA */}
      <View style={[styles.ctaSection, { paddingBottom: insets.bottom + Spacing.md }]}>
        <PrimaryButton
          title={purchasing ? 'Processing...' : 'Get Premium'}
          onPress={handlePurchase}
          disabled={purchasing}
          loading={purchasing}
        />
        
        <Text style={styles.trialInfo}>
          Cancel anytime from your device settings
        </Text>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => Linking.openURL('https://workroi.app/terms.html')}>
            <Text style={styles.footerLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://workroi.app/privacy.html')}>
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>·</Text>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.footerLink}>Restore</Text>
          </TouchableOpacity>
        </View>

        {/* Dev Mode Indicator */}
        {isExpoGo && (
          <View style={styles.devBadge}>
            <Text style={styles.devBadgeText}>DEV MODE - Purchase will be simulated</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={scale(20)} color={Colors.success} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  heroContext: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: scale(32),
  },
  heroAmount: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: Colors.success,
  },
  heroSubtitle: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  planCardAnnual: {
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  bestValueText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: Colors.textInverse,
  },
  planHeader: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  planName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  planPrice: {
    fontSize: scale(28),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planPeriod: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
  },
  savingsInfo: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  monthlyEquivalent: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  savingsBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  savingsText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: Colors.success,
  },
  bonusText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  featuresTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: moderateScale(15),
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  ctaSection: {
    alignItems: 'center',
  },
  trialInfo: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
  },
  footerDivider: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    marginHorizontal: Spacing.sm,
  },
  devBadge: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  devBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: Colors.warning,
  },
});
