import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { cacheKey, readCache, writeCache } from '@/hooks/useOfflineCache';
import { List, ListField } from '@/types';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useLists = () => {
    const { user } = useAuth();
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLists([]);
            setLoading(false);
            return;
        }

        // ── Seed from cache immediately so the UI renders without a spinner ──
        const key = cacheKey.lists(user.uid);
        readCache<List[]>(key).then(cached => {
            if (cached && cached.length > 0) {
                setLists(cached);
                setLoading(false);
            }
        });

        // ── Live Firestore subscription ────────────────────────────────────
        // Simple query — no composite index needed.
        // We filter archived lists client-side so existing docs without the field work too.
        const q = query(
            collection(db, 'lists'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listsData = (snapshot.docs
                .map(d => ({
                    id: d.id,
                    hasPendingWrites: d.metadata.hasPendingWrites,
                    ...d.data()
                })) as List[])
                .filter(l => !l.archived);  // hide archived from main view
            setLists(listsData);
            setLoading(false);
            // Refresh local cache with the latest server data
            writeCache(key, listsData);
        }, (error) => {
            console.error('Error fetching lists:', error);
            // Don't clear state — cached data is already shown
            setLoading(false);
        });

        return unsubscribe;
    }, [user?.uid]);

    const createList = async (title: string, description: string, fields: ListField[]) => {
        if (!user) {
            console.error('Cannot create list: No user logged in');
            throw new Error('You must be logged in to create a list');
        }

        try {
            console.log('Adding list to Firestore...');
            const docRef = await addDoc(collection(db, 'lists'), {
                userId: user.uid,
                title,
                description,
                fields,
                archived: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            console.log('List created with ID:', docRef.id);
        } catch (error) {
            console.error('Firestore error:', error);
            throw error;
        }
    };

    const deleteList = async (listId: string) => {
        try {
            console.log('Deleting list:', listId);
            await deleteDoc(doc(db, 'lists', listId));
            console.log('List deleted successfully');
        } catch (error) {
            console.error('Error deleting list:', error);
            throw error;
        }
    };

    const updateList = async (listId: string, title: string, description: string, fields: ListField[]) => {
        try {
            console.log('Updating list:', listId);
            await updateDoc(doc(db, 'lists', listId), {
                title,
                description,
                fields,
                updatedAt: Date.now()
            });
            console.log('List updated successfully');
        } catch (error) {
            console.error('Error updating list:', error);
            throw error;
        }
    };

    const archiveList = async (listId: string) => {
        try {
            await updateDoc(doc(db, 'lists', listId), {
                archived: true,
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error('Error archiving list:', error);
            throw error;
        }
    };

    const unarchiveList = async (listId: string) => {
        try {
            await updateDoc(doc(db, 'lists', listId), {
                archived: false,
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error('Error unarchiving list:', error);
            throw error;
        }
    };

    const cloneList = async (sourceList: List) => {
        if (!user) throw new Error('Must be logged in to clone a list');
        const now = Date.now();

        // 1. Create the new list document
        const newListRef = await addDoc(collection(db, 'lists'), {
            userId: user.uid,
            title: `Copy of ${sourceList.title}`,
            description: sourceList.description || '',
            fields: sourceList.fields,
            archived: false,
            createdAt: now,
            updatedAt: now,
        });

        // 2. Copy all items in a single batch
        const itemsSnap = await getDocs(
            query(collection(db, 'lists', sourceList.id, 'items'), orderBy('createdAt', 'asc'))
        );

        if (!itemsSnap.empty) {
            const batch = writeBatch(db);
            itemsSnap.docs.forEach(itemDoc => {
                const newItemRef = doc(collection(db, 'lists', newListRef.id, 'items'));
                const { id: _id, ...data } = itemDoc.data() as any;
                batch.set(newItemRef, {
                    ...data,
                    completed: false,
                    createdAt: now,
                    updatedAt: now,
                });
            });
            await batch.commit();
        }

        return newListRef.id;
    };

    return { lists, loading, createList, deleteList, updateList, archiveList, unarchiveList, cloneList };
};

export const useArchivedLists = () => {
    const { user } = useAuth();
    const [archivedLists, setArchivedLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setArchivedLists([]);
            setLoading(false);
            return;
        }

        // ── Seed from cache ────────────────────────────────────────────────
        const key = cacheKey.archivedLists(user.uid);
        readCache<List[]>(key).then(cached => {
            if (cached && cached.length > 0) {
                setArchivedLists(cached);
                setLoading(false);
            }
        });

        // Simple query, filter client-side — avoids composite index requirement
        const q = query(
            collection(db, 'lists'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listsData = (snapshot.docs
                .map(d => ({
                    id: d.id,
                    hasPendingWrites: d.metadata.hasPendingWrites,
                    ...d.data()
                })) as List[])
                .filter(l => l.archived === true)
                .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            setArchivedLists(listsData);
            setLoading(false);
            writeCache(key, listsData);
        }, (error) => {
            console.error('Error fetching archived lists:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [user?.uid]);

    return { archivedLists, loading };
};
