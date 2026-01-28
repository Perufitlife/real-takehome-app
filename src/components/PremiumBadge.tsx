import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';

interface PremiumBadgeProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ 
  text = 'Premium',
  size = 'medium'
}) => {
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;

  return (
    <View style={[
      styles.container,
      size === 'small' && styles.smallContainer,
      size === 'large' && styles.largeContainer
    ]}>
      <Ionicons name="lock-closed" size={iconSize} color={Colors.premium} />
      <Text style={[styles.text, { fontSize }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premium + '15',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  smallContainer: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  largeContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  text: {
    ...Typography.small,
    color: Colors.premium,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
});
