# Exchange

A mobile exchange rate tracker app built with React Native and Expo.

## Technologies

- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0.20) - Development platform and tooling
- **Tamagui** (1.135.4) - UI component library
- **Firebase** - Backend services (Functions, Cloud)
- **Zustand** - State management
- **React Navigation** - Navigation library
- **TypeScript** - Type safety

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI
- EAS CLI (for builds): `npm install -g eas-cli`
- iOS: Xcode and CocoaPods (macOS only)
- Android: Android Studio and SDK

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install iOS dependencies (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Firebase configuration:**
   - Place `GoogleService-Info.plist` in `./config/firebase/` (iOS)
   - Place `google-services.json` in `./config/firebase/` (Android)

## Development

**Start Expo development server:**
```bash
npm start
```

**Run on iOS:**
```bash
npm run ios
```

**Run on Android:**
```bash
npm run android
```

## Building

**Prepare native projects:**
```bash
npm run build:prepare
```

**Build with EAS:**
```bash
# iOS local build
npm run build:ios:local

# Production builds (requires EAS account)
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Firebase Functions

**Build functions:**
```bash
npm run functions:build
```

**Deploy functions:**
```bash
npm run functions:deploy
```

**View logs:**
```bash
npm run functions:logs
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components (RubToEur, RubToUsdt, UsdtToEur)
└── store/          # Zustand state management
```

## Configuration

- **Bundle ID:** `com.aderiushev.exchange`
- **Slug:** `exchange-rates`
- **EAS Project:** `exchange`
- **New Architecture:** Enabled

