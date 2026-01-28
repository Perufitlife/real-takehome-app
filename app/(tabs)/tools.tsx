import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { trackEvent } from '../../src/lib/analytics';
import { useComparisons } from '../../src/context/ComparisonsContext';
import { Colors, Spacing, BorderRadius, scale, moderateScale, isTablet, MAX_CONTENT_WIDTH } from '../../src/constants/theme';

export default function ToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const comparisons = useComparisons();

  const savedCount = comparisons.jobComparisons.length + comparisons.stateComparisons.length;

  useEffect(() => {
    trackEvent('tools_tab_viewed', {
      saved_jobs: comparisons.jobComparisons.length,
      saved_states: comparisons.stateComparisons.length,
    });
  }, []);

  const handleToolPress = (tool: string, route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent('tool_selected', { tool });
    router.push(route as any);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + 100 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.title}>Your Tools</Text>
      <Text style={styles.subtitle}>Make smarter money decisions</Text>

      {/* Calculators Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CALCULATORS</Text>
        
        <ToolRow
          icon="time-outline"
          iconColor={Colors.success}
          title="Overtime Optimizer"
          subtitle="See if extra hours are worth it"
          onPress={() => handleToolPress('overtime', '/overtime-optimizer')}
        />
        
        <ToolRow
          icon="briefcase-outline"
          iconColor={Colors.info}
          title="Job Comparison"
          subtitle="Compare multiple job offers"
          onPress={() => handleToolPress('job-comparison', '/job-comparison')}
        />
        
        <ToolRow
          icon="map-outline"
          iconColor={Colors.premium}
          title="State Comparison"
          subtitle="Tax impact of moving states"
          onPress={() => handleToolPress('state-comparison', '/state-comparison')}
        />
      </View>

      {/* Your Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>YOUR DATA</Text>
        
        <ToolRow
          icon="document-text-outline"
          iconColor={Colors.textSecondary}
          title="Full Breakdown"
          subtitle="Detailed tax analysis"
          onPress={() => handleToolPress('breakdown', '/results')}
        />
        
        <ToolRow
          icon="bookmark-outline"
          iconColor={Colors.warning}
          title="Saved Comparisons"
          subtitle={savedCount > 0 ? `${savedCount} saved calculations` : 'No saved comparisons yet'}
          badge={savedCount > 0 ? String(savedCount) : undefined}
          onPress={() => handleToolPress('saved', '/saved-comparisons')}
          disabled={savedCount === 0}
        />
      </View>
    </ScrollView>
  );
}

interface ToolRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  onPress: () => void;
  disabled?: boolean;
}

function ToolRow({ icon, iconColor, title, subtitle, badge, onPress, disabled }: ToolRowProps) {
  return (
    <TouchableOpacity 
      style={[styles.toolRow, disabled && styles.toolRowDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.toolIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={scale(24)} color={iconColor} />
      </View>
      <View style={styles.toolContent}>
        <Text style={[styles.toolTitle, disabled && styles.toolTitleDisabled]}>{title}</Text>
        <Text style={styles.toolSubtitle}>{subtitle}</Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons 
        name="chevron-forward" 
        size={scale(20)} 
        color={disabled ? Colors.cardBorder : Colors.textTertiary} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xxl,
    ...(isTablet ? {
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center' as const,
      width: '100%',
    } : {}),
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
    marginBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  toolRowDisabled: {
    opacity: 0.5,
  },
  toolIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  toolTitleDisabled: {
    color: Colors.textSecondary,
  },
  toolSubtitle: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  badgeText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: Colors.textInverse,
  },
});
