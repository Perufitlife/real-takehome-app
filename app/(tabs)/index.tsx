import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { usePayInput } from '../../src/context/PayInputContext';
import { trackEvent } from '../../src/lib/analytics';
import { Colors, Spacing, BorderRadius, formatCurrency, formatHourly, getStateName, scale, moderateScale, isTablet, MAX_CONTENT_WIDTH } from '../../src/constants/theme';

const isExpoGo = Constants.appOwnership === 'expo';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();
  const payResult = payInput.calculatePay();

  useEffect(() => {
    trackEvent('dashboard_viewed', {
      has_calculation: !!payResult,
    });
  }, []);

  if (!payResult) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={scale(48)} color={Colors.textTertiary} />
        <Text style={styles.errorTitle}>Unable to load data</Text>
        <Text style={styles.errorText}>Please complete your profile first.</Text>
      </View>
    );
  }

  const handleQuickAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent('quick_action_pressed', { action });
    
    switch (action) {
      case 'overtime':
        router.push('/overtime-optimizer');
        break;
      case 'jobs':
        router.push('/job-comparison');
        break;
      case 'states':
        router.push('/state-comparison');
        break;
    }
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent('edit_profile_from_dashboard');
    router.push('/edit-profile');
  };

  const monthly = payResult.netAnnual / 12;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      {/* Responsive content wrapper for iPad */}
      <View style={styles.contentWrapper}>
        {/* Dev Mode Badge */}
        {isExpoGo && (
          <View style={styles.devBadge}>
            <Text style={styles.devBadgeText}>DEV MODE</Text>
          </View>
        )}

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>YOUR TAKE-HOME</Text>
          <Text style={styles.heroAmount}>{formatCurrency(monthly)}</Text>
          <Text style={styles.heroPeriod}>per month</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              icon="time-outline"
              label="Overtime"
              onPress={() => handleQuickAction('overtime')}
            />
            <QuickActionButton
              icon="briefcase-outline"
              label="Jobs"
              onPress={() => handleQuickAction('jobs')}
            />
            <QuickActionButton
              icon="map-outline"
              label="States"
              onPress={() => handleQuickAction('states')}
            />
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR PROFILE</Text>
          <TouchableOpacity 
            style={styles.profileCard}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <View style={styles.profileInfo}>
              <Text style={styles.profileMain}>
                {payInput.payType === 'hourly' 
                  ? `${formatHourly(payInput.hourlyRate || 0)} · ${payInput.hoursPerWeek}h/week`
                  : `${formatCurrency(payInput.annualSalary || 0)}/year`
                }
              </Text>
              <Text style={styles.profileSecondary}>
                {getStateName(payInput.state || '')} · {
                  payInput.filingStatus === 'single' ? 'Single' :
                  payInput.filingStatus === 'married' ? 'Married' : 'Head of Household'
                }
              </Text>
            </View>
            <View style={styles.editButton}>
              <Text style={styles.editText}>Edit</Text>
              <Ionicons name="chevron-forward" size={scale(18)} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

function QuickActionButton({ 
  icon, 
  label, 
  onPress 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={scale(28)} color={Colors.primary} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: isTablet ? 'center' : 'stretch',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: isTablet ? MAX_CONTENT_WIDTH : undefined,
    paddingHorizontal: Spacing.xxl,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  devBadge: {
    backgroundColor: Colors.success + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  devBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  heroLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  heroAmount: {
    fontSize: scale(52),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  heroPeriod: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
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
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xs,
  },
  quickActionIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileMain: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  profileSecondary: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  spacer: {
    flex: 1,
  },
});
