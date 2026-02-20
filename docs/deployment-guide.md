# FlexiList — App Store Deployment Guide

## Prerequisites

| Requirement | Details |
|---|---|
| Apple Developer Account | Individual enrollment at [developer.apple.com/enroll](https://developer.apple.com/programs/enroll) — $99/year |
| Expo Account | Create free at [expo.dev/signup](https://expo.dev/signup) |
| EAS CLI | `sudo npm install -g eas-cli` |

---

## One-Time Setup

### 1. Login to EAS
```bash
eas login
```

### 2. Configure EAS project
```bash
eas build:configure --platform ios
```
- Answer **Y** when asked to create an EAS project
- This generates `eas.json`

### 3. Push environment variables to EAS
```bash
eas secret:push --scope project --env-file .env
```
> ⚠️ **Critical** — without this step, the app will crash on launch (Firebase has no credentials).

### 4. Verify secrets are set
```bash
eas env:list --environment production
```
All 8 `EXPO_PUBLIC_FIREBASE_*` variables should appear.

---

## Building

### Production Build
```bash
eas build --platform ios --profile production
```

When prompted:
- **Log in to Apple account?** → Yes
- **Apple ID** → your developer Apple ID email
- **Select Team** → choose your **Individual** personal team
- **Generate Distribution Certificate?** → Yes
- **Generate Provisioning Profile?** → Yes

Build takes ~15–25 minutes on EAS servers. You'll get a `.ipa` download link when done.

---

## Submitting to App Store Connect

```bash
eas submit --platform ios --latest
```

When prompted:
- **Generate a new App Store Connect API Key?** → **Yes** (EAS handles it automatically)

---

## App Store Connect Setup

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps → + → New App**
   - Bundle ID: `com.erindshkurti.flexilist`
   - SKU: `flexilist`
3. Fill in the listing:
   - App description, keywords, screenshots
   - Privacy policy URL (required)
4. Under **Build**, click **+** and select the uploaded build
5. Click **Submit for Review** (Apple review: 1–3 days)

---

## Subsequent Releases

For every new release:
```bash
# 1. Build
eas build --platform ios --profile production

# 2. Submit
eas submit --platform ios --latest
```

`buildNumber` auto-increments via `"autoIncrement": true` in `eas.json`.

---

## Common Issues

| Issue | Fix |
|---|---|
| App crashes on launch | Run `eas secret:push --scope project --env-file .env`, then rebuild |
| API Key prompt during submit | Always answer **Yes** to auto-generate |
| Expo Go warning during build | Harmless — ignore or set `EAS_BUILD_NO_EXPO_GO_WARNING=true` |
| Multiple Apple teams | Select the **Individual** team when prompted |
