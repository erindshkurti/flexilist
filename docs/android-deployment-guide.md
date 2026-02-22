# FlexiList — Google Play Store Deployment Guide

## Prerequisites

| Requirement | Details |
|---|---|
| Google Play Developer Account | One-time $25 fee at [play.google.com/console](https://play.google.com/console/signup) |
| Expo Account | Create free at [expo.dev/signup](https://expo.dev/signup) |
| EAS CLI | `npm install -g eas-cli` |

---

## One-Time Setup

### 1. Login to EAS
```bash
eas login
```

### 2. Push environment variables to EAS
```bash
eas env:push --env-file .env
```
> ⚠️ **Critical** — without this step, the app will crash on launch (Firebase has no credentials).

### 3. Verify secrets are set
```bash
eas env:list --environment production
```
All 8 `EXPO_PUBLIC_FIREBASE_*` variables should appear.

### 4. Configure Google Sign-In for Android

Google Sign-In on Android requires a `webClientId` (the **Web client** OAuth ID from Firebase, not the Android one).

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Authentication** → **Sign-in method** → **Google**
2. Expand the **Web SDK configuration** section
3. Copy the **Web client ID** (looks like `701865353940-xxxxxxxx.apps.googleusercontent.com`)
4. Add it to `hooks/useGoogleAuth.ts` in the `GoogleSignin.configure()` call:
   ```ts
   GoogleSignin.configure({
       iosClientId: '...',
       webClientId: '<your-web-client-id>',  // ← Add this
   });
   ```
5. Also add it to the plugin config in `app.json`:
   ```json
   ["@react-native-google-signin/google-signin", {
       "iosClientId": "...",
       "iosUrlScheme": "...",
       "webClientId": "<your-web-client-id>"
   }]
   ```

### 5. Create a Google Play Service Account (for automated submission)

This lets EAS submit builds to Play Console automatically:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **IAM & Admin** → **Service Accounts**
2. Select the Firebase project (`flexilist-5a873`)
3. **Create Service Account**:
   - Name: `eas-submit`
   - Role: **Service Account User**
4. Click the new account → **Keys** → **Add Key** → **Create new key** → JSON
5. Download the JSON file
6. In [Google Play Console](https://play.google.com/console) → **Settings** → **API access**:
   - Link the Google Cloud project
   - Grant the service account **Release manager** permission
7. Provide the JSON path when EAS prompts, or set it in `eas.json`:
   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccountKeyPath": "./play-store-key.json"
       }
     }
   }
   ```
> ⚠️ Add `play-store-key.json` to `.gitignore` — this file contains private credentials.

---

## Building

### Production Build
```bash
eas build --platform android --profile production
```

When prompted:
- **Generate a new Android Keystore?** → **Yes** (first time only — EAS stores it securely)

Build takes ~10–20 minutes on EAS servers. You'll get an `.aab` (Android App Bundle) download link when done.

---

## Submitting to Google Play

### First-time: Create the app listing

1. Go to [Google Play Console](https://play.google.com/console)
2. **Create app**:
   - App name: `FlexiList`
   - Default language: English
   - App type: App
   - Free or Paid: Free
3. Complete the **Dashboard checklist**:
   - Privacy policy URL (use `https://flexilist-5a873.web.app/privacy-policy.html`)
   - App category: Productivity
   - Content rating questionnaire
   - Target audience
   - Store listing: description, screenshots, feature graphic
4. **Create a release** in **Production** → **Create new release**
5. **Upload your first `.aab` manually** (Play Console requires the very first upload to be manual)

### After first upload: Use EAS Submit

```bash
eas submit --platform android --latest
```

This uploads the latest `.aab` from your EAS build directly to Play Console.

---

## Subsequent Releases

```bash
# 1. Build
eas build --platform android --profile production

# 2. Submit
eas submit --platform android --latest
```

`versionCode` auto-increments via `"autoIncrement": true` in `eas.json`.

---

## Store Listing Assets

| Asset | Spec |
|---|---|
| App icon | 512 × 512 PNG (no alpha) |
| Feature graphic | 1024 × 500 PNG or JPG |
| Phone screenshots | Min 2, 16:9 or 9:16, 320–3840px |
| Short description | Max 80 characters |
| Full description | Max 4000 characters |

---

## Common Issues

| Issue | Fix |
|---|---|
| App crashes on launch | Run `eas env:push --env-file .env`, then rebuild |
| Google Sign-In fails | Ensure `webClientId` is set in `GoogleSignin.configure()` |
| "App not reviewed yet" | First review takes 3–7 days; subsequent updates are faster |
| Build rejected for Play Integrity | Ensure `edgeToEdgeEnabled` and target SDK are up to date in `app.json` |
| Keystore lost | EAS manages keystores remotely — run `eas credentials` to manage |
