# Development Instructions for AI Agents

Welcome to the FlexiList codebase. Please follow these guidelines to maintain consistency and quality.

## 🏗 Architecture Overview
- **Framework**: React Native with **Expo (SDK 54)** and **Expo Router**.
- **Backend**: **Firebase** (Firestore and Authentication).
- **Styling**: React Native `StyleSheet`. Avoid adding new ad-hoc Tailwind configurations unless specifically requested; prefer the existing design system patterns.
- **Language**: TypeScript with strict typing.

## 🛠 Core Patterns
- **Authentication**: Always use the `useAuth` hook from `@/context/AuthContext` to access user state.
- **Data Fetching**: Use custom hooks in `@/hooks` (e.g., `useLists`, `useListItems`) for Firestore CRUD operations.
- **Navigation**: Use `expo-router` for all navigation. Prefer `router.push` and `router.replace` over traditional React Navigation actions.

## 🎨 Styling & UI Standards
- **Premium Aesthetics**: Maintain the "card-based" design with shadows, 20px+ border radii, and `expo-linear-gradient`.
- **Typography**: Use **Plus Jakarta Sans** for all headings and UI labels.
- **Layout**: Keep the `maxWidth: 800px` centering for web responsiveness in the `(tabs)/index.tsx` and detail views.

## 🔐 Security & Deployment
- **Firestore Rules**: Before making changes to data structures, verify the rules in `firestore.rules`.
- **EAS Builds**: Always push environment variables to EAS using `eas env:push --env-file .env` before starting a production build.
- **Firebase Keys**: API keys are client-side and restricted by bundle ID (`com.erindshkurti.flexilist`).

## ⚠️ Critical Rules
1. **Never** hardcode sensitive credentials.
2. **Always** include error handling in Firestore transaction logic.
3. **Verify** that new components work on both Web (browsers) and Native (iOS/Android).
