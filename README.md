# flexilist

flexilist is a modern, cross-platform mobile and web application designed for flexible and secure list tracking. It allows users to create custom lists with dynamic fields (text, number, date, etc.), ensuring that you can track *anything*—from grocery lists and daily tasks to project milestones and inventory—exactly the way you want.

## Features

*   **Custom List Schemas**: Define exactly what data you want to track for each list (e.g., "Price" as a number, "Due Date" as a date).
*   **Cross-Platform**: Runs seamlessly on iOS, Android, and the Web.
*   **Secure Authentication**: Google Sign-In integration powered by Firebase Auth.
*   **Cloud Sync**: Real-time data synchronization using Firestore.
*   **Modern UI/UX**: clean, minimal design with glassmorphism elements, gradients, and smooth interactions.
*   **Smart Filtering**: Search, sort, and toggle visibility of completed items.

## Technology Stack

*   **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
*   **Backend / Database**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
*   **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)

## Getting Started

### Prerequisites

*   Node.js (LTS recommended)
*   npm or yarn
*   Expo Go app (for mobile testing)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/flexilist.git
    cd flexilist
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory with your Firebase config:
    ```env
    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

### Running the App

*   **Web**:
    ```bash
    npm run web
    ```
*   **iOS**:
    ```bash
    npm run ios
    ```
*   **Android**:
    ```bash
    npm run android
    ```

## Security Note

This project uses Firebase for backend services. API keys are public by design. Access is secured via **Firestore Security Rules** and **App Check** (recommended for production). Ensure your Google Cloud Console keys are restricted to your specific domains and bundle identifiers (`com.erindshkurti.flexilist`).
