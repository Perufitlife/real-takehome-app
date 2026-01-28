import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, scale, BorderRadius } from '../constants/theme';

interface NumericKeypadProps {
  /** Called when a number is pressed */
  onPress: (value: string) => void;
  /** Called when backspace is pressed */
  onBackspace: () => void;
  /** Show decimal point button */
  showDecimal?: boolean;
  /** Called when decimal is pressed */
  onDecimal?: () => void;
}

export function NumericKeypad({
  onPress,
  onBackspace,
  showDecimal = false,
  onDecimal,
}: NumericKeypadProps) {
  const handlePress = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(value);
  };

  const handleBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBackspace();
  };

  const handleDecimal = () => {
    if (onDecimal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecimal();
    }
  };

  const Key = ({ value, onPressKey, isBackspace = false, isEmpty = false }: {
    value: string;
    onPressKey: () => void;
    isBackspace?: boolean;
    isEmpty?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.key,
        isBackspace && styles.keyBackspace,
        isEmpty && styles.keyEmpty,
      ]}
      onPress={isEmpty ? undefined : onPressKey}
      activeOpacity={isEmpty ? 1 : 0.6}
      disabled={isEmpty}
    >
      {isBackspace ? (
        <Ionicons name="backspace-outline" size={scale(26)} color={Colors.textPrimary} />
      ) : (
        <Text style={styles.keyText}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        <Key value="1" onPressKey={() => handlePress('1')} />
        <Key value="2" onPressKey={() => handlePress('2')} />
        <Key value="3" onPressKey={() => handlePress('3')} />
      </View>
      
      {/* Row 2 */}
      <View style={styles.row}>
        <Key value="4" onPressKey={() => handlePress('4')} />
        <Key value="5" onPressKey={() => handlePress('5')} />
        <Key value="6" onPressKey={() => handlePress('6')} />
      </View>
      
      {/* Row 3 */}
      <View style={styles.row}>
        <Key value="7" onPressKey={() => handlePress('7')} />
        <Key value="8" onPressKey={() => handlePress('8')} />
        <Key value="9" onPressKey={() => handlePress('9')} />
      </View>
      
      {/* Row 4 */}
      <View style={styles.row}>
        {showDecimal ? (
          <Key value="." onPressKey={handleDecimal} />
        ) : (
          <Key value="" onPressKey={() => {}} isEmpty />
        )}
        <Key value="0" onPressKey={() => handlePress('0')} />
        <Key value="" onPressKey={handleBackspace} isBackspace />
      </View>
    </View>
  );
}

const KEY_WIDTH = scale(72);
const KEY_HEIGHT = scale(52);
const KEY_MARGIN = scale(6);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: KEY_MARGIN,
  },
  key: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: KEY_MARGIN / 2,
  },
  keyBackspace: {
    backgroundColor: Colors.cardBorder,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: scale(24),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default NumericKeypad;
