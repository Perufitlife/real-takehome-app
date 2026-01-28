// Design System - WorkROI
// Optimized for clarity and usability on iPhone AND iPad

import { Dimensions, Platform, PixelRatio } from 'react-native';

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base iPhone 14 Pro dimensions for scaling
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// iPad detection - more reliable than just checking dimensions
const MIN_TABLET_WIDTH = 600; // iPads start at 768 portrait, but 600+ is safe threshold
export const isTablet = SCREEN_WIDTH >= MIN_TABLET_WIDTH || 
  (Platform.OS === 'ios' && Platform.isPad);

// Maximum content width for tablets (keeps UI readable and not stretched)
export const MAX_CONTENT_WIDTH = 500; // iPhone-like max width on tablet
export const TABLET_HORIZONTAL_PADDING = Math.max(40, (SCREEN_WIDTH - MAX_CONTENT_WIDTH) / 2);

// Width percentage (0-100)
export const wp = (percentage: number): number => (percentage * SCREEN_WIDTH) / 100;

// Height percentage (0-100)
export const hp = (percentage: number): number => (percentage * SCREEN_HEIGHT) / 100;

// Effective width for content (clamped for tablets)
const EFFECTIVE_WIDTH = isTablet ? Math.min(SCREEN_WIDTH, MAX_CONTENT_WIDTH) : SCREEN_WIDTH;

// Horizontal scale (based on width) - CLAMPED for tablets
export const scale = (size: number): number => {
  const scaleFactor = EFFECTIVE_WIDTH / BASE_WIDTH;
  // On tablets, limit scaling to max 1.3x to prevent giant UI
  const maxFactor = isTablet ? 1.3 : 2;
  return Math.min(scaleFactor, maxFactor) * size;
};

// Vertical scale (based on height)
export const verticalScale = (size: number): number => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

// Moderate scale - for fonts (less aggressive scaling)
// On tablets, use even more conservative scaling
export const moderateScale = (size: number, factor = 0.5): number => {
  const tabletFactor = isTablet ? Math.min(factor, 0.3) : factor;
  return size + (scale(size) - size) * tabletFactor;
};

// Responsive value helper - returns different values for phone vs tablet
export const responsive = <T>(phoneValue: T, tabletValue: T): T => 
  isTablet ? tabletValue : phoneValue;

// Device size detection
export const isSmallDevice = SCREEN_HEIGHT < 700; // iPhone SE, iPhone 8
export const isLargeDevice = SCREEN_HEIGHT > 900; // Pro Max, iPad

// Screen dimensions export
export const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallDevice,
  isLarge: isLargeDevice,
  isTablet,
  maxContentWidth: MAX_CONTENT_WIDTH,
  tabletPadding: TABLET_HORIZONTAL_PADDING,
};

// Responsive horizontal padding for screen containers
export const getResponsivePadding = (): number => {
  if (isTablet) {
    return TABLET_HORIZONTAL_PADDING;
  }
  return 24; // Default Spacing.xxl
};

// =============================================================================
// COLORS
// =============================================================================

export const Colors = {
  // Primary
  primary: '#000000',
  background: '#FFFFFF',
  
  // Cards & Surfaces
  cardBackground: '#F5F5F5',
  cardBorder: '#E5E5E5',
  
  // Accents
  success: '#10B981',      // Green for positive money
  warning: '#EF4444',      // Red for negative money
  info: '#3B82F6',         // Blue for neutral insights
  premium: '#9333EA',      // Purple for premium features
  
  // Text
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Interactive
  buttonPrimary: '#000000',
  buttonSecondary: '#F5F5F5',
  buttonDisabled: '#E5E5E5',
  
  // Status
  lockIcon: '#999999',
  checkmark: '#10B981',
};

export const Typography = {
  // Hero (Main number - REDUCED from 40px to 32px)
  heroNumber: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
  },
  
  // Titles
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  
  // Card titles
  cardTitle: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  
  // Headings
  heading: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Body
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  
  // Small
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  
  smallMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  
  // Tiny
  tiny: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  
  // Section labels (uppercase)
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  
  // Button text
  button: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 60,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Currency formatting helper
export const formatCurrency = (amount: number, includeDecimals = false): string => {
  if (includeDecimals) {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
};

// Hourly rate formatting
export const formatHourly = (rate: number): string => {
  return `$${rate.toFixed(2)}/hr`;
};

// Percentage formatting
export const formatPercent = (percent: number, decimals = 1): string => {
  return `${percent.toFixed(decimals)}%`;
};

// Color coding for money (positive = green, negative = red)
export const getMoneyColor = (amount: number): string => {
  if (amount > 0) return Colors.success;
  if (amount < 0) return Colors.warning;
  return Colors.textPrimary;
};

// Get state name from code
export const getStateName = (code: string): string => {
  const states: Record<string, string> = {
    TX: 'Texas', FL: 'Florida', CA: 'California', NY: 'New York',
    IL: 'Illinois', PA: 'Pennsylvania', OH: 'Ohio', GA: 'Georgia',
    NC: 'North Carolina', MI: 'Michigan', MA: 'Massachusetts',
    VA: 'Virginia', NJ: 'New Jersey', NV: 'Nevada', WA: 'Washington',
    WY: 'Wyoming', SD: 'South Dakota', TN: 'Tennessee', AK: 'Alaska',
    NH: 'New Hampshire',
  };
  return states[code] || code;
};
