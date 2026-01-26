import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

interface UserPreferences {
    lastRoute?: string;
    lastVisitedAt?: number;
}

export const useUserPreferences = () => {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user preferences on mount
    useEffect(() => {
        if (!user) {
            setPreferences(null);
            setLoading(false);
            return;
        }

        const fetchPreferences = async () => {
            try {
                const docRef = doc(db, 'userPreferences', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPreferences(docSnap.data() as UserPreferences);
                } else {
                    setPreferences({});
                }
            } catch (error) {
                console.error('Error fetching user preferences:', error);
                setPreferences({});
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [user?.uid]);

    // Save the last visited route
    const saveLastRoute = useCallback(async (route: string) => {
        if (!user) return;

        try {
            const docRef = doc(db, 'userPreferences', user.uid);
            await setDoc(docRef, {
                lastRoute: route,
                lastVisitedAt: Date.now()
            }, { merge: true });

            setPreferences(prev => ({
                ...prev,
                lastRoute: route,
                lastVisitedAt: Date.now()
            }));
        } catch (error) {
            console.error('Error saving last route:', error);
        }
    }, [user?.uid]);

    // Get the last visited route
    const getLastRoute = useCallback((): string | null => {
        return preferences?.lastRoute || null;
    }, [preferences]);

    return {
        preferences,
        loading,
        saveLastRoute,
        getLastRoute
    };
};
