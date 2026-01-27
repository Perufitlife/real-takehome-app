# Real TakeHome

Take-home pay calculator for US hourly workers.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Add your API keys to `.env`

4. Start the app:
```bash
npm start
```

## Stack

- Expo + React Native + TypeScript
- expo-router for navigation
- PostHog for analytics
- RevenueCat for subscriptions
- Local-first (no backend)

## Scripts

- `npm start` - Start Expo dev server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
