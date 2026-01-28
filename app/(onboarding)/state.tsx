import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { trackEvent } from '../../src/lib/analytics';
import { usePayInput } from '../../src/context/PayInputContext';
import { Colors, Spacing, BorderRadius, scale, moderateScale, isSmallDevice } from '../../src/constants/theme';
import { OnboardingHeader } from '../../src/components';
import { getAllStatesWithTax } from '../../src/lib/payCalculator';

const TOTAL_STEPS = 7;

// State tax clusters for analytics
const NO_TAX_STATES = ['TX', 'FL', 'NV', 'WA', 'TN', 'SD', 'WY', 'AK', 'NH'];
const HIGH_TAX_STATES = ['CA', 'NY', 'NJ', 'HI', 'MN', 'OR'];

const getStateTaxCluster = (stateCode: string): string => {
  if (NO_TAX_STATES.includes(stateCode)) return 'NO-TAX';
  if (HIGH_TAX_STATES.includes(stateCode)) return 'H-TAX';
  return 'OTHER';
};

// No-tax states chips
const NO_TAX_CHIPS = [
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'NV', name: 'Nevada' },
  { code: 'WA', name: 'Washington' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'SD', name: 'S. Dakota' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'AK', name: 'Alaska' },
  { code: 'NH', name: 'N. Hampshire' },
];

// Popular states
const POPULAR_STATES = [
  { code: 'CA', name: 'California', taxRate: 9.3 },
  { code: 'NY', name: 'New York', taxRate: 6.5 },
  { code: 'IL', name: 'Illinois', taxRate: 4.95 },
  { code: 'TX', name: 'Texas', taxRate: 0 },
  { code: 'NJ', name: 'New Jersey', taxRate: 6.37 },
  { code: 'PA', name: 'Pennsylvania', taxRate: 3.07 },
];

export default function StateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setState } = usePayInput();
  const [selectedState, setSelectedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStates, setShowAllStates] = useState(false);

  const allStates = getAllStatesWithTax();

  useEffect(() => {
    trackEvent('onboarding_state_viewed');
  }, []);

  const handleSelect = (code: string, isUnknown = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedState(code);
    setState(code);

    const isNoTax = NO_TAX_STATES.includes(code);
    const cluster = getStateTaxCluster(code);

    trackEvent('onboarding_state_selected', {
      state: code,
      noTax: isNoTax,
      cluster,
      unknown: isUnknown,
    });

    // Auto-continue
    setTimeout(() => {
      router.push('/(onboarding)/filing');
    }, 250);
  };

  const handleUnknown = () => {
    handleSelect('TX', true);
    trackEvent('state_unknown_selected');
  };

  // Filter states for search
  const filteredStates = searchQuery
    ? allStates.filter(state =>
        state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        state.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      {/* Header */}
      <OnboardingHeader currentStep={4} totalSteps={TOTAL_STEPS} />

      {/* Title */}
      <Text style={styles.title}>Where do you work?</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={scale(18)} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search states..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={scale(18)} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery ? (
        /* Search Results */
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {filteredStates.map((state) => (
            <StateRow
              key={state.code}
              name={state.name}
              taxRate={state.taxRate * 100}
              selected={selectedState === state.code}
              onPress={() => handleSelect(state.code)}
            />
          ))}
          {filteredStates.length === 0 && (
            <Text style={styles.noResults}>No states found</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* No Tax States - Horizontal Chips */}
          <Text style={styles.sectionLabel}>NO STATE TAX</Text>
          <FlatList
            horizontal
            data={NO_TAX_CHIPS}
            keyExtractor={(item) => item.code}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedState === item.code && styles.chipSelected,
                ]}
                onPress={() => handleSelect(item.code)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.chipText,
                  selectedState === item.code && styles.chipTextSelected,
                ]}>
                  {item.code}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Popular States */}
          <Text style={styles.sectionLabel}>POPULAR</Text>
          {POPULAR_STATES.map((state) => (
            <StateRow
              key={state.code}
              name={state.name}
              taxRate={state.taxRate}
              selected={selectedState === state.code}
              onPress={() => handleSelect(state.code)}
            />
          ))}

          {/* Expand to see all */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowAllStates(!showAllStates)}
            activeOpacity={0.7}
          >
            <Text style={styles.expandText}>
              {showAllStates ? 'Show less' : 'See all 50 states'}
            </Text>
            <Ionicons
              name={showAllStates ? 'chevron-up' : 'chevron-down'}
              size={scale(18)}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {showAllStates && (
            <View style={styles.allStatesSection}>
              {allStates
                .filter(s => !POPULAR_STATES.find(p => p.code === s.code))
                .map((state) => (
                  <StateRow
                    key={state.code}
                    name={state.name}
                    taxRate={state.taxRate * 100}
                    selected={selectedState === state.code}
                    onPress={() => handleSelect(state.code)}
                  />
                ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Not sure fallback - Always visible */}
      <View style={[styles.fallbackContainer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TouchableOpacity style={styles.fallbackButton} onPress={handleUnknown} activeOpacity={0.7}>
          <Text style={styles.fallbackText}>Not sure? Use Texas (no tax)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// State row component
function StateRow({ 
  name, 
  taxRate, 
  selected, 
  onPress 
}: { 
  name: string; 
  taxRate: number; 
  selected: boolean; 
  onPress: () => void;
}) {
  const isNoTax = taxRate === 0;
  
  return (
    <TouchableOpacity
      style={[styles.stateRow, selected && styles.stateRowSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.stateName}>{name}</Text>
      <View style={styles.stateRight}>
        <Text style={[styles.stateTax, isNoTax && styles.stateTaxGreen]}>
          {isNoTax ? 'No tax ✓' : `${taxRate.toFixed(1)}%`}
        </Text>
        {selected && (
          <Ionicons name="checkmark-circle" size={scale(22)} color={Colors.success} style={styles.checkIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  scrollArea: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  chipsContainer: {
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    backgroundColor: Colors.success + '15',
    borderRadius: scale(20),
    borderWidth: 1.5,
    borderColor: Colors.success + '30',
    marginRight: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  chipText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.success,
  },
  chipTextSelected: {
    color: Colors.textInverse,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stateRowSelected: {
    backgroundColor: Colors.success + '15',
    borderColor: Colors.success,
  },
  stateName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stateRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateTax: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  stateTaxGreen: {
    color: Colors.success,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: Spacing.sm,
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  expandText: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  allStatesSection: {
    marginBottom: Spacing.xl,
  },
  noResults: {
    fontSize: moderateScale(15),
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  fallbackContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: Spacing.md,
  },
  fallbackButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  fallbackText: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
});
