# Real TakeHome

Take-home pay calculator for US hourly workers.

Perfect for blue collar and healthcare workers who need to know their real paycheck after taxes.

## Features

- 📊 Instant take-home pay calculator
- 💰 Federal, FICA, and state tax calculations
- ⏰ Hourly, weekly, bi-weekly breakdowns
- 🏆 Overtime & extra hours tracking
- 🗺️ Works in all 50 states
- 📈 Monthly and yearly forecasts
- 🔒 Detailed breakdown (premium)

## Stack

- **Frontend:** Expo + React Native + TypeScript
- **Navigation:** expo-router (file-based routing)
- **Analytics:** PostHog
- **Subscriptions:** RevenueCat
- **Storage:** MMKV (fast local persistence)
- **Backend:** None (100% local calculations)

## Project Structure

```
real-takehome/
├── app/                          # expo-router screens
│   ├── _layout.tsx              # Root layout (PostHog init)
│   ├── index.tsx                # Home (redirects to onboarding)
│   ├── (onboarding)/            # Onboarding flow
│   │   ├── info.tsx
│   │   ├── pay-type.tsx
│   │   ├── salary.tsx / hourly.tsx
│   │   ├── hours.tsx
│   │   ├── state.tsx
│   │   └── filing.tsx
│   ├── results.tsx              # Main results screen
│   ├── breakdown-locked.tsx     # Paywall gate
│   ├── paywall.tsx              # RevenueCat purchase
│   └── breakdown-full.tsx       # Premium breakdown
├── src/
│   ├── lib/
│   │   ├── analytics.ts         # PostHog wrapper
│   │   ├── payCalculator.ts     # Tax calculation engine
│   │   └── subscriptions.ts     # RevenueCat wrapper
│   └── context/
│       └── PayInputContext.tsx  # Global state (MMKV)
├── eas.json                     # EAS Build config
└── app.json                     # Expo config
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```
POSTHOG_API_KEY=phc_xxx
REVENUECAT_API_KEY=appl_xxx
```

### 3. Run Development Server
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## Building for Production

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for complete TestFlight setup.

Quick commands:
```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios

# Push OTA update (after first build)
eas update --channel production
```

## Tax Calculation

The app calculates take-home pay using:

1. **Federal Income Tax** (2024 brackets)
   - Single, Married, Head of Household
   - Standard deductions applied

2. **FICA Taxes**
   - Social Security: 6.2% (up to $168,600)
   - Medicare: 1.45% (+ 0.9% over $200k)

3. **State Income Tax**
   - All 50 states supported
   - 9 states with no income tax

**Disclaimer:** Calculations are estimates only and do not constitute tax advice.

## Analytics Events

Key events tracked with PostHog:

- `app_opened` - App launched
- `onboarding_step_viewed` - User progresses through onboarding
- `pay_type_selected` - Salary vs Hourly choice
- `inputs_completed` - All inputs filled
- `results_viewed` - Calculator results shown
- `breakdown_cta_clicked` - User wants full breakdown
- `paywall_viewed` - Paywall shown
- `trial_started` - User purchases subscription

## Revenue Model

- **Free:** Basic take-home calculator
- **Premium:** $4.99/mo or $29.99/year
  - Detailed tax breakdown
  - Monthly/yearly forecasts
  - Overtime calculations
  - All 50 states

Target: Hourly workers earning $15-30/hr who work overtime and want to maximize their earnings.

## Scripts

- `npm start` - Start dev server
- `npm run ios` - iOS simulator
- `npm run android` - Android emulator
- `eas build` - Create production build
- `eas submit` - Submit to App Store
- `eas update` - Push OTA update

## Contributing

This is a private project. For bugs or feature requests, contact the team.

## License

Proprietary - All rights reserved

---

Built with ❤️ for hardworking Americans
