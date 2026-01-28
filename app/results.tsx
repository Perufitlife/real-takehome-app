import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { trackEvent } from '../src/lib/analytics';
import { usePayInput } from '../src/context/PayInputContext';
import { hasFullBreakdown } from '../src/lib/subscriptions';
import { Colors, Typography, Spacing, BorderRadius, formatCurrency, formatHourly, getStateName, scale, moderateScale, isSmallDevice } from '../src/constants/theme';
import { PrimaryButton } from '../src/components';

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const payInput = usePayInput();
  const payResult = payInput.calculatePay();
  
  const isFirstTime = params.firstTime === 'true';
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check premium status
    hasFullBreakdown().then(setIsPremium);
    
    trackEvent(isFirstTime ? 'results_with_hooks_viewed' : 'results_viewed', {
      net_monthly: Math.round((payResult?.netAnnual || 0) / 12),
      net_annual: Math.round(payResult?.netAnnual || 0),
      first_time: isFirstTime,
    });
  }, []);

  if (!payResult) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>Unable to calculate pay.</Text>
      </View>
    );
  }

  const monthly = payResult.netAnnual / 12;

  const handleHookPress = (card: string, route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent('hook_card_tapped', { card });
    router.push(route as any);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.label}>YOUR TAKE-HOME PAY</Text>

        {/* Monthly - Hero Number */}
        <View style={styles.heroNumberContainer}>
          <Text style={styles.heroMonthly}>
            ${Math.round(monthly).toLocaleString()}
          </Text>
          <Text style={styles.heroUnit}>/month</Text>
        </View>

        {/* Annual */}
        <Text style={styles.heroAnnual}>
          ${Math.round(payResult.netAnnual).toLocaleString()} <Text style={styles.annualUnit}>/year</Text>
        </Text>

        {/* Breakdown Card */}
        <View style={styles.breakdownCard}>
          <BreakdownRow label="Weekly" value={formatCurrency(payResult.netWeekly)} />
          <BreakdownRow label="Bi-weekly" value={formatCurrency(payResult.netBiweekly)} />
          <BreakdownRow label="Hourly (net)" value={formatHourly(payResult.netHourly)} />
        </View>

        {/* Based on */}
        <Text style={styles.basedOn}>
          Based on: {payInput.payType === 'hourly' 
            ? `${formatHourly(payInput.hourlyRate || 0)} · ${payInput.hoursPerWeek}h/week`
            : `${formatCurrency(payInput.annualSalary || 0)}/year`
          } · {getStateName(payInput.state || '')} · {payInput.filingStatus || 'Single'}
        </Text>
      </View>

      {/* Hook Cards (First Time Only) */}
      {isFirstTime && (
        <View style={styles.hooksSection}>
          <Text style={styles.hooksTitle}>Want to optimize your income?</Text>

          <HookCard
            title="Work extra hours?"
            subtitle="See how much you keep after tax"
            icon="fitness"
            onPress={() => handleHookPress('overtime', '/overtime-preview')}
          />

          <HookCard
            title="Compare job offers"
            subtitle="$5,139/year difference = real money"
            icon="trophy"
            onPress={() => handleHookPress('job', '/job-preview')}
          />

          <HookCard
            title="Move states?"
            subtitle="Tax shock calculator"
            icon="airplane"
            onPress={() => handleHookPress('state', '/state-preview')}
          />
        </View>
      )}

      {/* CTA */}
      <View style={styles.ctaSection}>
        {isFirstTime ? (
          // First time flow - always push to paywall
          isPremium ? (
            // Already premium - go to dashboard
            <PrimaryButton
              title="Go to Dashboard"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace('/(tabs)');
              }}
            />
          ) : (
            // Not premium - push to paywall (no skip option)
            <PrimaryButton
              title="Start Using the App →"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                trackEvent('paywall_from_results');
                router.push('/paywall?from=onboarding');
              }}
            />
          )
        ) : (
          // Returning user - back to dashboard
          <PrimaryButton
            title="Back to Dashboard"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(tabs)');
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

// Breakdown Row Component
function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{value}</Text>
    </View>
  );
}

// Hook Card Component
function HookCard({ 
  title, 
  subtitle, 
  icon, 
  onPress 
}: { 
  title: string; 
  subtitle: string; 
  icon: keyof typeof Ionicons.glyphMap; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.hookCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.hookIcon}>
        <Ionicons name={icon} size={scale(26)} color={Colors.primary} />
      </View>
      <View style={styles.hookContent}>
        <Text style={styles.hookTitle}>{title}</Text>
        <Text style={styles.hookSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={scale(22)} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xxl,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? Spacing.xl : Spacing.xxxl,
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  heroNumberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  heroMonthly: {
    fontSize: scale(48),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroUnit: {
    fontSize: scale(22),
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  heroAnnual: {
    fontSize: scale(28),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  annualUnit: {
    fontSize: scale(18),
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  breakdownCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  breakdownLabel: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: moderateScale(15),
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  basedOn: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: scale(20),
  },
  hooksSection: {
    marginBottom: Spacing.xxxl,
  },
  hooksTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  hookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  hookIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  hookContent: {
    flex: 1,
  },
  hookTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  hookSubtitle: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  ctaSection: {
    marginTop: Spacing.lg,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  secondaryText: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
  },
});
