import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography, formatCurrency, getMoneyColor } from '../constants/theme';

interface NumberDisplayProps {
  amount: number;
  size?: 'small' | 'medium' | 'large' | 'hero';
  colorCode?: boolean; // Green for positive, red for negative
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
}

export const NumberDisplay: React.FC<NumberDisplayProps> = ({ 
  amount, 
  size = 'medium',
  colorCode = false,
  prefix = '',
  suffix = '',
  style 
}) => {
  const textStyle = [
    size === 'small' && styles.small,
    size === 'medium' && styles.medium,
    size === 'large' && styles.large,
    size === 'hero' && styles.hero,
    colorCode && { color: getMoneyColor(amount) },
    style,
  ];

  const displayValue = formatCurrency(Math.abs(amount));
  const sign = amount < 0 ? '-' : (amount > 0 && colorCode ? '+' : '');

  return (
    <Text style={textStyle}>
      {prefix}{sign}{displayValue}{suffix}
    </Text>
  );
};

const styles = StyleSheet.create({
  small: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  medium: {
    ...Typography.cardTitle,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  large: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hero: {
    ...Typography.heroNumber,
    color: Colors.textPrimary,
  },
});
