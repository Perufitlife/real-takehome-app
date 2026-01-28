import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { usePayInput } from '../src/context/PayInputContext';
import { trackEvent } from '../src/lib/analytics';
import { PrimaryButton } from '../src/components';
import { Colors, Spacing, BorderRadius, getStateName, scale, moderateScale } from '../src/constants/theme';
import { getAllStatesWithTax } from '../src/lib/payCalculator';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();

  // Local state for editing
  const [payType, setPayType] = useState<'salary' | 'hourly'>(payInput.payType || 'hourly');
  const [hourlyRate, setHourlyRate] = useState(payInput.hourlyRate?.toString() || '');
  const [annualSalary, setAnnualSalary] = useState(payInput.annualSalary?.toString() || '');
  const [hoursPerWeek, setHoursPerWeek] = useState(payInput.hoursPerWeek?.toString() || '40');
  const [selectedState, setSelectedState] = useState(payInput.state || 'TX');
  const [filingStatus, setFilingStatus] = useState<'single' | 'married' | 'head_of_household'>(
    payInput.filingStatus || 'single'
  );
  
  // 401k fields
  const [has401k, setHas401k] = useState(payInput.contribution401k !== null && payInput.contribution401k > 0);
  const [contribution401k, setContribution401k] = useState(payInput.contribution401k || 6);
  
  // Overtime fields
  const [hasOvertime, setHasOvertime] = useState(payInput.hasOvertime || false);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(payInput.overtimeMultiplier || 1.5);

  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showFilingPicker, setShowFilingPicker] = useState(false);

  const allStates = getAllStatesWithTax();

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Validation
    if (payType === 'hourly' && !hourlyRate) {
      Alert.alert('Error', 'Please enter your hourly rate');
      return;
    }
    if (payType === 'salary' && !annualSalary) {
      Alert.alert('Error', 'Please enter your annual salary');
      return;
    }
    if (!hoursPerWeek) {
      Alert.alert('Error', 'Please enter hours per week');
      return;
    }

    // Save to context (which saves to AsyncStorage)
    payInput.setPayType(payType);
    if (payType === 'hourly') {
      payInput.setHourlyRate(parseFloat(hourlyRate) || 0);
    } else {
      payInput.setAnnualSalary(parseFloat(annualSalary) || 0);
    }
    payInput.setHoursPerWeek(parseInt(hoursPerWeek) || 40);
    payInput.setState(selectedState);
    payInput.setFilingStatus(filingStatus);
    
    // Save 401k
    if (has401k) {
      payInput.setContribution401k(contribution401k);
      payInput.setContributionType('percent');
    } else {
      payInput.setContribution401k(null);
    }
    
    // Save overtime
    payInput.setHasOvertime(hasOvertime);
    payInput.setOvertimeMultiplier(overtimeMultiplier);

    trackEvent('profile_updated', {
      pay_type: payType,
      state: selectedState,
      filing_status: filingStatus,
      has_401k: has401k,
      has_overtime: hasOvertime,
    });

    Alert.alert('Success', 'Profile updated successfully', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={scale(28)} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Pay Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INCOME</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Pay Type</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, payType === 'hourly' && styles.toggleButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPayType('hourly');
                }}
              >
                <Text style={[styles.toggleText, payType === 'hourly' && styles.toggleTextActive]}>
                  Hourly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, payType === 'salary' && styles.toggleButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPayType('salary');
                }}
              >
                <Text style={[styles.toggleText, payType === 'salary' && styles.toggleTextActive]}>
                  Salary
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hourly Rate or Annual Salary */}
          {payType === 'hourly' ? (
            <View style={styles.field}>
              <Text style={styles.label}>Hourly Rate ($)</Text>
              <TextInput
                style={styles.input}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="18.00"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          ) : (
            <View style={styles.field}>
              <Text style={styles.label}>Annual Salary ($)</Text>
              <TextInput
                style={styles.input}
                value={annualSalary}
                onChangeText={setAnnualSalary}
                placeholder="60000"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          )}

          {/* Hours per Week */}
          <View style={styles.field}>
            <Text style={styles.label}>Hours per Week</Text>
            <TextInput
              style={styles.input}
              value={hoursPerWeek}
              onChangeText={setHoursPerWeek}
              placeholder="40"
              keyboardType="number-pad"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
        </View>

        {/* Location & Taxes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCATION & TAXES</Text>
          
          {/* State */}
          <View style={styles.field}>
            <Text style={styles.label}>State</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowStatePicker(!showStatePicker)}
            >
              <Text style={styles.pickerText}>{getStateName(selectedState)}</Text>
              <Ionicons name="chevron-down" size={scale(20)} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            {showStatePicker && (
              <View style={styles.pickerOptions}>
                {allStates.slice(0, 12).map((state) => (
                  <TouchableOpacity
                    key={state.code}
                    style={styles.pickerOption}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedState(state.code);
                      setShowStatePicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>
                      {state.name} ({state.taxRate === 0 ? 'No tax' : `${(state.taxRate * 100).toFixed(1)}%`})
                    </Text>
                    {selectedState === state.code && (
                      <Ionicons name="checkmark" size={scale(20)} color={Colors.success} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Filing Status */}
          <View style={styles.field}>
            <Text style={styles.label}>Filing Status</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowFilingPicker(!showFilingPicker)}
            >
              <Text style={styles.pickerText}>
                {filingStatus === 'single' ? 'Single' : 
                 filingStatus === 'married' ? 'Married' : 'Head of Household'}
              </Text>
              <Ionicons name="chevron-down" size={scale(20)} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            {showFilingPicker && (
              <View style={styles.pickerOptions}>
                {[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married Filing Jointly' },
                  { value: 'head_of_household', label: 'Head of Household' },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFilingStatus(status.value as any);
                      setShowFilingPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{status.label}</Text>
                    {filingStatus === status.value && (
                      <Ionicons name="checkmark" size={scale(20)} color={Colors.success} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BENEFITS</Text>
          
          {/* 401k Toggle */}
          <View style={styles.switchField}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>401k Contribution</Text>
              <Text style={styles.switchHint}>Pre-tax retirement savings</Text>
            </View>
            <Switch
              value={has401k}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHas401k(val);
              }}
              trackColor={{ false: Colors.cardBorder, true: Colors.success + '60' }}
              thumbColor={has401k ? Colors.success : Colors.textTertiary}
            />
          </View>

          {/* 401k Slider */}
          {has401k && (
            <View style={styles.sliderField}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Contribution</Text>
                <Text style={styles.sliderValue}>{contribution401k}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={15}
                step={1}
                value={contribution401k}
                onValueChange={setContribution401k}
                minimumTrackTintColor={Colors.success}
                maximumTrackTintColor={Colors.cardBorder}
                thumbTintColor={Colors.success}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMinMax}>1%</Text>
                <Text style={styles.sliderMinMax}>15%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Overtime */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OVERTIME</Text>
          
          {/* Overtime Toggle */}
          <View style={styles.switchField}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>I work overtime</Text>
              <Text style={styles.switchHint}>Hours over 40/week at higher rate</Text>
            </View>
            <Switch
              value={hasOvertime}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHasOvertime(val);
              }}
              trackColor={{ false: Colors.cardBorder, true: Colors.success + '60' }}
              thumbColor={hasOvertime ? Colors.success : Colors.textTertiary}
            />
          </View>

          {/* Overtime Multiplier Slider */}
          {hasOvertime && (
            <View style={styles.sliderField}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Overtime Rate</Text>
                <Text style={styles.sliderValue}>{overtimeMultiplier.toFixed(1)}x</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1.0}
                maximumValue={2.0}
                step={0.1}
                value={overtimeMultiplier}
                onValueChange={setOvertimeMultiplier}
                minimumTrackTintColor={Colors.success}
                maximumTrackTintColor={Colors.cardBorder}
                thumbTintColor={Colors.success}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMinMax}>1.0x</Text>
                <Text style={styles.sliderMinMax}>2.0x</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.md }]}>
        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
        />
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    fontSize: moderateScale(16),
    color: Colors.textPrimary,
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.textInverse,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pickerText: {
    fontSize: moderateScale(16),
    color: Colors.textPrimary,
  },
  pickerOptions: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    maxHeight: 250,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  pickerOptionText: {
    fontSize: moderateScale(15),
    color: Colors.textPrimary,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  switchContent: {
    flex: 1,
  },
  switchLabel: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  switchHint: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },
  sliderField: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sliderLabel: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  sliderValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.success,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.sm,
  },
  sliderMinMax: {
    fontSize: moderateScale(12),
    color: Colors.textTertiary,
  },
  actions: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.background,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  cancelText: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
  },
});
