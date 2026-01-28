import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Screen, MAX_CONTENT_WIDTH, isTablet, getResponsivePadding } from '../constants/theme';

interface ResponsiveContainerProps {
  children: ReactNode;
  /** Additional style to apply to the container */
  style?: ViewStyle;
  /** Whether to center content horizontally (default: true on tablet) */
  center?: boolean;
  /** Custom max width override */
  maxWidth?: number;
  /** Whether to use full width (no max width constraint) */
  fullWidth?: boolean;
}

/**
 * ResponsiveContainer - Centers content and constrains max width on tablets
 * 
 * On iPhone: No effect, children render normally
 * On iPad: Centers content with max width to prevent stretched UI
 * 
 * Use this wrapper around your main content to make it tablet-friendly.
 */
export function ResponsiveContainer({
  children,
  style,
  center = true,
  maxWidth = MAX_CONTENT_WIDTH,
  fullWidth = false,
}: ResponsiveContainerProps) {
  // On phones or if fullWidth is requested, just render children
  if (!isTablet || fullWidth) {
    return <View style={[styles.phoneContainer, style]}>{children}</View>;
  }

  // On tablets, constrain width and optionally center
  return (
    <View style={[styles.tabletOuter, center && styles.tabletCenter]}>
      <View style={[styles.tabletInner, { maxWidth }, style]}>
        {children}
      </View>
    </View>
  );
}

/**
 * Hook to get responsive padding values
 * Returns appropriate horizontal padding for current device
 */
export function useResponsivePadding() {
  return {
    paddingHorizontal: getResponsivePadding(),
    isTablet,
    maxContentWidth: MAX_CONTENT_WIDTH,
  };
}

const styles = StyleSheet.create({
  phoneContainer: {
    flex: 1,
  },
  tabletOuter: {
    flex: 1,
    width: '100%',
  },
  tabletCenter: {
    alignItems: 'center',
  },
  tabletInner: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
  },
});

export default ResponsiveContainer;
