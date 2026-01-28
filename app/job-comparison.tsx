import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePayInput } from '../src/context/PayInputContext';
import { useComparisons } from '../src/context/ComparisonsContext';
import { trackEvent } from '../src/lib/analytics';
import { ToolHeader, PrimaryButton } from '../src/components';
import { Colors, Spacing, BorderRadius, formatCurrency, formatHourly, scale, moderateScale } from '../src/constants/theme';
import { compareJobs, JobOffer, JobComparisonResult, getStateName } from '../src/lib/payCalculator';

export default function JobComparisonScreen() {
  const router = useRouter();
  const payInput = usePayInput();
  const comparisons = useComparisons();
  
  // Current job (from user's saved data)
  const currentJob: JobOffer = {
    name: 'Current Job',
    hourlyRate: payInput.hourlyRate || 0,
    hoursPerWeek: payInput.hoursPerWeek || 40,
    state: payInput.state || 'TX',
  };

  // New job offers
  const [newJob1, setNewJob1] = useState<JobOffer>({
    name: 'Offer A',
    hourlyRate: (payInput.hourlyRate || 18) + 3,
    hoursPerWeek: 40,
    state: payInput.state || 'TX',
  });

  const [newJob2, setNewJob2] = useState<JobOffer>({
    name: 'Offer B',
    hourlyRate: (payInput.hourlyRate || 18) + 1.5,
    hoursPerWeek: 40,
    state: payInput.state || 'TX',
  });

  const [showJob2, setShowJob2] = useState(false);
  const [results, setResults] = useState<JobComparisonResult[]>([]);
  const [showInputs, setShowInputs] = useState(true);

  useEffect(() => {
    trackEvent('job_comparison_opened', {
      current_hourly: payInput.hourlyRate || 0,
    });
  }, []);

  const handleClose = () => {
    router.push('/(tabs)/tools');
  };

  const handleCompare = () => {
    if (!payInput.hourlyRate) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    const jobs = showJob2 ? [currentJob, newJob1, newJob2] : [currentJob, newJob1];
    const comparisonResults = compareJobs(jobs, payInput.filingStatus || 'single');
    setResults(comparisonResults);
    setShowInputs(false);

    trackEvent('job_comparison_created', {
      num_jobs: jobs.length,
      current_rate: currentJob.hourlyRate,
      new_rate_1: newJob1.hourlyRate,
    });
  };

  const findWinner = (): number => {
    if (results.length === 0) return -1;
    let maxNet = -Infinity;
    let winnerIndex = 0;
    
    results.forEach((result, index) => {
      if (result.netAnnual > maxNet) {
        maxNet = result.netAnnual;
        winnerIndex = index;
      }
    });
    
    return winnerIndex;
  };

  const winnerIndex = findWinner();

  const handleSaveComparison = () => {
    if (results.length === 0) return;

    const jobs = showJob2 ? [currentJob, newJob1, newJob2] : [currentJob, newJob1];
    
    comparisons.saveJobComparison({
      name: `${currentJob.name} vs ${newJob1.name}`,
      jobs,
      winnerIndex,
    });

    trackEvent('job_comparison_saved', {
      num_jobs: jobs.length,
      winner_index: winnerIndex,
    });

    Alert.alert('Saved!', 'Comparison saved to your Tools tab');
  };

  if (!payInput.hourlyRate) {
    return (
      <View style={styles.container}>
        <ToolHeader
          title="Job Comparison"
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

  return (
    <View style={styles.container}>
      <ToolHeader
        title="Job Comparison"
        subtitle="Compare job offers to find the best take-home pay"
        onClose={handleClose}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Section */}
        {showInputs && (
          <View style={styles.inputSection}>
            {/* Current Job (Read-only) */}
            <View style={styles.jobCard}>
              <Text style={styles.jobLabel}>YOUR CURRENT JOB</Text>
              <View style={styles.jobRow}>
                <Text style={styles.jobRowLabel}>Hourly Rate</Text>
                <Text style={styles.jobRowValue}>{formatHourly(currentJob.hourlyRate)}</Text>
              </View>
              <View style={styles.jobRow}>
                <Text style={styles.jobRowLabel}>Hours/Week</Text>
                <Text style={styles.jobRowValue}>{currentJob.hoursPerWeek}h</Text>
              </View>
              <View style={styles.jobRow}>
                <Text style={styles.jobRowLabel}>State</Text>
                <Text style={styles.jobRowValue}>{getStateName(currentJob.state)}</Text>
              </View>
            </View>

            {/* New Job 1 */}
            <View style={styles.jobCard}>
              <TextInput
                style={styles.jobTitleInput}
                value={newJob1.name}
                onChangeText={(text) => setNewJob1({ ...newJob1, name: text })}
                placeholder="Offer A"
                placeholderTextColor={Colors.textTertiary}
              />
              <View style={styles.jobRow}>
                <Text style={styles.jobRowLabel}>Hourly Rate</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={newJob1.hourlyRate.toString()}
                    onChangeText={(text) => {
                      const val = parseFloat(text) || 0;
                      setNewJob1({ ...newJob1, hourlyRate: val });
                    }}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
              <View style={styles.jobRow}>
                <Text style={styles.jobRowLabel}>Hours/Week</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={newJob1.hoursPerWeek.toString()}
                    onChangeText={(text) => {
                      const val = parseInt(text) || 40;
                      setNewJob1({ ...newJob1, hoursPerWeek: val });
                    }}
                    placeholder="40"
                    placeholderTextColor={Colors.textTertiary}
                  />
                  <Text style={styles.inputSuffix}>h</Text>
                </View>
              </View>
            </View>

            {/* Add Job 2 Button or Job 2 Inputs */}
            {!showJob2 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowJob2(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={scale(24)} color={Colors.primary} />
                <Text style={styles.addButtonText}>Add Another Offer</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.jobCard}>
                <TextInput
                  style={styles.jobTitleInput}
                  value={newJob2.name}
                  onChangeText={(text) => setNewJob2({ ...newJob2, name: text })}
                  placeholder="Offer B"
                  placeholderTextColor={Colors.textTertiary}
                />
                <View style={styles.jobRow}>
                  <Text style={styles.jobRowLabel}>Hourly Rate</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputPrefix}>$</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      value={newJob2.hourlyRate.toString()}
                      onChangeText={(text) => {
                        const val = parseFloat(text) || 0;
                        setNewJob2({ ...newJob2, hourlyRate: val });
                      }}
                      placeholder="0.00"
                      placeholderTextColor={Colors.textTertiary}
                    />
                  </View>
                </View>
                <View style={styles.jobRow}>
                  <Text style={styles.jobRowLabel}>Hours/Week</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={newJob2.hoursPerWeek.toString()}
                      onChangeText={(text) => {
                        const val = parseInt(text) || 40;
                        setNewJob2({ ...newJob2, hoursPerWeek: val });
                      }}
                      placeholder="40"
                      placeholderTextColor={Colors.textTertiary}
                    />
                    <Text style={styles.inputSuffix}>h</Text>
                  </View>
                </View>
              </View>
            )}

            <PrimaryButton
              title="Compare Jobs"
              onPress={handleCompare}
            />
          </View>
        )}

        {/* Results Section */}
        {!showInputs && results.length > 0 && (
          <View style={styles.resultsSection}>
            {/* Winner Banner */}
            {winnerIndex >= 0 && (
              <View style={styles.winnerBanner}>
                <Text style={styles.winnerEmoji}>🏆</Text>
                <Text style={styles.winnerText}>
                  {results[winnerIndex].job.name} gives you the most take-home pay!
                </Text>
              </View>
            )}

            {/* Job Cards */}
            {results.map((result, index) => {
              const isWinner = index === winnerIndex;
              const diff = index === 0 ? 0 : result.netAnnual - results[0].netAnnual;

              return (
                <View key={index} style={[styles.resultCard, isWinner && styles.resultCardWinner]}>
                  {isWinner && (
                    <View style={styles.winnerBadge}>
                      <Text style={styles.winnerBadgeText}>BEST</Text>
                    </View>
                  )}
                  <Text style={styles.resultName}>{result.job.name}</Text>
                  <Text style={styles.resultRate}>
                    {formatHourly(result.job.hourlyRate)} · {result.job.hoursPerWeek}h/week
                  </Text>
                  
                  <View style={styles.resultNumbers}>
                    <View style={styles.resultColumn}>
                      <Text style={styles.resultLabel}>Bi-weekly</Text>
                      <Text style={styles.resultAmount}>{formatCurrency(result.netBiweekly)}</Text>
                    </View>
                    <View style={styles.resultDivider} />
                    <View style={styles.resultColumn}>
                      <Text style={styles.resultLabel}>Annual</Text>
                      <Text style={styles.resultAmount}>{formatCurrency(result.netAnnual)}</Text>
                    </View>
                  </View>

                  {index > 0 && (
                    <View style={styles.diffRow}>
                      <Text style={styles.diffLabel}>vs Current</Text>
                      <Text style={[styles.diffValue, diff >= 0 ? styles.diffPositive : styles.diffNegative]}>
                        {diff >= 0 ? '+' : ''}{formatCurrency(diff)}/year
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <PrimaryButton
                title="Save This Comparison"
                onPress={handleSaveComparison}
              />
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => setShowInputs(true)}
              >
                <Text style={styles.secondaryButtonText}>Compare Different Jobs</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  inputSection: {
    marginBottom: Spacing.xxl,
  },
  jobCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  jobLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  jobTitleInput: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  jobRowLabel: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
  },
  jobRowValue: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPrefix: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  inputSuffix: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  input: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.textPrimary,
    minWidth: scale(60),
    textAlign: 'right',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  addButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  resultsSection: {
    marginTop: Spacing.md,
  },
  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  winnerEmoji: {
    fontSize: scale(20),
    marginRight: Spacing.sm,
  },
  winnerText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: Colors.success,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  resultCardWinner: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  winnerBadge: {
    position: 'absolute',
    top: -Spacing.sm,
    right: Spacing.md,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  winnerBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  resultName: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  resultRate: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  resultNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  resultColumn: {
    flex: 1,
    alignItems: 'center',
  },
  resultDivider: {
    width: 1,
    height: scale(40),
    backgroundColor: Colors.cardBorder,
  },
  resultLabel: {
    fontSize: moderateScale(12),
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  resultAmount: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  diffLabel: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  diffValue: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  diffPositive: {
    color: Colors.success,
  },
  diffNegative: {
    color: Colors.error,
  },
  actionButtons: {
    marginTop: Spacing.xl,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  secondaryButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.primary,
  },
  bottomSpacer: {
    height: Spacing.xxxl,
  },
});
