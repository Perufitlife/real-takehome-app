# Build Instructions for TestFlight

## Prerequisites

1. **Apple Developer Account** ($99/year)
2. **Expo EAS Account** (free tier available)
3. **PostHog Account** (for analytics)
4. **RevenueCat Account** (for subscriptions)
5. **Node 20** (see `.nvmrc`). Node 22+ breaks EAS build; use `fnm use 20` or `nvm use 20` before building.

## Step 1: Configure API Keys

Edit `.env` file with your actual API keys:

```bash
POSTHOG_API_KEY=phc_your_actual_key
POSTHOG_HOST=https://app.posthog.com
REVENUECAT_API_KEY=appl_your_actual_key
APP_ENV=production
```

**Note:** Never commit `.env` to git. It's already in `.gitignore`.

## Step 2: Configure EAS Project

1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

This will:
- Create/update `eas.json`
- Generate a project ID
- Update `app.json` with the project ID

4. Update `app.json` with your EAS project ID:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/your-actual-project-id"
    }
  }
}
```

## Step 3: Configure RevenueCat

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a new project
3. Configure iOS app:
   - Bundle ID: `com.realtakehome.app`
   - Add App Store Connect integration
4. Create products:
   - Product ID: `com.realtakehome.app.monthly` → $4.99/month
   - Product ID: `com.realtakehome.app.annual` → $29.99/year
5. Create entitlement:
   - Entitlement ID: `full_breakdown`
   - Attach both products to this entitlement
6. Create offering:
   - Identifier: `default`
   - Packages:
     - `monthly` → points to monthly product
     - `annual` → points to annual product

## Step 4: Configure PostHog

1. Go to [PostHog](https://posthog.com)
2. Create a new project
3. Copy your Project API Key
4. Update `.env` with the key

## Step 5: Generate App Icons & Splash Screen

### Quick Option (Recommended):
Use Expo's asset generator:

1. Create a 1024x1024 PNG icon: `assets/icon.png`
2. Create a 2000x2000 PNG splash: `assets/splash.png`
3. Run:
```bash
npx expo prebuild --clean
```

### Manual Option:
Generate all required sizes:
- iOS Icon: 1024x1024
- iOS Splash: Various sizes
- Adaptive Icon (Android): 512x512

## Step 6: Build for iOS

### Development Build (for testing):
```bash
eas build --platform ios --profile development
```

### Production Build (for TestFlight):
```bash
npm run build:ios
# or: eas build --platform ios --profile production
```
*(Requires Node 20; `build:ios` checks and fails with clear instructions if using Node 22.)*

This will:
1. Upload your code to EAS servers
2. Build the app on their infrastructure
3. Generate an `.ipa` file
4. Provide a download link

**Build time:** ~10-15 minutes

## Step 7: Submit to TestFlight

### Automatic Submit (Recommended):
```bash
eas submit --platform ios --profile production
```

This will:
1. Ask for your Apple ID credentials
2. Upload the build to App Store Connect
3. Automatically process for TestFlight

### Manual Submit:
1. Download the `.ipa` from EAS dashboard
2. Use Transporter app to upload to App Store Connect
3. Wait for processing (~10-30 minutes)

## Step 8: Configure TestFlight

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app → TestFlight
3. Fill in test information:
   - What to test
   - App privacy details
4. Add internal testers (your email)
5. Enable external testing (optional)
6. Submit for review (required for external testing)

## Step 9: Over-The-Air (OTA) Updates

After your first build is live, you can push updates without rebuilding:

```bash
# Update code/assets
eas update --channel production --message "Bug fixes"
```

OTA updates work for:
- JavaScript/TypeScript changes
- React Native components
- Assets (images, fonts)

Native code changes require a new build.

## App Store Metadata

When ready to launch on App Store:

### App Information:
- **Name:** Real TakeHome
- **Subtitle:** Know your real paycheck
- **Category:** Finance
- **Price:** Free (with in-app purchases)

### Description:
```
Calculate your real take-home pay in seconds.

Perfect for hourly workers, Real TakeHome shows you exactly how much you'll earn after taxes—no guessing, no surprises.

FEATURES:
• Instant take-home pay calculator
• Federal, FICA, and state tax calculations
• Hourly, weekly, and bi-weekly breakdowns
• Overtime & extra hours tracking
• Works in all 50 states
• Monthly and yearly forecasts
• Detailed tax breakdown

NO HIDDEN COSTS:
• Free basic calculator
• Premium features: $4.99/month or $29.99/year
• Cancel anytime

Perfect for:
- Healthcare workers
- Retail employees
- Restaurant staff
- Construction workers
- Warehouse workers
- Anyone paid by the hour

Download now and know your real paycheck!

*Estimates only. Actual amounts may vary based on additional deductions and local taxes.
```

### Keywords:
```
paycheck calculator, take home pay, hourly wage, salary calculator, tax calculator, net pay, paycheck, payroll, income tax, wage calculator
```

### Screenshots:
Use the existing screenshots in `assets/` folder.

## Troubleshooting

### Build Fails:
- Check `eas-cli` version: `eas --version`
- Clear cache: `eas build --clear-cache`
- Check logs in EAS dashboard

### App Crashes on Launch:
- Verify all API keys are correct
- Check that bundle ID matches everywhere
- Test on physical device, not just simulator

### RevenueCat Not Working:
- Verify bundle ID matches exactly
- Check that products are created in App Store Connect
- Ensure entitlement ID is `full_breakdown`
- Test with sandbox account

### PostHog Events Not Showing:
- Verify API key is correct
- Check network logs
- Wait a few minutes (events can be delayed)
- Ensure you're in the right project

## Testing Checklist

Before submitting to App Store:

- [ ] All onboarding screens work
- [ ] Calculator produces correct results
- [ ] PostHog events are tracking
- [ ] RevenueCat purchase flow works (sandbox)
- [ ] Paywall shows correct prices
- [ ] Breakdown screen requires subscription
- [ ] App doesn't crash on any screen
- [ ] Works on iPhone and iPad
- [ ] Works on iOS 15+
- [ ] Privacy policy added
- [ ] Terms of service added

## Cost Breakdown

- **Apple Developer Account:** $99/year
- **Expo EAS:** Free (unlimited OTA updates, 30 builds/month)
- **PostHog:** Free tier (1M events/month)
- **RevenueCat:** Free tier (up to $10k MRR)

**Total to get started:** $99/year

## Support

- Expo Docs: https://docs.expo.dev
- RevenueCat Docs: https://docs.revenuecat.com
- PostHog Docs: https://posthog.com/docs

## Next Steps

After TestFlight:
1. Get feedback from testers
2. Fix any bugs
3. Iterate on UX
4. Add App Store screenshots
5. Submit for App Store review
6. Launch! 🚀
