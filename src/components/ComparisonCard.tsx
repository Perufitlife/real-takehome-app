import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { NumberDisplay } from './NumberDisplay';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface ComparisonRow {
  label: string;
  values: (string | number)[];
}

interface ComparisonCardProps {
  headers: string[];
  rows: ComparisonRow[];
  winnerIndex?: number; // Index of the winning column
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({ 
  headers, 
  rows, 
  winnerIndex 
}) => {
  return (
    <Card style={styles.card}>
      {/* Headers */}
      <View style={styles.headerRow}>
        <View style={styles.labelColumn} />
        {headers.map((header, index) => (
          <View key={index} style={[
            styles.valueColumn,
            winnerIndex === index && styles.winnerColumn
          ]}>
            <Text style={[
              styles.headerText,
              winnerIndex === index && styles.winnerText
            ]}>
              {winnerIndex === index && '🏆 '}
              {header}
            </Text>
          </View>
        ))}
      </View>

      {/* Rows */}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          <View style={styles.labelColumn}>
            <Text style={styles.labelText}>{row.label}</Text>
          </View>
          {row.values.map((value, colIndex) => (
            <View key={colIndex} style={[
              styles.valueColumn,
              winnerIndex === colIndex && styles.winnerColumn
            ]}>
              {typeof value === 'number' ? (
                <NumberDisplay amount={value} size="small" />
              ) : (
                <Text style={styles.valueText}>{value}</Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.cardBorder,
  },
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  labelColumn: {
    flex: 2,
    justifyContent: 'center',
  },
  valueColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  winnerColumn: {
    backgroundColor: Colors.success + '10', // 10% opacity
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
  },
  headerText: {
    ...Typography.smallMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  winnerText: {
    color: Colors.success,
  },
  labelText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  valueText: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
