import { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePayInput } from '../src/context/PayInputContext';
import { trackEvent } from '../src/lib/analytics';
import { Card, PrimaryButton, BlurredCard } from '../src/components';
import { Colors, Spacing, BorderRadius, formatCurrency, getStateName, scale, moderateScale, isTablet, MAX_CONTENT_WIDTH } from '../src/constants/theme';
import { compareStates } from '../src/lib/payCalculator';

export default function StatePreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();

  useEffect(() => {
    trackEvent('tool_preview_viewed', { tool: 'state_comparison' });
    
    // Block hardware back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    
    return () => backHandler.remove();
  }, []);

  if (!payInput.hourlyRate || !payInput.state) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={styles.title}>State comparison not available</Text>
        <Text style={styles.subtitle}>Please complete your profile first</Text>
      </View>
    );
  }

  // Example comparison
  const exampleState = payInput.state === 'CA' ? 'TX' : 'CA';
  
  const comparison = compareStates(
    payInput.hourlyRate,
    payInput.hoursPerWeek || 40,
    payInput.state,
    exampleState,
    payInput.filingStatus || 'single',
    payInput.contribution401k || undefined,
    payInput.contributionType || undefined,
    payInput.hasOvertime || undefined,
    payInput.overtimeMultiplier
  );

  const handleUnlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    trackEvent('paywall_from_preview', { source: 'state_comparison' });
    router.push('/paywall?from=state');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xxl }]}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>State Tax Calculator</Text>
        <Text style={styles.subtitle}>See how moving affects your paycheck</Text>
      </View>

      {/* Comparison Preview */}
      <Card style={styles.comparisonCard}>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>PREVIEW</Text>
        </View>

        <Text style={styles.exampleTitle}>
          {getStateName(comparison.currentState)} vs {getStateName(comparison.newState)}
        </Text>

        <View style={styles.stateRow}>
          <View style={styles.stateColumn}>
            <Text style={styles.stateLabel}>Current</Text>
            <Text style={styles.stateName}>{getStateName(comparison.currentState)}</Text>
            {/* Blurred amount */}
            <View style={styles.blurredAmount}>
              <Text style={styles.blurredText}>$XX,XXX/yr</Text>
              <Ionicons name="lock-closed" size={scale(10)} color={Colors.textTertiary} />
            </View>
          </View>

          <View style={styles.arrowColumn}>
            <Ionicons name="arrow-forward" size={scale(20)} color={Colors.textTertiary} />
          </View>

          <View style={styles.stateColumn}>
            <Text style={styles.stateLabel}>If you move</Text>
            <Text style={styles.stateName}>{getStateName(comparison.newState)}</Text>
            {/* Blurred amount */}
            <View style={styles.blurredAmount}>
              <Text style={styles.blurredText}>$XX,XXX/yr</Text>
              <Ionicons name="lock-closed" size={scale(10)} color={Colors.textTertiary} />
            </View>
          </View>
        </View>

        {/* Difference - visible teaser */}
        <View style={styles.differenceSection}>
          <Text style={styles.differenceLabel}>Annual Difference</Text>
          <Text style={[
            styles.differenceValue,
            { color: comparison.difference >= 0 ? Colors.success : Colors.error }
          ]}>
            {comparison.difference >= 0 ? '+' : ''}{formatCurrency(comparison.difference)}
          </Text>
          {/* Monthly blurred */}
          <View style={styles.blurredMonthly}>
            <Text style={styles.blurredSmall}>
              = $XXX/month {comparison.difference >= 0 ? 'more' : 'less'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Locked Section */}
      <BlurredCard style={styles.lockedSection} isLocked={true} intensity={25}>
        <View style={styles.lockedContent}>
          <Text style={styles.lockedTitle}>Compare all 50 states</Text>
          <Text style={styles.lockedText}>
            See tax differences for every state and make informed moving decisions
          </Text>
        </View>
      </BlurredCard>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA - Only unlock */}
      <View style={[styles.ctaSection, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <PrimaryButton
          title="Unlock All States"
          onPress={handleUnlock}
        />
        <Text style={styles.priceHint}>Full access for $9.99/month</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    ...(isTablet ? { alignItems: 'center' as const } : {}),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: isTablet ? MAX_CONTENT_WIDTH : undefined,
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
  comparisonCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    position: 'relative',
  },
  freeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  freeBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: Colors.primary,
  },
  exampleTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  stateRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  stateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  arrowColumn: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateLabel: {
    fontSize: moderateScale(12),
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  stateName: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  blurredAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.cardBorder + '40',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  blurredText: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  differenceSection: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  differenceLabel: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  differenceValue: {
    fontSize: scale(32),
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  blurredMonthly: {
    backgroundColor: Colors.cardBorder + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  blurredSmall: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
  },
  lockedSection: {
    marginBottom: Spacing.md,
  },
  lockedContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  lockedTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  lockedText: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: scale(20),
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
