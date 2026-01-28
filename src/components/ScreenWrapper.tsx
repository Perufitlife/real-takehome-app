import React, { ReactNode } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, scale } from '../constants/theme';

interface ScreenWrapperProps {
  children: ReactNode;
  /** Include safe area padding at top */
  safeTop?: boolean;
  /** Include safe area padding at bottom */
  safeBottom?: boolean;
  /** Enable keyboard avoiding behavior */
  keyboardAvoiding?: boolean;
  /** Background color override */
  backgroundColor?: string;
  /** Additional container style */
  style?: ViewStyle;
  /** Horizontal padding (default: Spacing.xxl) */
  horizontalPadding?: number;
}

export function ScreenWrapper({
  children,
  safeTop = true,
  safeBottom = true,
  keyboardAvoiding = false,
  backgroundColor = Colors.background,
  style,
  horizontalPadding = Spacing.xxl,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: safeTop ? insets.top + Spacing.md : Spacing.md,
    paddingBottom: safeBottom ? insets.bottom + Spacing.md : Spacing.md,
    paddingHorizontal: horizontalPadding,
  };

  const content = (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

export default ScreenWrapper;
