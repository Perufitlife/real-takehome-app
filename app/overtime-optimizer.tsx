import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { usePayInput } from '../src/context/PayInputContext';
import { trackEvent } from '../src/lib/analytics';
import { ToolHeader } from '../src/components';
import { Colors, Spacing, BorderRadius, formatCurrency, formatPercent, scale, moderateScale } from '../src/constants/theme';
import { calculateOvertimePay, OvertimeScenario } from '../src/lib/payCalculator';

const OVERTIME_OPTIONS = [5, 10, 15, 20];

export default function OvertimeOptimizerScreen() {
  const router = useRouter();
  const payInput = usePayInput();
  const [scenarios, setScenarios] = useState<OvertimeScenario[]>([]);

  useEffect(() => {
    loadScenarios();
    trackEvent('overtime_optimizer_opened', {
      hourly_rate: payInput.hourlyRate || 0,
      state: payInput.state || 'unknown',
    });
  }, []);

  const loadScenarios = () => {
    if (!payInput.hourlyRate) return;

    const results = OVERTIME_OPTIONS.map(hours => 
      calculateOvertimePay(
        payInput.hourlyRate!,
        40,
        hours,
        payInput.state || 'TX',
        payInput.filingStatus || 'single'
      )
    );

    setScenarios(results);
  };

  const handleClose = () => {
    router.push('/(tabs)/tools');
  };

  if (!payInput.hourlyRate) {
    return (
      <View style={styles.container}>
        <ToolHeader
          title="Overtime Optimizer"
          subtitle="Only available for hourly workers"
          onClose={handleClose}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Please update your profile to hourly pay to use this tool.
          </Text>
        </View>
      </View>
    );
  }

  const weeklyGross = (payInput.hourlyRate || 0) * 40;
  const weeklyNet = payInput.calculatePay()?.netWeekly || 0;

  return (
    <View style={styles.container}>
      <ToolHeader
        title="Overtime Optimizer"
        subtitle="See how much you really earn working extra hours"
        onClose={handleClose}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Base Pay Card */}
        <View style={styles.baseCard}>
          <Text style={styles.sectionLabel}>YOUR BASE (40 HOURS/WEEK)</Text>
          <View style={styles.baseRow}>
            <View style={styles.baseColumn}>
              <Text style={styles.baseLabel}>Gross</Text>
              <Text style={styles.baseAmount}>{formatCurrency(weeklyGross)}</Text>
            </View>
            <View style={styles.baseDivider} />
            <View style={styles.baseColumn}>
              <Text style={styles.baseLabel}>Take-Home</Text>
              <Text style={styles.baseAmount}>{formatCurrency(weeklyNet)}</Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoText}>
            Overtime pays 1.5x your rate, but taxes take a bigger bite
          </Text>
        </View>

        {/* Scenarios */}
        <Text style={styles.sectionTitle}>OVERTIME SCENARIOS</Text>
        
        {scenarios.map((scenario, index) => {
          const weeklyNetIncrease = scenario.netIncrease / 52;
          const isWorthIt = scenario.effectiveTaxRate < 35;

          return (
            <View key={index} style={styles.scenarioCard}>
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioTitle}>+{scenario.extraHours} hours/week</Text>
                <View style={[styles.worthBadge, isWorthIt ? styles.goodBadge : styles.warnBadge]}>
                  <Text style={styles.worthText}>
                    {isWorthIt ? '✅ Worth it' : '⚠️ High taxes'}
                  </Text>
                </View>
              </View>

              <Text style={styles.mainAmount}>+{formatCurrency(weeklyNetIncrease)}/week</Text>

              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Gross increase</Text>
                  <Text style={styles.breakdownValue}>+{formatCurrency(scenario.grossIncrease / 52)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Taxes</Text>
                  <Text style={[styles.breakdownValue, styles.taxValue]}>-{formatCurrency(scenario.taxesIncrease / 52)}</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabelBold}>Net take-home</Text>
                  <Text style={styles.breakdownValueBold}>+{formatCurrency(weeklyNetIncrease)}</Text>
                </View>
              </View>

              <View style={styles.taxRateBox}>
                <Text style={styles.taxRateText}>
                  Effective tax rate: {formatPercent(scenario.effectiveTaxRate)}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  baseCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  baseRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseColumn: {
    alignItems: 'center',
    flex: 1,
  },
  baseDivider: {
    width: 1,
    height: scale(40),
    backgroundColor: Colors.cardBorder,
  },
  baseLabel: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  baseAmount: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xxl,
  },
  infoEmoji: {
    fontSize: scale(18),
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: Colors.info,
    lineHeight: scale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  scenarioCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scenarioTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  worthBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  goodBadge: {
    backgroundColor: Colors.success + '20',
  },
  warnBadge: {
    backgroundColor: Colors.warning + '20',
  },
  worthText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  mainAmount: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: Colors.success,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  breakdown: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  breakdownLabel: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  breakdownLabelBold: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  breakdownValue: {
    fontSize: moderateScale(14),
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  breakdownValueBold: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: Colors.success,
  },
  taxValue: {
    color: Colors.warning,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: Spacing.xs,
  },
  taxRateBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.info + '10',
    borderRadius: BorderRadius.sm,
  },
  taxRateText: {
    fontSize: moderateScale(13),
    color: Colors.info,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: Spacing.xxxl,
  },
});
