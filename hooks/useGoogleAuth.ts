import { GoogleSignin } from '@react-native-google-signin/google-signin';
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
                await GoogleSignin.hasPlayServices();
                const response = await GoogleSignin.signIn();
                const idToken = response.data?.idToken;
                if (!idToken) throw new Error("No ID token found");
                const googleCredential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(auth, googleCredential);
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    };

    return { signIn };
};
