import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

interface ListPreference {
    hideCompleted?: boolean;
}

interface UserPreferences {
    lastRoute?: string;
    lastVisitedAt?: number;
    listPreferences?: Record<string, ListPreference>;
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

    // Save preference for a specific list
    const saveListPreference = useCallback(async (listId: string, pref: ListPreference) => {
        if (!user) return;

        try {
            const docRef = doc(db, 'userPreferences', user.uid);
            const newListPreferences = {
                ...(preferences?.listPreferences || {}),
                [listId]: {
                    ...(preferences?.listPreferences?.[listId] || {}),
                    ...pref
                }
            };

            await setDoc(docRef, {
                listPreferences: newListPreferences
            }, { merge: true });

            setPreferences(prev => ({
                ...prev,
                listPreferences: newListPreferences
            }));
        } catch (error) {
            console.error('Error saving list preference:', error);
        }
    }, [user?.uid, preferences?.listPreferences]);

    // Get preference for a specific list
    const getListPreference = useCallback((listId: string): ListPreference | null => {
        return preferences?.listPreferences?.[listId] || null;
    }, [preferences]);

    return {
        preferences,
        loading,
        saveLastRoute,
        getLastRoute,
        saveListPreference,
        getListPreference
    };
};
