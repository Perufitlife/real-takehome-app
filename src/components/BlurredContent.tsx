import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, scale, moderateScale } from '../constants/theme';

interface BlurredContentProps {
  /** The text/amount to show blurred */
  children: React.ReactNode;
  /** Whether to show a lock icon overlay */
  showLock?: boolean;
  /** Blur intensity (1-100) */
  intensity?: number;
  /** Container style */
  style?: ViewStyle;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

export function BlurredContent({ 
  children, 
  showLock = true, 
  intensity = 20,
  style,
  size = 'medium'
}: BlurredContentProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentWrapper}>
        {children}
      </View>
      <BlurView 
        intensity={intensity} 
        style={styles.blurOverlay}
        tint="dark"
      />
      {showLock && (
        <View style={styles.lockContainer}>
          <Ionicons 
            name="lock-closed" 
            size={size === 'small' ? scale(14) : size === 'large' ? scale(24) : scale(18)} 
            color={Colors.textTertiary} 
          />
        </View>
      )}
    </View>
  );
}

interface BlurredTextProps {
  /** The text to display blurred */
  text: string;
  /** Text style */
  textStyle?: TextStyle;
  /** Whether to show lock icon */
  showLock?: boolean;
  /** Blur intensity */
  intensity?: number;
}

export function BlurredText({ 
  text, 
  textStyle,
  showLock = false,
  intensity = 15
}: BlurredTextProps) {
  return (
    <View style={styles.textContainer}>
      <Text style={[styles.blurredText, textStyle]}>{text}</Text>
      <BlurView 
        intensity={intensity} 
        style={styles.textBlurOverlay}
        tint="dark"
      />
      {showLock && (
        <View style={styles.textLockIcon}>
          <Ionicons name="lock-closed" size={scale(12)} color={Colors.textTertiary} />
        </View>
      )}
    </View>
  );
}

interface BlurredCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Whether the card is locked/blurred */
  isLocked?: boolean;
  /** Container style */
  style?: ViewStyle;
  /** Blur intensity */
  intensity?: number;
}

export function BlurredCard({ 
  children, 
  isLocked = true,
  style,
  intensity = 25
}: BlurredCardProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      {children}
      {isLocked && (
        <>
          <BlurView 
            intensity={intensity} 
            style={styles.cardBlurOverlay}
            tint="dark"
          />
          <View style={styles.cardLockOverlay}>
            <View style={styles.cardLockBadge}>
              <Ionicons name="lock-closed" size={scale(20)} color={Colors.textInverse} />
              <Text style={styles.cardLockText}>Premium</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: BorderRadius.md,
  },
  contentWrapper: {
    opacity: 0.4,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  lockContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  blurredText: {
    color: Colors.textPrimary,
    opacity: 0.3,
  },
  textBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textLockIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
  },
  cardBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
  },
  cardLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + 'E0',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  cardLockText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textInverse,
  },
});
