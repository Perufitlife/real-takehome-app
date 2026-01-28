import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, scale, moderateScale } from '../constants/theme';

interface ToolHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function ToolHeader({ title, subtitle, onClose }: ToolHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      {/* Close Button - Top Right */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={handleClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={scale(28)} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Title & Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  titleContainer: {
    // Title left aligned
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    lineHeight: scale(22),
  },
});
