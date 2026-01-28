import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { PremiumBadge } from './PremiumBadge';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';

interface FeatureCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isPremium?: boolean;
  disabled?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  icon, 
  onPress,
  isPremium = false,
  disabled = false
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={styles.touchable}
    >
      <Card style={[styles.card, disabled && styles.disabledCard]}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon} 
            size={32} 
            color={disabled ? Colors.textTertiary : Colors.primary} 
          />
        </View>
        <Text style={[styles.title, disabled && styles.disabledText]}>
          {title}
        </Text>
        {isPremium && (
          <View style={styles.badge}>
            <PremiumBadge size="small" text="Pro" />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    minWidth: '47%',
    maxWidth: '48%',
    marginBottom: Spacing.lg,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    minHeight: 120,
    ...Shadows.sm,
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconContainer: {
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  disabledText: {
    color: Colors.textTertiary,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
});
