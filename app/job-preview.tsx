import { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePayInput } from '../src/context/PayInputContext';
import { trackEvent } from '../src/lib/analytics';
import { Card, PrimaryButton, BlurredCard } from '../src/components';
import { Colors, Spacing, BorderRadius, formatHourly, scale, moderateScale } from '../src/constants/theme';
import { compareJobs, JobOffer } from '../src/lib/payCalculator';

export default function JobPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();

  useEffect(() => {
    trackEvent('tool_preview_viewed', { tool: 'job_comparison' });
    
    // Block hardware back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    
    return () => backHandler.remove();
  }, []);

  if (!payInput.hourlyRate) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={styles.title}>Job comparison not available</Text>
        <Text style={styles.subtitle}>Please set your hourly rate first</Text>
      </View>
    );
  }

  // Create example comparison
  const currentJob: JobOffer = {
    name: 'Current',
    hourlyRate: payInput.hourlyRate,
    hoursPerWeek: payInput.hoursPerWeek || 40,
    state: payInput.state || 'TX',
  };

  const betterOffer: JobOffer = {
    name: 'New Offer',
    hourlyRate: payInput.hourlyRate + 3,
    hoursPerWeek: payInput.hoursPerWeek || 40,
    state: payInput.state || 'TX',
  };

  const comparison = compareJobs(
    [currentJob, betterOffer],
    payInput.filingStatus || 'single'
  );

  const difference = comparison[1].netAnnual - comparison[0].netAnnual;
  const monthlyDiff = difference / 12;

  const handleUnlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    trackEvent('paywall_from_preview', { source: 'job_comparison' });
    router.push('/paywall?from=job');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xxl }]}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Job Comparison</Text>
        <Text style={styles.subtitle}>See the real difference between offers</Text>
      </View>

      {/* Comparison Preview - Partial blur */}
      <Card style={styles.comparisonCard}>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>PREVIEW</Text>
        </View>

        <Text style={styles.exampleTitle}>Current vs $3/hr raise</Text>

        <View style={styles.comparisonRow}>
          <View style={styles.jobColumn}>
            <Text style={styles.jobLabel}>Current Job</Text>
            <Text style={styles.jobRate}>{formatHourly(currentJob.hourlyRate)}</Text>
            {/* Blurred amount */}
            <View style={styles.blurredAmount}>
              <Text style={styles.blurredText}>$XX,XXX</Text>
              <Ionicons name="lock-closed" size={scale(10)} color={Colors.textTertiary} />
            </View>
          </View>

          <View style={styles.vsColumn}>
            <Text style={styles.vsText}>vs</Text>
          </View>

          <View style={styles.jobColumn}>
            <Text style={styles.jobLabel}>New Offer 🏆</Text>
            <Text style={styles.jobRate}>{formatHourly(betterOffer.hourlyRate)}</Text>
            {/* Blurred amount */}
            <View style={styles.blurredAmount}>
              <Text style={styles.blurredText}>$XX,XXX</Text>
              <Ionicons name="lock-closed" size={scale(10)} color={Colors.textTertiary} />
            </View>
          </View>
        </View>

        {/* Difference - visible teaser */}
        <View style={styles.differenceSection}>
          <Text style={styles.differenceLabel}>Annual Difference</Text>
          <Text style={styles.differenceValue}>+${Math.round(difference).toLocaleString()}</Text>
          {/* Monthly blurred */}
          <View style={styles.blurredMonthly}>
            <Text style={styles.blurredSmall}>= $XXX/month more</Text>
          </View>
        </View>
      </Card>

      {/* Locked Section */}
      <BlurredCard style={styles.lockedSection} isLocked={true} intensity={25}>
        <View style={styles.lockedContent}>
          <Text style={styles.lockedTitle}>Compare up to 5 jobs</Text>
          <Text style={styles.lockedText}>
            Side-by-side comparisons, save results, make the best decision
          </Text>
        </View>
      </BlurredCard>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA - Only unlock */}
      <View style={[styles.ctaSection, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <PrimaryButton
          title="Unlock All Comparisons"
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
  comparisonRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  jobColumn: {
    flex: 1,
    alignItems: 'center',
  },
  vsColumn: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: moderateScale(14),
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  jobLabel: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  jobRate: {
    fontSize: moderateScale(18),
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
    fontSize: moderateScale(14),
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
    color: Colors.success,
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
