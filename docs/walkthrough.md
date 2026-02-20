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
- **Add / Edit / Delete** items via modal forms
- **Mark complete** with animated checkbox toggle
- **Show/Hide completed** toggle (eye icon), persisted per-list via AsyncStorage
- **Search** items by any field value
- **Sort** by Date Created or Alphabetical
- **Swipe-to-edit** and **swipe-to-delete** on individual items

### UI / UX
- Premium card-based design with shadows, gradients (`expo-linear-gradient`), and rounded corners
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
  useLists.ts         — Firestore CRUD for lists
  useListItems.ts     — Firestore CRUD for list items
```

## Deployment

### Web (Firebase Hosting)
```bash
npm run deploy
```
This runs `expo export`, copies the privacy policy HTML, and deploys to Firebase Hosting.

**Live URL:** https://flexilist-5a873.web.app

### iOS (App Store via EAS)
See [deployment-guide.md](./deployment-guide.md) for full instructions.
