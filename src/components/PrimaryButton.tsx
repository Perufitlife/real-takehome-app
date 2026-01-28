import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, scale, moderateScale, BorderRadius } from '../constants/theme';

interface PrimaryButtonProps {
  /** Button text */
  title: string;
  /** Called when pressed */
  onPress: () => void;
  /** Is button disabled */
  disabled?: boolean;
  /** Show loading indicator */
  loading?: boolean;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Additional style */
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'outline' && styles.buttonOutline,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.textInverse : Colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.buttonTextPrimary,
            variant === 'secondary' && styles.buttonTextSecondary,
            variant === 'outline' && styles.buttonTextOutline,
            isDisabled && styles.buttonTextDisabled,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.full,
    paddingVertical: scale(16),
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(54),
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.cardBackground,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: moderateScale(17),
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: Colors.textInverse,
  },
  buttonTextSecondary: {
    color: Colors.textPrimary,
  },
  buttonTextOutline: {
    color: Colors.textSecondary,
  },
  buttonTextDisabled: {
    color: Colors.textTertiary,
  },
});

export default PrimaryButton;
