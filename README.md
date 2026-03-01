# FlexiList

FlexiList is a modern, cross-platform application for flexible list management. Create custom lists with dynamic fields (text, number, date, boolean) to track anything — groceries, tasks, inventory, projects — exactly the way you want.

## Features

- **Custom List Schemas** — define exactly what fields to track per list
- **Cross-Platform** — iOS, Android, and Web
- **Secure Authentication** — Google Sign-In via Firebase Auth
- **Cloud Sync** — real-time sync with Firestore
- **Swipe Actions** — swipe to edit or delete lists and items
- **Smart Filtering** — search, sort (by date modified, date created, or alphabetical), and toggle completed items
- **Per-List Preferences** — hide-completed state persists per list
- **Modern UI** — card-based design with shadows, gradients, custom typography, and smooth interactions

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Language | TypeScript |
| Navigation | Expo Router |
| Styling | React Native StyleSheet |
| Backend | Firebase (Firestore + Auth) |
| Gestures | react-native-gesture-handler |

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
EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID_IOS=...
EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID=...
```

Get values from [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your apps.

For detailed Firebase setup instructions, see [docs/firebase-setup.md](./docs/firebase-setup.md).

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

See the [Deployment Hub](./docs/deployment-guide.md) for an overview of all platforms.

> ⚠️ Push Firebase secrets to EAS before building:
> `eas env:push --env-file .env`

### Web (Firebase Hosting)

See [docs/web-deployment-guide.md](./docs/web-deployment-guide.md) for the full setup guide.

**Quick reference:**
```bash
# Build + deploy (includes privacy policy page)
npm run deploy

# Deploy only (skip rebuild)
firebase deploy --only hosting
```

**Live URL:** https://flexilist-5a873.web.app

### iOS App Store (EAS)

See [docs/ios-deployment-guide.md](./docs/ios-deployment-guide.md) for the full step-by-step guide.

**Quick reference:**
```bash
# EAS local build (free, recommended)
npm run build:eas:ios

# EAS cloud build
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios --latest
```

### Android Google Play (EAS)

See [docs/android-deployment-guide.md](./docs/android-deployment-guide.md) for the full step-by-step guide.

**Quick reference:**
```bash
# EAS local build (free, recommended)
npm run build:eas:android

# EAS cloud build
eas build --platform android --profile production

# Submit to Google Play Console
eas submit --platform android --latest
```

**Local signed builds (no EAS):**
```bash
# APK (for direct install / Firebase App Distribution)
npm run build:apk

# AAB (for Play Store)
npm run build:android
```

## Documentation

| Document | Description |
|---|---|
| [firebase-setup.md](./docs/firebase-setup.md) | Firebase Auth setup guide |
| [deployment-guide.md](./docs/deployment-guide.md) | Deployment hub — links to all platform guides |
| [ios-deployment-guide.md](./docs/ios-deployment-guide.md) | iOS App Store deployment (EAS + local builds) |
| [android-deployment-guide.md](./docs/android-deployment-guide.md) | Google Play Store deployment (EAS + local builds) |
| [web-deployment-guide.md](./docs/web-deployment-guide.md) | Firebase Hosting deployment |
| [walkthrough.md](./docs/walkthrough.md) | Full feature walkthrough and project structure |

## Security

API keys in this project are client-side by design. Access is secured via **Firestore Security Rules** — only authenticated users can read/write their own data. Keys are restricted in Google Cloud Console to the bundle ID `com.erindshkurti.flexilist`.
