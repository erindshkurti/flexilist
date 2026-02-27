# Local Builds & Firebase App Distribution Guide

This guide explains how to build your FlexiList binaries on your own computer (free) and distribute them via Firebase for both iOS and Android.

## 1. Environment Setup (One-time)

### Android Requirements
To build for Android locally, you need Java (JDK) and the Android SDK.

- **Install Java (JDK 17)**:
  ```bash
  brew install openjdk@17
  ```
- **Link Android SDK**:
  Add these to your `~/.zshrc`:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

### iOS Requirements
To build for iOS locally, you need a Mac with Xcode and CocoaPods.

- **Xcode**: Install from the Mac App Store.
- **XCode Command Line Tools**:
  ```bash
  xcode-select --install
  ```
- **CocoaPods**:
  ```bash
  brew install cocoapods
  ```

---

## 2. Generate Native Code (Prebuild)

Expo projects usually hide the native folders. To build locally, you must generate them:
```bash
npx expo prebuild
```
This creates the `/ios` and `/android` directories. 
> [!IMPORTANT]
> Do not commit these folders to git if you want to keep the "Managed" Expo workflow.

---

## 3. Build the Binary Locally

There are two ways to build locally. Using **EAS Local** is recommended because it manages your signing keys for you and ensures Play Store/App Store compatibility without consuming cloud credits.

### Option A: EAS Local (Recommended)
This uses your local machine's power but EAS's credential management. **It does NOT consume EAS cloud build credits.**

**For Android (AAB):**
```bash
eas build --platform android --profile production --local --output=./android/app/build/outputs/bundle/release/app-release.aab
```

**For iOS (IPA):**
```bash
eas build --platform ios --profile production --local --output=./ios/build/FlexiList.ipa
```

---

### Option B: Manual Native Build
Use this if you want total control and don't want to use EAS at all. Note that you must manage your own keystores and signing certificates.

**For Android (APK):**
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

**For iOS (IPA):**
```bash
# Using Expo CLI to trigger the local Xcode build
npx expo run:ios --configuration Release
```
Output: A `.app` file in the build folder, which you can archive into an `.ipa` via Xcode.

---

## 4. Distribute via Firebase

Firebase App Distribution supports both `.apk` (Android) and `.ipa` or `.zip` (iOS).

1. Go to [Firebase Console](https://console.firebase.google.com/) → **App Distribution**.
2. Select your Android or iOS app from the dropdown.
3. Drag and drop your binary.
4. Add your email to a "Tester Group" to receive the install link.

---

## 5. Summary: Local vs EAS

| Feature | Local Build | EAS Build (Cloud) |
|---|---|---|
| **Cost** | **Free (Forever)** | $ (Free tier is 30 builds/mo) |
| **Requirements** | JDK/SDK/Xcode on your Mac | Zero local setup |
| **Effort** | Manual setup & management | Fully automated |

> [!TIP]
> Use **Local Builds** for your daily testing to save your EAS credits for final **Production submissions (.aab / App Store)**.
