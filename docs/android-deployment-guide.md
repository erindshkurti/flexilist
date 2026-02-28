# FlexiList — Android Deployment Guide

This guide covers everything you need to build and deploy FlexiList to the Google Play Store.


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

### Android-Specific Tools
- **JDK 17**: 
  ```bash
  brew install openjdk@17
  ```
- **Android SDK**: Ensure `ANDROID_HOME` is in your `~/.zshrc`:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```


## 2. Configuration & Credentials

### Firebase & Environment Variables
- **Push Secrets**: 
  ```bash
  eas env:push --env-file .env
  ```
  > [!IMPORTANT]
  > The app will crash if Firebase credentials are not pushed.

### Google Sign-In Setup
1. Get the `webClientId` from Firebase Console (Authentication → Sign-in method → Google).
2. Update `hooks/useGoogleAuth.ts` and `app.config.js`.
3. Add your local SHA-1 and the Play Store upload key to the Firebase project.

### Google Play Service Account (Automation)
1. Create a service account in Google Cloud (`eas-submit`) with **Service Account User** role.
2. Link it in Play Console under **Settings** → **API access**.
3. Grant it **Release manager** permissions.
4. Save the JSON key as `play-store-key.json` (add to `.gitignore`!) and reference it in `eas.json`.


## 3. Building the App

### The "Prebuild" Process
If you are building locally, you must first generate the native `android` folder:
```bash
npx expo prebuild --platform android
```

### Option A: EAS Local Build (Recommended & Free)
Builds on your computer using EAS credentials. **Does not consume EAS cloud build credits.**
```bash
eas build --platform android --profile production --local --output=./android/app/build/outputs/bundle/release/app-release.aab
```

### Option B: EAS Cloud Build
Builds on Expo's servers.
```bash
eas build --platform android --profile production
```

### Option C: Manual Native Build
Use this if you want total control and don't want to use EAS at all. Note that you must manage your own keystores and signing certificates.

**Android (APK):**
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

**Android (App Bundle - .aab):**
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`


## 4. Testing & Distribution

### Internal Testing (Bypass Review)
This is the fastest way to share with your team.
```bash
eas submit --platform android --latest --track internal
```

### Beta Testing (Testing Tracks)
| Track | Purpose | Review |
|---|---|---|
| **Internal** | Fast team sharing (100 testers) | **Instant** |
| **Closed** | Formal beta group | 3–7 days |

**Note**: Testers must accept the "Join on Android" link before they can download the app.

### Firebase App Distribution (Alternative)
If you want to share an APK/AAB with testers without going through the Play Store Console:
1. Go to [Firebase Console](https://console.firebase.google.com/) → **App Distribution**.
2. Select your Android app.
3. Drag and drop your `.apk` or `.aab` file via the web UI.


## 5. Summary: Build Options Compared

| Feature | Local Build (EAS Local) | EAS Build (Cloud) | Manual CLI Build |
|---|---|---|---|
| **Cost** | **Free (Forever)** | $ (Free tier is 30 builds/mo) | **Free (Forever)** |
| **Requirements** | JDK/SDK on your Mac | Zero local setup | JDK/SDK on your Mac |
| **Effort** | One-time local setup | Fully automated | Manual key management |


## 6. Production Release

1. In the [Play Console](https://play.google.com/console), go to **Production** → **Create new release**.
2. Select your build from the library or use:
   ```bash
   eas submit --platform android --latest
   ```
3. Complete the dashboard checklist (Store listing, app content, targeting).
4. Click **Review & Start rollout**.


## 7. Troubleshooting

- **Signing Key Mismatch**: Always use `eas build --local`. Manual `./gradlew` builds use local debug keys that the Play Store will reject.
- **Developer Error**: Check if your machine's SHA-1 fingerprint is added to Firebase.
