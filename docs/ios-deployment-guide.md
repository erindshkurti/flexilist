# FlexiList — iOS Deployment Guide

This guide covers everything you need to build and deploy FlexiList to the Apple App Store.


## 1. One-Time Environment Setup

Your local machine must be configured once with the necessary native build tools.

### General Requirements
- **Expo Account**: Create at [expo.dev](https://expo.dev/)
- **EAS CLI**: 
  ```bash
  npm install -g eas-cli
  ```
- **Login**: 
  ```bash
  eas login
  ```

### iOS-Specific Tools (Mac Required)
- **Xcode**: Install from the Mac App Store.
- **Xcode CLI Tools**: 
  ```bash
  xcode-select --install
  ```
- **CocoaPods**: 
  ```bash
  brew install cocoapods
  ```


## 2. Configuration & Credentials

### Firebase & Environment Variables
- **Push Secrets**: 
  ```bash
  eas env:push --env-file .env
  ```
  > [!IMPORTANT]
  > The app will crash if Firebase credentials are not pushed.

### Apple Developer Account
- You must have an active **Individual Enrollment** ($99/year) at [developer.apple.com](https://developer.apple.com/).


## 3. Building the App

### The "Prebuild" Process
If you are building locally, you must first generate the native `ios` folder:
```bash
npx expo prebuild --platform ios
```

### Option A: EAS Local Build (Recommended & Free)
Builds on your computer using EAS credentials. **Does not consume EAS cloud build credits.**
```bash
npm run build:eas:ios
```
This bumps the build number, then runs `eas build --local`.

### Option B: EAS Cloud Build
Builds on Expo's servers. Useful if you don't want to manage local toolchains.
```bash
eas build --platform ios --profile production
```

### Option C: Manual Native Build
Use this if you want total control and don't want to use EAS at all. Note that you must manage your own keystores and signing certificates.

**iOS (IPA):**
```bash
# Using Expo CLI to trigger the local Xcode build
npx expo run:ios --configuration Release
```
Output: A `.app` file in the build folder, which you can archive into an `.ipa` via Xcode.


## 4. Testing & Distribution

### TestFlight (Beta Testing)
1. Submit the build:
   ```bash
   eas submit --platform ios --latest
   ```
2. Answer **Yes** if asked to generate App Store Connect API keys.
3. Manage testers in [App Store Connect](https://appstoreconnect.apple.com/) → My Apps → TestFlight.
4. **Internal Testers** get the build instantly. **External Testers** require up to 24h for Apple review.

### Firebase App Distribution (Internal Testing)
Firebase supports `.ipa` distribution for iOS (requires an Ad Hoc provisioning profile).
1. Go to [Firebase Console](https://console.firebase.google.com/) → **App Distribution**.
2. Select your iOS app.
3. Drag and drop your `.ipa` file.


## 5. Summary: Build Options Compared

| Feature | Local Build (EAS Local) | EAS Build (Cloud) | Manual CLI Build |
|---|---|---|---|
| **Cost** | **Free (Forever)** | $ (Free tier is 30 builds/mo) | **Free (Forever)** |
| **Requirements** | Xcode/Pods on your Mac | Zero local setup | Xcode/Pods on your Mac |
| **Effort** | One-time local setup | Fully automated | Manual certificate/provisioning |


## 6. Production Release

1. Go to [App Store Connect](https://appstoreconnect.apple.com/).
2. **My Apps** → **+** → **New App**.
   - Bundle ID: `com.erindshkurti.flexilist`
   - SKU: `flexilist`
3. Complete the store listing (Privacy Policy URL, Screenshots, Description).
4. Under **Build**, select your uploaded version.
5. Click **Submit for Review** (Usually takes 1–3 days).


## Troubleshooting

- **Signing Errors**: Run the following command to ensure EAS fetches the correct Distribution Profile and Certificate from Apple's servers:
  ```bash
  eas build --local
  ```
- **App Crashes**: Check your environment variables with:
  ```bash
  eas env:list
  ```
  to verify `EXPO_PUBLIC_FIREBASE_API_KEY_IOS` and `APP_ID_IOS` are set.
- **Multiple Teams**: If you belong to multiple Apple teams, select the **Individual** one when prompted by EAS.
