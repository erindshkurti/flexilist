# FlexiList

FlexiList is a modern, cross-platform mobile and web application for flexible and secure list tracking. Create custom lists with dynamic fields (text, number, date, etc.) to track *anything* — grocery lists, daily tasks, project milestones, inventory — exactly the way you want.

## Features

- **Custom List Schemas** — define exactly what data to track per list
- **Cross-Platform** — iOS, Android, and Web
- **Secure Authentication** — Google Sign-In via Firebase Auth
- **Cloud Sync** — real-time sync with Firestore
- **Modern UI/UX** — clean, minimal design with smooth animations and swipe actions
- **Smart Filtering** — search, sort, and toggle completed items

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| Styling | NativeWind (Tailwind CSS) |
| Backend | Firebase (Firestore + Auth) |

## Getting Started

### Prerequisites
- Node.js LTS
- npm

### Installation

```bash
git clone https://github.com/your-username/flexilist.git
cd flexilist
npm install
```

### Environment Setup

Create a `.env` file in the root (see `.env.example`):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_API_KEY_IOS=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID_IOS=...
```

Get values from [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your apps.

### Running Locally

```bash
# Web
npm run web

# iOS simulator (requires macOS + Xcode)
npx expo run:ios

# Android emulator
npx expo run:android
```

## Deployment

### Web (Firebase Hosting)

#### Prerequisites
- Firebase CLI installed globally:
  ```bash
  npm install -g firebase-tools
  ```
- Firebase project created and configured

#### Deploy

1. **Login to Firebase**:
   ```bash
   firebase login
   ```

2. **Build and deploy**:
   ```bash
   npm run deploy
   ```
   Builds the web app and deploys to Firebase Hosting in one step.

3. **Deploy only** (skip rebuild):
   ```bash
   firebase deploy --only hosting
   ```

#### Config Files
- `firebase.json` — hosting config (public dir, rewrites, headers)
- `.firebaserc` — Firebase project config

#### Live URL
```
https://flexilist-5a873.web.app
```

### iOS App Store (EAS)

See [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for the full step-by-step guide.

**Quick reference:**
```bash
# Build
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios --latest
```

> ⚠️ Push Firebase secrets to EAS before building:
> `eas secret:push --scope project --env-file .env`

## Security

API keys in this project are client-side by design. Access is secured via **Firestore Security Rules** — only authenticated users can read/write their own data. Keys are restricted in Google Cloud Console to the bundle ID `com.erindshkurti.flexilist`.
