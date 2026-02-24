import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

export const useAppleAuth = () => {
    const signIn = async () => {
        try {
            // Generate a random nonce for security
            const rawNonce = Math.random().toString(36).substring(2, 10) +
                Math.random().toString(36).substring(2, 10);

            // Hash the nonce with SHA256 (Apple requires this)
            const hashedNonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                rawNonce
            );

            // Request Sign In with Apple
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });

            const { identityToken } = credential;
            if (!identityToken) {
                throw new Error('No identity token returned from Apple');
            }

            // Create Firebase credential with the Apple identity token + raw nonce
            const oAuthProvider = new OAuthProvider('apple.com');
            const firebaseCredential = oAuthProvider.credential({
                idToken: identityToken,
                rawNonce: rawNonce,
            });

            // Sign in to Firebase
            await signInWithCredential(auth, firebaseCredential);
        } catch (error: any) {
            // Don't throw if user cancelled
            if (error.code === 'ERR_REQUEST_CANCELED') {
                return;
            }
            console.error('Apple Sign-In Error:', error);
            throw error;
        }
    };

    const isAvailable = async (): Promise<boolean> => {
        try {
            return await AppleAuthentication.isAvailableAsync();
        } catch {
            return false;
        }
    };

    return { signIn, isAvailable };
};
