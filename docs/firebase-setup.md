# Firebase Authentication Setup Guide

This guide will walk you through setting up Firebase Authentication for the FlexiList application.

## Prerequisites

- A Google account
- 5-10 minutes

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or select an existing project)
3. Enter a project name (e.g., "FlexiList")
4. Click **Continue**
5. (Optional) Disable Google Analytics if you don't need it
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "FlexiList Web")
3. **Do NOT** check "Also set up Firebase Hosting"
4. Click **Register app**
5. You'll see your Firebase configuration object - **keep this page open**, you'll need these values in Step 4

## Step 3: Enable Google Authentication

1. In the left sidebar, click **Build** → **Authentication**
2. Click **Get started** (if this is your first time)
3. Click on the **Sign-in method** tab
4. Find **Google** in the list of providers
5. Click on **Google**
6. Toggle the **Enable** switch to ON
7. Select a **Project support email** from the dropdown
8. Click **Save**

## Step 4: Configure Environment Variables

1. In your project directory, create a new file called `.env` (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and fill in your Firebase credentials from Step 2:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
   EXPO_PUBLIC_FIREBASE_API_KEY_IOS=AIza...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:701865353940:web:abc123
   EXPO_PUBLIC_FIREBASE_APP_ID_IOS=1:701865353940:ios:abc123
   ```

3. **Important**: The `.env` file is already in `.gitignore` and will NOT be committed to Git

## Step 5: Restart the Development Server

1. Stop the current development server (press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   npm run web
   ```

## Step 6: Test Google Sign-In

1. Open your browser to `http://localhost:8082` (or the port shown in the terminal)
2. Click the **"Sign in with Google"** button
3. Select your Google account
4. Grant permissions
5. You should be redirected to the home screen

## Troubleshooting

### "Missing Firebase configuration" Error
- Ensure your `.env` file exists in the project root
- Check that all environment variables start with `EXPO_PUBLIC_`
- Restart the development server after creating/modifying `.env`

### Google Sign-In Popup Blocked
- Check if your browser is blocking popups
- Allow popups for `localhost`

### "Unauthorized domain" Error
- In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
- Ensure `localhost` is in the list (it should be by default)

### Environment Variables Not Loading
- Make sure the `.env` file is in the root directory (same level as `package.json`)
- Restart the development server completely
- Check that variable names match exactly (case-sensitive)

## Security Notes

- ✅ Your `.env` file is automatically ignored by Git
- ✅ Never commit Firebase credentials to version control
- ✅ The `EXPO_PUBLIC_` prefix makes these variables available in your app
- ⚠️ These variables will be visible in the client-side code (this is normal for Firebase web apps)
- ⚠️ Use Firebase Security Rules to protect your database, not environment variables

## Next Steps

Once authentication is working:
- Set up Firestore security rules in the Firebase Console
- Configure additional authentication providers if needed
- Test on mobile devices (iOS/Android)
