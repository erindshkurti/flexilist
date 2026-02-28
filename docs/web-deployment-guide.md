# FlexiList — Web Deployment Guide

This guide covers building and deploying the web version of FlexiList using Firebase Hosting.


## 1. One-Time Setup

1. **Firebase CLI**: 
   ```bash
   npm install -g firebase-tools
   ```
2. **Login**: 
   ```bash
   firebase login
   ```
3. **Initialize Hosting** (Already done for this project):
   - `firebase.json` and `.firebaserc` should exist in your project root.


## 2. Configuration & Credentials

### Firebase Web App Registration
1. In the [Firebase Console](https://console.firebase.google.com/), register a Web App (`</>`).
2. Copy the config object values into your local `.env` file.

### Environment Variables (.env)
Ensure these are set locally for your build:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
...
```


## 3. Building & Deploying

Web deployment always happens locally.

### Step 1: Build the Static Site
```bash
npm run build
```
This generates the optimized production bundle in the `dist/` directory.

### Step 2: Deploy to Firebase Hosting
```bash
npx firebase deploy --only hosting
```

Your app will be live at: `https://flexilist-5a873.web.app`


## 4. Troubleshooting

### "Unauthorized Domain"
If Google Sign-In fails on the deployed site:
1. Go to **Authentication** → **Settings** → **Authorized domains** in Firebase Console.
2. Add your custom domain or ensure `flexilist-5a873.web.app` is listed.

### Local Development vs Production
Remember that Web uses standard Firebase SDK logic, unlike native mobile which uses `@react-native-google-signin/google-signin`. Always test sign-in flow on the deployed URL to verify production credentials.
