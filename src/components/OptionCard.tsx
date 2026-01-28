import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, scale, moderateScale, BorderRadius } from '../constants/theme';

interface OptionCardProps {
  /** Card title */
  title: string;
  /** Card subtitle/description */
  subtitle?: string;
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Is this option selected */
  selected?: boolean;
  /** Is this the recommended option */
  recommended?: boolean;
  /** Badge text (e.g., "Most common") */
  badge?: string;
  /** Called when pressed */
  onPress: () => void;
  /** Show chevron arrow */
  showChevron?: boolean;
  /** Additional style */
  style?: ViewStyle;
}

export function OptionCard({
  title,
  subtitle,
  icon,
  selected = false,
  recommended = false,
  badge,
  onPress,
  showChevron = true,
  style,
}: OptionCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
        recommended && !selected && styles.containerRecommended,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      {icon && (
        <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
          <Ionicons
            name={icon}
            size={scale(28)}
            color={selected ? Colors.success : Colors.primary}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>

      {/* Right side: Badge or Chevron */}
      <View style={styles.rightSection}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {selected ? (
          <Ionicons name="checkmark-circle" size={scale(24)} color={Colors.success} />
        ) : showChevron ? (
          <Ionicons name="chevron-forward" size={scale(22)} color={Colors.textTertiary} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  containerSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: Colors.success,
  },
  containerRecommended: {
    borderColor: Colors.success + '50',
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  titleSelected: {
    color: Colors.success,
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    lineHeight: scale(20),
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: Colors.success,
  },
});

export default OptionCard;
