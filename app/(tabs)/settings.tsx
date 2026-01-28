import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { usePayInput } from '../../src/context/PayInputContext';
import { useComparisons } from '../../src/context/ComparisonsContext';
import { trackEvent } from '../../src/lib/analytics';
import { hasFullBreakdown, restorePurchases, clearPremiumStatus, setDevForceFree } from '../../src/lib/subscriptions';
import { Card, Button } from '../../src/components';
import { Colors, Typography, Spacing, BorderRadius, formatHourly, formatCurrency, getStateName, scale, moderateScale, isTablet, MAX_CONTENT_WIDTH } from '../../src/constants/theme';

const isExpoGo = Constants.appOwnership === 'expo';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payInput = usePayInput();
  const comparisons = useComparisons();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    trackEvent('settings_viewed');
  }, []);

  const checkPremiumStatus = async () => {
    const hasPremium = await hasFullBreakdown();
    setIsPremium(hasPremium);
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent('edit_profile_clicked');
    router.push('/edit-profile');
  };

  const handleUpgradeToPremium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent('upgrade_clicked_from_settings');
    router.push('/paywall');
  };

  const handleRestorePurchases = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await restorePurchases();
      await checkPremiumStatus();
      Alert.alert('Success', 'Purchases restored successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases');
    }
  };

  const handleResetAllData = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Reset All Data',
      'This will delete ALL your data including profile and saved comparisons. You will need to complete onboarding again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            // Clear all user data
            payInput.resetInputs();
            comparisons.clearAllComparisons();
            await clearPremiumStatus(); // Clear Expo Go premium status
            await setDevForceFree(true); // Force non-premium for testing purchase flow
            trackEvent('data_reset_full');
            router.replace('/(onboarding)/info');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://workroi.app/privacy.html');
  };

  const handleTerms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://workroi.app/terms.html');
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
      <Text style={styles.title}>Settings</Text>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>YOUR PROFILE</Text>
        <Card style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileText}>
              {payInput.payType === 'hourly'
                ? `${formatHourly(payInput.hourlyRate || 0)} · ${payInput.hoursPerWeek}h/week`
                : `${formatCurrency(payInput.annualSalary || 0)}/year`
              }
            </Text>
            <Text style={styles.profileSubtext}>
              {getStateName(payInput.state || '')} · {payInput.filingStatus || 'Single'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile} activeOpacity={0.7}>
            <Text style={styles.editButtonText}>Edit</Text>
            <Ionicons name="chevron-forward" size={scale(18)} color={Colors.primary} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
        
        {isPremium || isExpoGo ? (
          <Card style={styles.premiumCard}>
            <View style={styles.premiumBadge}>
              <Ionicons name="checkmark-circle" size={scale(22)} color={Colors.success} />
              <Text style={styles.premiumText}>
                {isExpoGo ? 'Dev Mode Active' : 'Premium Active'}
              </Text>
            </View>
            {!isExpoGo && (
              <TouchableOpacity style={styles.settingRow} onPress={handleRestorePurchases} activeOpacity={0.7}>
                <Text style={styles.settingText}>Restore Purchases</Text>
                <Ionicons name="chevron-forward" size={scale(18)} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </Card>
        ) : (
          <Button
            title="Upgrade to Premium"
            onPress={handleUpgradeToPremium}
            style={styles.upgradeButton}
          />
        )}
      </View>

      {/* App Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APP</Text>
        <Card style={styles.appCard}>
          <TouchableOpacity style={styles.settingRow} onPress={handlePrivacyPolicy} activeOpacity={0.7}>
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={scale(18)} color={Colors.textTertiary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingRow} onPress={handleTerms} activeOpacity={0.7}>
            <Text style={styles.settingText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={scale(18)} color={Colors.textTertiary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Version</Text>
            <Text style={styles.versionText}>
              {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
        </Card>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleResetAllData}
          activeOpacity={0.7}
        >
          <Text style={styles.dangerButtonText}>Reset All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  profileSubtext: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.md,
  },
  editButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  premiumCard: {
    paddingVertical: Spacing.lg,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  premiumText: {
    fontSize: moderateScale(15),
    color: Colors.success,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  upgradeButton: {
    marginTop: 0,
  },
  appCard: {
    paddingVertical: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingText: {
    fontSize: moderateScale(15),
    color: Colors.textPrimary,
  },
  versionText: {
    fontSize: moderateScale(15),
    color: Colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
  },
  dangerButton: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: BorderRadius.md,
  },
  dangerButtonText: {
    fontSize: moderateScale(15),
    color: Colors.warning,
    fontWeight: '600',
  },
});
