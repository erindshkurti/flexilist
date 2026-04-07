import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration from environment variables
// These are prefixed with EXPO_PUBLIC_ to be accessible in the app
const firebaseConfig = {
    apiKey: Platform.select({
        web: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        ios: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_IOS || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        android: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    }),
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: Platform.select({
        web: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        ios: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_IOS || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        android: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    }),
};

// Singleton pattern to ensure we only initialize once
const isFirstInit = getApps().length === 0;

let app: ReturnType<typeof initializeApp>;
let authInstance: ReturnType<typeof getAuth>;

if (isFirstInit) {
    app = initializeApp(firebaseConfig);

    if (Platform.OS === 'web') {
        authInstance = getAuth(app);
    } else {
        try {
            const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
            const ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
            authInstance = initializeAuth(app, {
                persistence: getReactNativePersistence(ReactNativeAsyncStorage),
            });
        } catch (e) {
            console.warn('Firebase Auth persistence init failed:', e);
            authInstance = getAuth(app);
        }
    }
} else {
    app = getApp();
    authInstance = getAuth(app);
}

export const auth = authInstance;

// ── Firestore ────────────────────────────────────────────────────────────────
// Web: enable IndexedDB persistent cache so Firestore data survives page
//      refreshes and is readable while offline.
// Native: use plain getFirestore — the SDK queues writes automatically;
//         reads are served from the AsyncStorage cache in the data hooks.
let dbInstance: ReturnType<typeof getFirestore>;

if (Platform.OS === 'web' && isFirstInit) {
    try {
        dbInstance = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
            }),
        });
    } catch {
        // Falls back to in-memory cache (e.g. multi-tab conflict on reload)
        dbInstance = getFirestore(app);
    }
} else {
    dbInstance = getFirestore(app);
}

export const db = dbInstance;
