# FlexiList — Walkthrough

FlexiList is a cross-platform list management app built with **React Native (Expo)**, **Firebase**, and **TypeScript**. It lets users create custom lists with dynamic field schemas and manage items with a polished, modern UI.

## Features

### Authentication
- **Google Sign-In** via Firebase Auth (web popup + native `@react-native-google-signin`)
- Auth context manages session state and protects all routes
- Minimal login screen with branded Google button

### Dashboard (Home Screen)
- View all lists as premium card components with shadow, rounded corners, and field tag badges
- **Search** lists by title
- **Sort** by Date Modified, Date Created, or Alphabetical
- **Swipe-to-edit** and **swipe-to-delete** on list cards (via `react-native-gesture-handler` Swipeable)
- Inline edit/delete icon buttons + chevron navigation
- Profile dropdown with user info and sign-out

### List Configuration
- Create and edit lists with a custom field schema
- Supported field types: Text, Number, Boolean, Date
- Validation enforces title and field names

### Item Management (List Detail)
- View items with their dynamic fields rendered inline
- **Custom List Schemas** — define exactly what fields to track per list
- **Cross-Platform** — iOS, Android, and Web
- **Secure Authentication** — Google Sign-In + Apple Sign-In via Firebase Auth
- **Cloud Sync** — real-time sync with Firestore
- **Offline Mode** — lists and items cached locally (AsyncStorage on native, IndexedDB on web); works without a connection
- **Swipe Actions** — swipe to edit or delete lists and items
- **Clone List** — duplicate any list (with all items) via an atomic Firestore batch write
- **Voice Input** — speak list items, titles, and field names using device speech recognition
- **Smart Filtering** — search, sort (by date modified, date created, or alphabetical), and toggle completed items
- **Per-List Preferences** — hide-completed state persists per list
- **Completed List Highlights** — fully completed lists show a green card on the home screen
- **Modern UI** — card-based design with shadows, gradients, custom typography, and smooth interactionsrners
- Custom typography via Google Fonts (Plus Jakarta Sans)
- Responsive layout — centered `maxWidth: 800px` content on desktop
- Floating Action Button (FAB) for quick item/list creation
- All dropdowns positioned relative to their trigger icons for desktop alignment
- Privacy policy page at `/privacy-policy.html`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Language | TypeScript |
| Navigation | Expo Router |
| Styling | React Native `StyleSheet` |
| Backend | Firebase (Firestore + Auth) |
| Gestures | react-native-gesture-handler |
| Fonts | @expo-google-fonts/plus-jakarta-sans |

## Project Structure

```
app/
  (tabs)/index.tsx    — Dashboard / home screen
  list/[id].tsx       — List detail / item management
  create-list.tsx     — Create new list
  edit-list/[id].tsx  — Edit existing list schema
  login.tsx           — Login screen
components/
  ListCard.tsx        — Dashboard list card component
  SwipeableItem.tsx   — Reusable swipe-to-edit/delete wrapper
config/
  firebase.ts         — Firebase initialization (Auth + Firestore)
hooks/
  useAuth.tsx         — Auth context provider
  useLists.ts         — Firestore CRUD for lists (with offline cache)
  useListItems.ts     — Firestore CRUD for list items (with offline cache)
  useOfflineCache.ts  — AsyncStorage/localStorage cache utility
  useVoiceInput.ts    — Speech recognition hook
fastlane/
  Fastfile            — Build lanes (sync_certs, build_release, release)
  Appfile             — Apple team / bundle ID config
  ExportOptions.plist — IPA export settings
  certs/              — Downloaded certificates (gitignored)
  profiles/           — Downloaded provisioning profiles (gitignored)
```

## Deployment

### Web (Firebase Hosting)
```bash
npm run deploy:web
```
This runs `expo export`, copies the privacy policy HTML, and deploys to Firebase Hosting.

**Live URL:** https://flexilist-5a873.web.app

### iOS (App Store)
```bash
# Local build via Fastlane (recommended)
npm run build:ios               # → ios/build/ipa/FlexiList.ipa
npm run deploy:ios              # build + upload to TestFlight

# EAS cloud build
eas build --platform ios --profile production
```
See [ios-deployment-guide.md](./ios-deployment-guide.md) for full instructions.

### Android (Google Play via EAS)
See [android-deployment-guide.md](./android-deployment-guide.md) for full instructions.
