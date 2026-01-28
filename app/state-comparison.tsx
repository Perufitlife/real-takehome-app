import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePayInput } from '../src/context/PayInputContext';
import { useComparisons } from '../src/context/ComparisonsContext';
import { trackEvent } from '../src/lib/analytics';
import { ToolHeader, PrimaryButton } from '../src/components';
import { Colors, Spacing, BorderRadius, formatCurrency, formatPercent, scale, moderateScale } from '../src/constants/theme';
import { compareStates, getAllStatesWithTax, getStateName, StateComparisonResult } from '../src/lib/payCalculator';

export default function StateComparisonScreen() {
  const router = useRouter();
  const payInput = usePayInput();
  const comparisons = useComparisons();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<StateComparisonResult | null>(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  
  const allStates = getAllStatesWithTax();

  useEffect(() => {
    trackEvent('state_comparison_opened', {
      current_state: payInput.state || 'unknown',
    });
  }, []);

  const handleClose = () => {
    router.push('/(tabs)/tools');
  };

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode);
    setShowStatePicker(false);
    
    if (!payInput.hourlyRate || !payInput.hoursPerWeek || !payInput.state) {
      return;
    }

    const result = compareStates(
      payInput.hourlyRate,
      payInput.hoursPerWeek,
      payInput.state,
      stateCode,
      payInput.filingStatus || 'single'
    );

    setComparisonResult(result);

    trackEvent('state_comparison_viewed', {
      current_state: payInput.state,
      new_state: stateCode,
      difference: Math.round(result.difference),
    });
  };

  const handleSaveComparison = () => {
    if (!comparisonResult) return;
    
    comparisons.saveStateComparison({
      name: `${getStateName(comparisonResult.currentState)} vs ${getStateName(comparisonResult.newState)}`,
      currentState: comparisonResult.currentState,
      newState: comparisonResult.newState,
      difference: comparisonResult.difference,
      differencePerMonth: comparisonResult.differencePerMonth,
    });

    trackEvent('state_comparison_saved', {
      current_state: comparisonResult.currentState,
      new_state: comparisonResult.newState,
    });

    Alert.alert('Saved!', 'Comparison saved to your Tools tab');
  };

  if (!payInput.hourlyRate || !payInput.state) {
    return (
      <View style={styles.container}>
        <ToolHeader
          title="State Comparison"
          subtitle="Please complete your profile first"
          onClose={handleClose}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Please update your profile to use this tool.
          </Text>
        </View>
      </View>
    );
  }

  const currentStateTax = allStates.find(s => s.code === payInput.state)?.taxRate || 0;
  const payResult = payInput.calculatePay();

  return (
    <View style={styles.container}>
      <ToolHeader
        title="State Comparison"
        subtitle="See how moving affects your take-home pay"
        onClose={handleClose}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current State Card */}
        <View style={styles.stateCard}>
          <View style={styles.stateHeader}>
            <Ionicons name="home" size={scale(20)} color={Colors.textPrimary} />
            <Text style={styles.stateLabel}>YOUR CURRENT STATE</Text>
          </View>
          <Text style={styles.stateName}>{getStateName(payInput.state)}</Text>
          <Text style={styles.taxRate}>
            {currentStateTax === 0 
              ? 'No state income tax ✅'
              : `${formatPercent(currentStateTax * 100)} state tax`
            }
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Annual Take-Home</Text>
              <Text style={styles.statAmount}>{formatCurrency(payResult?.netAnnual || 0)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Monthly</Text>
              <Text style={styles.statAmount}>{formatCurrency((payResult?.netAnnual || 0) / 12)}</Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoText}>
            State income tax can vary from 0% to 13%. Moving can save or cost you thousands.
          </Text>
        </View>

        {/* State Selector */}
        <Text style={styles.sectionTitle}>COMPARE WITH ANOTHER STATE</Text>
        <TouchableOpacity
          style={styles.stateSelector}
          onPress={() => setShowStatePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.stateSelectorText, !selectedState && styles.stateSelectorPlaceholder]}>
            {selectedState ? getStateName(selectedState) : 'Select a state...'}
          </Text>
          <Ionicons name="chevron-down" size={scale(24)} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Comparison Result */}
        {comparisonResult && (
          <View style={styles.resultsSection}>
            {/* New State Card */}
            <View style={styles.stateCard}>
              <View style={styles.stateHeader}>
                <Ionicons name="airplane" size={scale(20)} color={Colors.info} />
                <Text style={styles.stateLabel}>MOVING TO</Text>
              </View>
              <Text style={styles.stateName}>{getStateName(comparisonResult.newState)}</Text>
              <Text style={styles.taxRate}>
                {comparisonResult.newTaxRate === 0 
                  ? 'No state income tax ✅'
                  : `${formatPercent(comparisonResult.newTaxRate)} state tax`
                }
              </Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Annual Take-Home</Text>
                  <Text style={styles.statAmount}>{formatCurrency(comparisonResult.newNetAnnual)}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Monthly</Text>
                  <Text style={styles.statAmount}>{formatCurrency(comparisonResult.newNetAnnual / 12)}</Text>
                </View>
              </View>
            </View>

            {/* Difference Card */}
            <View style={[
              styles.differenceCard,
              comparisonResult.difference >= 0 ? styles.positiveCard : styles.negativeCard
            ]}>
              <Text style={styles.differenceLabel}>ANNUAL DIFFERENCE</Text>
              <Text style={[
                styles.differenceAmount,
                comparisonResult.difference >= 0 ? styles.positiveText : styles.negativeText
              ]}>
                {comparisonResult.difference >= 0 ? '+' : ''}{formatCurrency(comparisonResult.difference)}
              </Text>
              <Text style={styles.differenceSubtext}>
                {comparisonResult.difference >= 0 ? 'More' : 'Less'} take-home per year
              </Text>

              <View style={styles.monthlyRow}>
                <Text style={styles.monthlyLabel}>Per month:</Text>
                <Text style={[
                  styles.monthlyAmount,
                  comparisonResult.differencePerMonth >= 0 ? styles.positiveText : styles.negativeText
                ]}>
                  {comparisonResult.differencePerMonth >= 0 ? '+' : ''}{formatCurrency(comparisonResult.differencePerMonth)}
                </Text>
              </View>
            </View>

            {/* Insight */}
            {Math.abs(comparisonResult.difference) > 3000 && (
              <View style={[styles.insightBanner, comparisonResult.difference >= 0 ? styles.successBanner : styles.warningBanner]}>
                <Text style={styles.insightEmoji}>{comparisonResult.difference >= 0 ? '✅' : '⚠️'}</Text>
                <Text style={[styles.insightText, comparisonResult.difference >= 0 ? styles.successText : styles.warningText]}>
                  {comparisonResult.difference >= 0 
                    ? `Moving would save you ${formatCurrency(comparisonResult.differencePerMonth)}/month!`
                    : `Moving would cost you ${formatCurrency(Math.abs(comparisonResult.differencePerMonth))}/month`
                  }
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <PrimaryButton
                title="Save This Comparison"
                onPress={handleSaveComparison}
              />
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => setShowStatePicker(true)}
              >
                <Text style={styles.secondaryButtonText}>Compare Another State</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Popular Comparisons */}
        {!comparisonResult && (
          <View style={styles.popularSection}>
            <Text style={styles.sectionTitle}>POPULAR MOVES</Text>
            <View style={styles.quickOptions}>
              {['CA', 'TX', 'FL', 'NY'].filter(s => s !== payInput.state).map(stateCode => {
                const state = allStates.find(s => s.code === stateCode);
                if (!state) return null;
                
                return (
                  <TouchableOpacity
                    key={stateCode}
                    style={styles.quickOption}
                    onPress={() => handleStateSelect(stateCode)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickOptionName}>{state.name}</Text>
                    <Text style={styles.quickOptionTax}>
                      {state.taxRate === 0 ? 'No tax' : formatPercent(state.taxRate * 100)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* State Picker Modal */}
      <Modal
        visible={showStatePicker}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a State</Text>
              <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                <Ionicons name="close" size={scale(28)} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={allStates.filter(s => s.code !== payInput.state)}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stateOption}
                  onPress={() => handleStateSelect(item.code)}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.stateOptionName}>{item.name}</Text>
                    <Text style={styles.stateOptionTax}>
                      {item.taxRate === 0 
                        ? 'No state income tax ✅' 
                        : `${formatPercent(item.taxRate * 100)} state tax`
                      }
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={scale(20)} color={Colors.textTertiary} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  stateCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  stateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stateLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  stateName: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  taxRate: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: scale(40),
    backgroundColor: Colors.cardBorder,
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statAmount: {
    fontSize: moderateScale(20),
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
  stateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  stateSelectorText: {
    fontSize: moderateScale(16),
    color: Colors.textPrimary,
  },
  stateSelectorPlaceholder: {
    color: Colors.textTertiary,
  },
  resultsSection: {
    marginTop: Spacing.md,
  },
  differenceCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  positiveCard: {
    backgroundColor: Colors.success + '15',
  },
  negativeCard: {
    backgroundColor: Colors.warning + '15',
  },
  differenceLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  differenceAmount: {
    fontSize: scale(36),
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  positiveText: {
    color: Colors.success,
  },
  negativeText: {
    color: Colors.warning,
  },
  differenceSubtext: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
  },
  monthlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  monthlyLabel: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    marginRight: Spacing.md,
  },
  monthlyAmount: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  successBanner: {
    backgroundColor: Colors.success + '15',
  },
  warningBanner: {
    backgroundColor: Colors.warning + '15',
  },
  insightEmoji: {
    fontSize: scale(18),
    marginRight: Spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '600',
    lineHeight: scale(20),
  },
  successText: {
    color: Colors.success,
  },
  warningText: {
    color: Colors.warning,
  },
  actionButtons: {
    marginTop: Spacing.lg,
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
  popularSection: {
    marginTop: Spacing.xl,
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickOption: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  quickOptionName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  quickOptionTax: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  stateOptionName: {
    fontSize: moderateScale(16),
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stateOptionTax: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: Spacing.xxxl,
  },
});
