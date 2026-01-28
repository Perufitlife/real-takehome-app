import React, { ReactNode } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, isTablet, MAX_CONTENT_WIDTH, getResponsivePadding } from '../constants/theme';

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
  /** Horizontal padding (default: responsive - 24 on phone, centered on tablet) */
  horizontalPadding?: number;
  /** Whether to center content on tablets (default: true) */
  centerOnTablet?: boolean;
  /** Custom max width for tablet (default: MAX_CONTENT_WIDTH) */
  tabletMaxWidth?: number;
}

export function ScreenWrapper({
  children,
  safeTop = true,
  safeBottom = true,
  keyboardAvoiding = false,
  backgroundColor = Colors.background,
  style,
  horizontalPadding,
  centerOnTablet = true,
  tabletMaxWidth = MAX_CONTENT_WIDTH,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  // Use responsive padding if not explicitly provided
  const effectivePadding = horizontalPadding ?? (isTablet && centerOnTablet ? Spacing.xxl : Spacing.xxl);

  const outerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: safeTop ? insets.top + Spacing.md : Spacing.md,
    paddingBottom: safeBottom ? insets.bottom + Spacing.md : Spacing.md,
  };

  const innerStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: effectivePadding,
    ...(isTablet && centerOnTablet ? {
      maxWidth: tabletMaxWidth,
      width: '100%',
      alignSelf: 'center' as const,
    } : {}),
  };

  const content = (
    <View style={outerStyle}>
      <View style={[innerStyle, style]}>
        {children}
      </View>
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
