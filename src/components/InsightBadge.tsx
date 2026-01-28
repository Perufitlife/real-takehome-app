import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';

interface InsightBadgeProps {
  text: string;
  icon?: string;
  type?: 'info' | 'success' | 'warning';
}

export const InsightBadge: React.FC<InsightBadgeProps> = ({ 
  text, 
  icon = '💡',
  type = 'info'
}) => {
  const bgColor = 
    type === 'success' ? Colors.success + '15' :
    type === 'warning' ? Colors.warning + '15' :
    Colors.info + '15';

  const textColor = 
    type === 'success' ? Colors.success :
    type === 'warning' ? Colors.warning :
    Colors.info;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  icon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  text: {
    ...Typography.small,
    fontWeight: '500',
    flex: 1,
  },
});
