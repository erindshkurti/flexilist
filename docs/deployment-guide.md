# FlexiList — Deployment Hub

Choose a platform-specific guide to begin your deployment process.

### 📱 [iOS Deployment Guide](file:///Users/eshkurti/Development/Antigravity/flexilist/docs/ios-deployment-guide.md)
Complete setup for Apple App Store, TestFlight, and local IPA builds.

### 🤖 [Android Deployment Guide](file:///Users/eshkurti/Development/Antigravity/flexilist/docs/android-deployment-guide.md)
Complete setup for Google Play Store, Testing Tracks, and local signed AAB builds.

### 💻 [Web Deployment Guide](file:///Users/eshkurti/Development/Antigravity/flexilist/docs/web-deployment-guide.md)
Instructions for Firebase Hosting deployment.


## Shared Deployment Tasks (Important!)

Before deploying to **any** platform, you must ensure your environment variables are synchronized with EAS:

```bash
eas env:push --env-file .env
eas env:list --environment production
```

> [!CAUTION]
> If you skip this, your production builds will crash on launch because the Firebase SDK will have no API keys.
