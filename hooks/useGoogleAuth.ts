import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';

export const useGoogleAuth = () => {
    const signIn = async () => {
        try {
            if (Platform.OS === 'web') {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            } else {
                // We rely on the native module import and Error catching below 
                // to determine if the environment supports Google Sign-In, 
                // because Constants.appOwnership can be unreliable when connecting 
                // native dev clients to a local bundler.

                try {
                    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                    GoogleSignin.configure({
                        iosClientId: '701865353940-j58jlccnedr3os4cv2du46jleratvh56.apps.googleusercontent.com',
                        webClientId: '701865353940-0i3bkuu0j8p3qr1mbnok35vikq4ngjck.apps.googleusercontent.com',
                    });
                    await GoogleSignin.hasPlayServices();
                    const response = await GoogleSignin.signIn();
                    console.log("[DEBUG] Raw GoogleSignin Response:", JSON.stringify(response, null, 2));

                    if (response.type === 'cancelled') {
                        return; // User intentionally cancelled the login flow, don't show an error
                    }

                    const idToken = response.data?.idToken || response.idToken;

                    if (!idToken) throw new Error("No ID token found");
                    const googleCredential = GoogleAuthProvider.credential(idToken);
                    await signInWithCredential(auth, googleCredential);
                } catch (error: any) {
                    if (error.message.includes('RNGoogleSignin') || error.code === 'Invariant Violation') {
                        throw new Error("Google Sign-In native module not found. Please ensure you are running a development build.");
                    }
                    throw error;
                }
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    };

    return { signIn };
};
