import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePayInput } from '../src/context/PayInputContext';
import { trackEvent } from '../src/lib/analytics';
import { hasFullBreakdown } from '../src/lib/subscriptions';
import { Card, Button, NumberDisplay, InsightBadge, PremiumBadge } from '../src/components';
import { Colors, Typography, Spacing, formatCurrency, BorderRadius } from '../src/constants/theme';
import { forecastMonthly, forecastYearly, MonthlyForecast, YearlyForecast } from '../src/lib/payCalculator';

type ForecastPeriod = 'month' | 'year';

export default function ForecastScreen() {
  const router = useRouter();
  const payInput = usePayInput();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [period, setPeriod] = useState<ForecastPeriod>('month');
  
  // Monthly forecast - 4 weeks
  const [weeklyHours, setWeeklyHours] = useState<number[]>([
    payInput.hoursPerWeek || 40,
    payInput.hoursPerWeek || 40,
    payInput.hoursPerWeek || 40,
    payInput.hoursPerWeek || 40,
  ]);

  // Yearly forecast - average hours
  const [avgYearlyHours, setAvgYearlyHours] = useState<number>(payInput.hoursPerWeek || 40);

  const [monthlyForecast, setMonthlyForecast] = useState<MonthlyForecast | null>(null);
  const [yearlyForecast, setYearlyForecast] = useState<YearlyForecast | null>(null);

  useEffect(() => {
    checkAccess();
    calculateForecasts();
    
    trackEvent('forecast_opened', {
      hourly_rate: payInput.hourlyRate || 0,
      default_hours: payInput.hoursPerWeek || 40,
    });
  }, []);

  const checkAccess = async () => {
    const access = await hasFullBreakdown();
    setHasAccess(access);
  };

  const calculateForecasts = () => {
    if (!payInput.hourlyRate || !payInput.state) return;

    // Monthly
    const monthly = forecastMonthly(
      payInput.hourlyRate,
      weeklyHours,
      payInput.state,
      payInput.filingStatus || 'single'
    );
    setMonthlyForecast(monthly);

    // Yearly
    const yearly = forecastYearly(
      payInput.hourlyRate,
      avgYearlyHours,
      payInput.state,
      payInput.filingStatus || 'single'
    );
    setYearlyForecast(yearly);
  };

  const handleWeekHoursChange = (weekIndex: number, value: string) => {
    const hours = parseInt(value) || 0;
    const newWeeklyHours = [...weeklyHours];
    newWeeklyHours[weekIndex] = hours;
    setWeeklyHours(newWeeklyHours);
  };

  const handleRecalculate = () => {
    // Free users can only customize once
    if (!hasAccess) {
      trackEvent('premium_feature_locked_clicked', {
        feature: 'forecast_customize_multiple',
      });
      router.push('/paywall');
      return;
    }

    calculateForecasts();
    
    trackEvent('forecast_customized', {
      period,
      weekly_hours: weeklyHours,
      avg_yearly_hours: avgYearlyHours,
    });
  };

  if (!payInput.hourlyRate) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Forecast</Text>
        <Text style={styles.errorText}>
          Forecast is only available for hourly workers.
        </Text>
        <Button title="Go Back" onPress={() => router.push('/(tabs)')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)')}>
        <Ionicons name="close" size={28} color={Colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Earnings Forecast</Text>
      <Text style={styles.subtitle}>
        Project your income with variable hours
      </Text>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[
            styles.periodButtonText,
            period === 'month' && styles.periodButtonTextActive
          ]}>
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'year' && styles.periodButtonActive]}
          onPress={() => {
            if (!hasAccess) {
              trackEvent('premium_feature_locked_clicked', {
                feature: 'forecast_yearly',
              });
              router.push('/paywall');
            } else {
              setPeriod('year');
            }
          }}
        >
          <Text style={[
            styles.periodButtonText,
            period === 'year' && styles.periodButtonTextActive
          ]}>
            This Year
          </Text>
          {!hasAccess && <PremiumBadge size="small" text="Pro" />}
        </TouchableOpacity>
      </View>

      {/* Monthly Forecast */}
      {period === 'month' && monthlyForecast && (
        <View>
          {/* Input Section */}
          <Card style={styles.inputCard}>
            <Text style={styles.cardTitle}>CUSTOMIZE YOUR HOURS</Text>
            {weeklyHours.map((hours, index) => (
              <View key={index} style={styles.inputRow}>
                <Text style={styles.inputLabel}>Week {index + 1}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={hours.toString()}
                  onChangeText={(value) => handleWeekHoursChange(index, value)}
                  placeholder="40"
                />
                <Text style={styles.inputUnit}>hours</Text>
                {hours > 40 && (
                  <View style={styles.overtimeBadge}>
                    <Text style={styles.overtimeText}>+{hours - 40} OT</Text>
                  </View>
                )}
              </View>
            ))}
            <Button
              title="Recalculate"
              onPress={handleRecalculate}
              variant="secondary"
              style={styles.recalculateButton}
            />
          </Card>

          {/* Monthly Summary */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>MONTHLY TOTAL</Text>
            <NumberDisplay amount={monthlyForecast.totalNet} size="hero" />
            <Text style={styles.summarySubtext}>Net take-home pay</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Hours</Text>
                <Text style={styles.statValue}>{monthlyForecast.totalHours}h</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Gross Pay</Text>
                <Text style={styles.statValue}>{formatCurrency(monthlyForecast.totalGross)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg/Week</Text>
                <Text style={styles.statValue}>{formatCurrency(monthlyForecast.avgWeeklyNet)}</Text>
              </View>
            </View>
          </Card>

          {/* Weekly Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WEEKLY BREAKDOWN</Text>
            {monthlyForecast.weeks.map((week, index) => (
              <Card key={index} style={styles.weekCard}>
                <View style={styles.weekHeader}>
                  <Text style={styles.weekTitle}>Week {week.weekNumber}</Text>
                  <Text style={styles.weekHours}>
                    {week.hours}h {week.overtimeHours > 0 && `(+${week.overtimeHours} OT)`}
                  </Text>
                </View>
                <View style={styles.weekStats}>
                  <View style={styles.weekStat}>
                    <Text style={styles.weekStatLabel}>Gross</Text>
                    <Text style={styles.weekStatValue}>{formatCurrency(week.grossPay)}</Text>
                  </View>
                  <View style={styles.weekStat}>
                    <Text style={styles.weekStatLabel}>Net</Text>
                    <NumberDisplay amount={week.netPay} size="small" />
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* Insights */}
          {monthlyForecast.totalHours > 160 && (
            <InsightBadge
              icon="💪"
              text={`You're working ${monthlyForecast.totalHours - 160} overtime hours this month!`}
              type="info"
            />
          )}
        </View>
      )}

      {/* Yearly Forecast */}
      {period === 'year' && yearlyForecast && hasAccess && (
        <View>
          {/* Input Section */}
          <Card style={styles.inputCard}>
            <Text style={styles.cardTitle}>AVERAGE WEEKLY HOURS</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Hours/Week</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={avgYearlyHours.toString()}
                onChangeText={(value) => setAvgYearlyHours(parseInt(value) || 40)}
                placeholder="40"
              />
              <Text style={styles.inputUnit}>hours</Text>
            </View>
            <Button
              title="Recalculate"
              onPress={handleRecalculate}
              variant="secondary"
              style={styles.recalculateButton}
            />
          </Card>

          {/* Yearly Summary */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>YEARLY TOTAL</Text>
            <NumberDisplay amount={yearlyForecast.totalNet} size="hero" />
            <Text style={styles.summarySubtext}>Net take-home pay</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Hours</Text>
                <Text style={styles.statValue}>{yearlyForecast.totalHours}h</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg/Month</Text>
                <Text style={styles.statValue}>{formatCurrency(yearlyForecast.avgMonthlyNet)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg Hours/Week</Text>
                <Text style={styles.statValue}>{yearlyForecast.avgWeeklyHours}h</Text>
              </View>
            </View>
          </Card>

          {/* Monthly Projection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MONTHLY PROJECTION</Text>
            <Card style={styles.chartCard}>
              {yearlyForecast.monthlyNet.map((net, index) => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return (
                  <View key={index} style={styles.monthRow}>
                    <Text style={styles.monthLabel}>{months[index]}</Text>
                    <Text style={styles.monthValue}>{formatCurrency(net)}</Text>
                  </View>
                );
              })}
            </Card>
          </View>
        </View>
      )}

      {/* CTA */}
      {!hasAccess && (
        <View style={styles.ctaSection}>
          <InsightBadge
            icon="🚀"
            text="Unlock yearly forecast + export projections with Premium"
            type="success"
          />
          <Button
            title="Upgrade to Premium"
            onPress={() => {
              trackEvent('paywall_viewed_from', { source: 'forecast' });
              router.push('/paywall');
            }}
            style={styles.upgradeButton}
          />
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xxl,
    paddingTop: Spacing.massive,
  },
  backButton: {
    marginBottom: Spacing.lg,
    width: 40,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.xxl,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.xxl,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  periodButtonTextActive: {
    color: Colors.textInverse,
  },
  inputCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.sectionLabel,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  input: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    textAlign: 'center',
  },
  inputUnit: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  overtimeBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.sm,
  },
  overtimeText: {
    ...Typography.small,
    color: Colors.success,
    fontWeight: '600',
  },
  recalculateButton: {
    marginTop: Spacing.lg,
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  summaryLabel: {
    ...Typography.sectionLabel,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  summarySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  section: {
    marginTop: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.sectionLabel,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  weekCard: {
    marginBottom: Spacing.md,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  weekTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  weekHours: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  weekStat: {
    alignItems: 'center',
  },
  weekStatLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  weekStatValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  chartCard: {
    padding: Spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  monthLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  monthValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  ctaSection: {
    marginTop: Spacing.xxxl,
  },
  upgradeButton: {
    marginTop: Spacing.lg,
  },
  bottomSpacer: {
    height: Spacing.huge,
  },
});
