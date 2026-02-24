import { deleteUser, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
    deleteAccount: async () => { }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const deleteAccount = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No authenticated user found.");

        try {
            // 1. Delete all user data in Firestore
            const listsQuery = query(collection(db, 'lists'), where('userId', '==', currentUser.uid));
            const listsSnapshot = await getDocs(listsQuery);

            for (const listDoc of listsSnapshot.docs) {
                // Delete all items in the list's subcollection
                const itemsSnapshot = await getDocs(collection(db, 'lists', listDoc.id, 'items'));
                for (const itemDoc of itemsSnapshot.docs) {
                    await deleteDoc(itemDoc.ref);
                }
                // Delete the list itself
                await deleteDoc(listDoc.ref);
            }

            // 2. Delete user preferences 
            await deleteDoc(doc(db, 'userPreferences', currentUser.uid));

            // 3. Delete user authentication record
            await deleteUser(currentUser);
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, deleteAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
