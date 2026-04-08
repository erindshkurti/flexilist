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
- **Fastlane** (for local builds):
  ```bash
  brew install fastlane
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

### Sync Local Signing Credentials (One-Time)
Pull your distribution certificate and provisioning profile from Apple and install them into your local Keychain:
```bash
fastlane sync_certs
```
This only needs to be done once (or when certificates expire in February 2027).

> [!NOTE]
> `sync_certs` talks directly to Apple Developer Portal using your Apple ID. It creates a new distribution certificate on your Mac and deposits the provisioning profile in `fastlane/profiles/`.

### Setup App Store Connect API Key (One-Time)
To upload to TestFlight automatically, you must generate an API key in App Store Connect so Fastlane can authenticate without multi-factor prompts:
1. Generate an API Key (App Manager role) at [App Store Connect → Integrations](https://appstoreconnect.apple.com/access/integrations/api).
2. Download the `.p8` file and save it to `~/Development/.appstore/AuthKey_XXXXXXXXXX.p8` (outside this codebase so it is never committed).
3. The pipeline expects to find `AuthKey_HBPJCRP52X.p8` in `~/Development/.appstore/`. If using a different key, update `key_id`, `issuer_id`, and `key_filepath` inside `fastlane/Fastfile`.
   > [!NOTE]
   > The Key ID (`HBPJCRP52X`) and Issuer ID hardcoded in the `Fastfile` are public identifiers. The only sensitive secret is the actual `.p8` file sitting safely on your local hard drive.


## 3. Building the App

### Option A: Fastlane Local Build ⭐ (Recommended)

Fully automated local build — no EAS credits, no cloud wait time.

```bash
# Build IPA only
npm run build:ios
```

Output: `ios/build/ipa/FlexiList.ipa`

```bash
# Build + upload to TestFlight in one step
npm run deploy:ios
```

**First build:** ~4 minutes (CocoaPods + compile). **Subsequent builds:** ~3 minutes (pods are cached by Xcode's DerivedData).

### Option B: EAS Local Build (Uses EAS Credentials)
Builds on your computer using EAS-managed credentials. Does **not** consume EAS cloud build credits.
```bash
npm run build:eas:ios
```
This bumps the build number, then runs `eas build --local`.

### Option C: EAS Cloud Build
Builds on Expo's servers. Useful as a fallback if local builds break.
```bash
eas build --platform ios --profile production
```

### Option D: Manual Xcode CLI (Advanced)
```bash
npx expo run:ios --configuration Release
```
Requires signing to be manually configured in Xcode → Signing & Capabilities.


## 4. Testing & Distribution

### TestFlight (Beta Testing) — via Fastlane
```bash
npm run deploy:ios
```
This builds the IPA and uploads it to TestFlight automatically.

### TestFlight — via EAS Submit (if you have an existing IPA)
```bash
eas submit --platform ios --latest
```

### Manual Upload via Altool CLI
```bash
xcrun altool --upload-app \
  --type ios \
  --file ios/build/ipa/FlexiList.ipa \
  --apiKey <ASC_KEY_ID> \
  --apiIssuer <ASC_ISSUER_ID>
```

### Firebase App Distribution (Internal Testing)
Firebase supports `.ipa` distribution for iOS (requires an Ad Hoc provisioning profile).
1. Go to [Firebase Console](https://console.firebase.google.com/) → **App Distribution**.
2. Select your iOS app.
3. Drag and drop your `.ipa` file.


## 5. Summary: Build Options Compared

| Feature | Fastlane Local | EAS Local | EAS Cloud |
|---|---|---|---|
| **Cost** | **Free (Forever)** | **Free (Forever)** | $ (30 builds/mo free) |
| **Speed** | ~4 min | ~5 min | ~10–20 min |
| **Cert management** | Local Keychain (yours) | EAS-managed | EAS-managed |
| **Requirements** | Xcode + Fastlane | Xcode + EAS CLI | Zero local setup |
| **TestFlight upload** | `npm run deploy:ios` (built-in) | `eas submit` | `eas submit` |


## 6. Production Release (App Store Connect)

Follow these steps to release your build (or an update) to the public:

1. **Create/Select Version**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com/) → **My Apps** → **FlexiList**.
   - **For Updates**: Click the **+** button next to **iOS App** in the left sidebar and enter the new version number (e.g., 1.1.0).
   - **For first release**: Click the existing version marked **Prepare for Submission** (e.g., 1.0.0).
2. **What's New**: Complete the **What's New in This Version** section describing your changes (e.g., "Added voice search").
3. **Link Build**: Scroll down to the **Build** section and click **Select a build before you submit**.
   - Choose the desired build from your TestFlight history.
   - Click **Done**.
4. **Metadata**: 
   - Review and update **Screenshots** if the UI has changed significantly.
   - Ensure the **App Privacy** section is still accurate.
5. **Submit**: Click **Add for Review** in the top right corner.
   - Apple's review team usually takes **1–2 business days** to approve the app.


## Troubleshooting

- **Signing Errors**: Re-run `fastlane sync_certs` to refresh your local certificate and provisioning profile.
- **Scheme Not Found**: The Xcode scheme must be `FlexiList` (capital F and L), which is set in `fastlane/Fastfile`.
- **App Crashes**: Check your environment variables with:
  ```bash
  eas env:list
  ```
  to verify `EXPO_PUBLIC_FIREBASE_API_KEY_IOS` and `APP_ID_IOS` are set.
- **Multiple Teams**: If you belong to multiple Apple teams, select the **Individual** one when prompted.
- **Certificate Limit**: Apple allows 3 distribution certificates. You currently have 2 (EAS + local). If you hit the limit, revoke the oldest one in [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list).
