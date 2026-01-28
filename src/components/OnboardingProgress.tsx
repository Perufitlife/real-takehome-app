import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, scale } from '../constants/theme';

interface OnboardingProgressProps {
  /** Current step (1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i + 1 === currentStep && styles.dotActive,
            i + 1 < currentStep && styles.dotCompleted,
          ]}
        />
      ))}
    </View>
  );
}

const DOT_SIZE = scale(8);
const DOT_SPACING = scale(6);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: DOT_SPACING / 2,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: DOT_SIZE * 2.5,
    borderRadius: DOT_SIZE / 2,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },
});

export default OnboardingProgress;
