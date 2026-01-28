import { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePayInput } from '../src/context/PayInputContext';
import { trackEvent } from '../src/lib/analytics';
import { Card, PrimaryButton, BlurredCard } from '../src/components';
import { Colors, Spacing, BorderRadius, formatCurrency, scale, moderateScale } from '../src/constants/theme';
import { calculateOvertimePay } from '../src/lib/payCalculator';

export default function OvertimePreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();

  useEffect(() => {
    trackEvent('tool_preview_viewed', { tool: 'overtime' });
    
    // Block hardware back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to prevent default behavior
      return true;
    });
    
    return () => backHandler.remove();
  }, []);

  if (!payInput.hourlyRate) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={styles.title}>Overtime not available</Text>
        <Text style={styles.subtitle}>Please set your hourly rate first</Text>
      </View>
    );
  }

  // Calculate scenarios
  const scenario5 = calculateOvertimePay(
    payInput.hourlyRate,
    40,
    5,
    payInput.state || 'TX',
    payInput.filingStatus || 'single'
  );

  const scenario10 = calculateOvertimePay(
    payInput.hourlyRate,
    40,
    10,
    payInput.state || 'TX',
    payInput.filingStatus || 'single'
  );

  const weeklyNet5 = scenario5.netIncrease / 52;

  const handleUnlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    trackEvent('paywall_from_preview', { source: 'overtime' });
    router.push('/paywall?from=overtime');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xxl }]}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Overtime Calculator</Text>
        <Text style={styles.subtitle}>See how much you really keep</Text>
      </View>

      {/* Scenario 1 - FREE (partial) */}
      <Card style={styles.scenarioCard}>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>FREE PREVIEW</Text>
        </View>
        <Text style={styles.scenarioTitle}>+5 hours/week</Text>
        <Text style={styles.scenarioResult}>
          +{formatCurrency(weeklyNet5)}/week
        </Text>
        {/* Details are blurred */}
        <View style={styles.blurredDetails}>
          <Text style={styles.blurredPlaceholder}>••••••••••••••••</Text>
          <View style={styles.lockHint}>
            <Ionicons name="lock-closed" size={scale(12)} color={Colors.textTertiary} />
            <Text style={styles.lockHintText}>Unlock for details</Text>
          </View>
        </View>
      </Card>

      {/* Scenario 2 - BLURRED */}
      <BlurredCard style={styles.scenarioCard} isLocked={true} intensity={30}>
        <View style={styles.scenarioCardContent}>
          <Text style={styles.scenarioTitle}>+10 hours/week</Text>
          <Text style={styles.scenarioResultBlurred}>
            +${Math.round(scenario10.netIncrease / 52)}/week
          </Text>
          <Text style={styles.scenarioDetailBlurred}>
            Extra gross: $XXX · Taxes: $XXX
          </Text>
        </View>
      </BlurredCard>

      {/* Scenario 3 - LOCKED */}
      <Card style={[styles.scenarioCard, styles.lockedCard]}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={scale(28)} color={Colors.textTertiary} />
        </View>
        <Text style={styles.lockedTitle}>+15, +20, +25 hours...</Text>
        <Text style={styles.lockedText}>Unlock all scenarios</Text>
      </Card>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA - Only unlock, no back */}
      <View style={[styles.ctaSection, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <PrimaryButton
          title="Unlock All Scenarios"
          onPress={handleUnlock}
        />
        <Text style={styles.priceHint}>Full access for $4.99/month</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scenarioCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    position: 'relative',
  },
  scenarioCardContent: {
    padding: Spacing.lg,
  },
  freeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  freeBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: Colors.success,
  },
  scenarioTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  scenarioResult: {
    fontSize: scale(32),
    fontWeight: '700',
    color: Colors.success,
    marginBottom: Spacing.md,
  },
  scenarioResultBlurred: {
    fontSize: scale(28),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  scenarioDetailBlurred: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  blurredDetails: {
    backgroundColor: Colors.cardBorder + '40',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  blurredPlaceholder: {
    fontSize: moderateScale(14),
    color: Colors.textTertiary,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  lockHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  lockHintText: {
    fontSize: moderateScale(12),
    color: Colors.textTertiary,
  },
  lockedCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    opacity: 0.6,
  },
  lockIcon: {
    marginBottom: Spacing.md,
  },
  lockedTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  lockedText: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  ctaSection: {
    alignItems: 'center',
  },
  priceHint: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
});
