import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackEvent } from '../../src/lib/analytics';
import { Colors, Spacing, scale, moderateScale, wp, isSmallDevice, isTablet, MAX_CONTENT_WIDTH } from '../../src/constants/theme';
import { PrimaryButton } from '../../src/components';
import { onboardingLogo } from '../../src/assets/onboardingLogo';

// Responsive logo sizing
const LOGO_WIDTH = Math.min(wp(65), 280);
const LOGO_HEIGHT = Math.round(LOGO_WIDTH * 0.52);

export default function InfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [logoUri, setLogoUri] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('onboarding_step_viewed', { step: 'info' });
    Asset.loadAsync(onboardingLogo).then(([a]) => {
      setLogoUri(a?.localUri ?? null);
    }).catch(() => setLogoUri(null));
  }, []);

  if (!logoUri) {
    return (
      <View style={[styles.container, styles.placeholder, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <View style={styles.contentWrapper}>
        {/* Main Content - Centered */}
        <View style={styles.content}>
          {/* Logo */}
          <Image
            source={{ uri: logoUri }}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Headline */}
          <Text style={styles.headline}>See your real paycheck</Text>
          
          {/* Subtext */}
          <Text style={styles.subtext}>
            Taxes & overtime change what{'\n'}you actually take home.
          </Text>

          {/* Feature List */}
          <View style={styles.features}>
            <FeatureItem text="Salary or hourly" />
            <FeatureItem text="Overtime & extra hours" />
            <FeatureItem text="Accurate for 2026" />
          </View>

          {/* Micro Trust */}
          <Text style={styles.microTrust}>
            Takes 30 seconds · No login
          </Text>
        </View>

        {/* CTA - Fixed at Bottom */}
        <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <PrimaryButton
            title="See my paycheck →"
            onPress={() => router.push('/(onboarding)/pay-type')}
          />
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    ...(isTablet ? {
      alignItems: 'center' as const,
    } : {}),
  },
  // All content constrained for tablet
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: isTablet ? MAX_CONTENT_WIDTH : undefined,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: isTablet ? MAX_CONTENT_WIDTH : undefined,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    marginBottom: isSmallDevice ? Spacing.xl : Spacing.xxxl,
  },
  headline: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtext: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: scale(24),
    marginBottom: isSmallDevice ? Spacing.xl : Spacing.xxxl,
  },
  features: {
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  checkCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: Colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  checkIcon: {
    fontSize: scale(14),
    fontWeight: '700',
    color: Colors.success,
  },
  featureText: {
    fontSize: moderateScale(16),
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  microTrust: {
    fontSize: moderateScale(14),
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  ctaContainer: {
    paddingTop: Spacing.lg,
  },
});
