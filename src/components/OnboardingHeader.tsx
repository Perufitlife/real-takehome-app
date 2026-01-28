import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, scale, moderateScale } from '../constants/theme';
import { OnboardingProgress } from './OnboardingProgress';

interface OnboardingHeaderProps {
  /** Current step (1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Show back button */
  showBack?: boolean;
  /** Custom back handler */
  onBack?: () => void;
}

export function OnboardingHeader({
  currentStep,
  totalSteps,
  showBack = true,
  onBack,
}: OnboardingHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={scale(24)} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Dots */}
      <View style={styles.centerSection}>
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      </View>

      {/* Right Spacer (for balance) */}
      <View style={styles.rightSection}>
        <Text style={styles.stepText}>
          {currentStep}/{totalSteps}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  leftSection: {
    width: scale(60),
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: scale(60),
    alignItems: 'flex-end',
  },
  backButton: {
    padding: Spacing.xs,
  },
  stepText: {
    fontSize: moderateScale(13),
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});

export default OnboardingHeader;
