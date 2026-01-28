import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useComparisons, SavedJobComparison, SavedStateComparison } from '../src/context/ComparisonsContext';
import { ToolHeader } from '../src/components';
import { Colors, Spacing, BorderRadius, formatCurrency, formatHourly, scale, moderateScale, isTablet, MAX_CONTENT_WIDTH } from '../src/constants/theme';
import { getStateName } from '../src/lib/payCalculator';

export default function SavedComparisonsScreen() {
  const router = useRouter();
  const comparisons = useComparisons();

  const handleClose = () => {
    router.push('/(tabs)/tools');
  };

  const handleDeleteJob = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Delete Comparison',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            comparisons.deleteJobComparison(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  const handleDeleteState = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Delete Comparison',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            comparisons.deleteStateComparison(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear All',
      'Are you sure you want to delete all saved comparisons?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            comparisons.clearAllComparisons();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  const totalSaved = comparisons.jobComparisons.length + comparisons.stateComparisons.length;

  return (
    <View style={styles.container}>
      <ToolHeader
        title="Saved Comparisons"
        subtitle={`${totalSaved} saved calculation${totalSaved !== 1 ? 's' : ''}`}
        onClose={handleClose}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Job Comparisons */}
        {comparisons.jobComparisons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase" size={scale(18)} color={Colors.info} />
              <Text style={styles.sectionTitle}>JOB COMPARISONS</Text>
            </View>
            
            {comparisons.jobComparisons.map((comparison) => (
              <JobComparisonCard 
                key={comparison.id} 
                comparison={comparison}
                onDelete={() => handleDeleteJob(comparison.id, comparison.name)}
              />
            ))}
          </View>
        )}

        {/* State Comparisons */}
        {comparisons.stateComparisons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="map" size={scale(18)} color={Colors.premium} />
              <Text style={styles.sectionTitle}>STATE COMPARISONS</Text>
            </View>
            
            {comparisons.stateComparisons.map((comparison) => (
              <StateComparisonCard 
                key={comparison.id} 
                comparison={comparison}
                onDelete={() => handleDeleteState(comparison.id, comparison.name)}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {totalSaved === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={scale(48)} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Saved Comparisons</Text>
            <Text style={styles.emptyText}>
              Save job or state comparisons from the calculators to see them here.
            </Text>
          </View>
        )}

        {/* Clear All Button */}
        {totalSaved > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={scale(18)} color={Colors.error} />
            <Text style={styles.clearButtonText}>Clear All Comparisons</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

interface JobCardProps {
  comparison: SavedJobComparison;
  onDelete: () => void;
}

function JobComparisonCard({ comparison, onDelete }: JobCardProps) {
  const winner = comparison.jobs[comparison.winnerIndex];
  const savedDate = new Date(comparison.savedAt).toLocaleDateString();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{comparison.name}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={scale(22)} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.jobsContainer}>
        {comparison.jobs.map((job, index) => (
          <View key={index} style={styles.jobItem}>
            <View style={styles.jobNameRow}>
              <Text style={styles.jobName}>{job.name}</Text>
              {index === comparison.winnerIndex && (
                <View style={styles.winnerBadge}>
                  <Text style={styles.winnerBadgeText}>BEST</Text>
                </View>
              )}
            </View>
            <Text style={styles.jobDetails}>
              {formatHourly(job.hourlyRate)} · {job.hoursPerWeek}h/week
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.savedDate}>Saved {savedDate}</Text>
      </View>
    </View>
  );
}

interface StateCardProps {
  comparison: SavedStateComparison;
  onDelete: () => void;
}

function StateComparisonCard({ comparison, onDelete }: StateCardProps) {
  const savedDate = new Date(comparison.savedAt).toLocaleDateString();
  const isPositive = comparison.difference >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{comparison.name}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={scale(22)} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.stateRow}>
        <View style={styles.stateItem}>
          <Text style={styles.stateLabel}>From</Text>
          <Text style={styles.stateName}>{getStateName(comparison.currentState)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={scale(18)} color={Colors.textTertiary} />
        <View style={styles.stateItem}>
          <Text style={styles.stateLabel}>To</Text>
          <Text style={styles.stateName}>{getStateName(comparison.newState)}</Text>
        </View>
      </View>

      <View style={[styles.differenceBox, isPositive ? styles.positiveBox : styles.negativeBox]}>
        <Text style={[styles.differenceAmount, isPositive ? styles.positiveText : styles.negativeText]}>
          {isPositive ? '+' : ''}{formatCurrency(comparison.difference)}/year
        </Text>
        <Text style={styles.differenceSubtext}>
          ({isPositive ? '+' : ''}{formatCurrency(comparison.differencePerMonth)}/month)
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.savedDate}>Saved {savedDate}</Text>
      </View>
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
    ...(isTablet ? {
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center' as const,
      width: '100%',
    } : {}),
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  jobsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: Spacing.md,
  },
  jobItem: {
    marginBottom: Spacing.sm,
  },
  jobNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  jobName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  winnerBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  winnerBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: Colors.textInverse,
  },
  jobDetails: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  stateItem: {
    alignItems: 'center',
    flex: 1,
  },
  stateLabel: {
    fontSize: moderateScale(11),
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  stateName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  differenceBox: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  positiveBox: {
    backgroundColor: Colors.success + '15',
  },
  negativeBox: {
    backgroundColor: Colors.warning + '15',
  },
  differenceAmount: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  positiveText: {
    color: Colors.success,
  },
  negativeText: {
    color: Colors.warning,
  },
  differenceSubtext: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  cardFooter: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  savedDate: {
    fontSize: moderateScale(12),
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: scale(20),
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
  },
  clearButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  bottomSpacer: {
    height: Spacing.xxxl,
  },
});
