import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { cacheKey, readCache, writeCache } from '@/hooks/useOfflineCache';
import { ListItem } from '@/types';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useListItems = (listId: string) => {
    const { user } = useAuth();
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!listId) {
            setLoading(false);
            return;
        }

        // ── Seed from cache immediately ────────────────────────────────────
        const key = cacheKey.items(listId);
        readCache<ListItem[]>(key).then(cached => {
            if (cached && cached.length > 0) {
                setItems(cached);
                setLoading(false);
            }
        });

        // ── Live Firestore subscription ────────────────────────────────────
        const q = query(
            collection(db, 'lists', listId, 'items'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsData = snapshot.docs.map(d => ({
                id: d.id,
                listId,
                ...d.data()
            })) as ListItem[];
            setItems(itemsData);
            setLoading(false);
            // Always refresh cache with the latest server snapshot
            writeCache(key, itemsData);
        }, (error) => {
            console.error('Error fetching items:', error);
            // Don't clear state — cached data remains visible offline
            setLoading(false);
        });

        return unsubscribe;
    }, [listId]);

    const addItem = async (data: Record<string, any>) => {
        if (!user) throw new Error('Must be logged in to add items');
        const now = Date.now();
        await addDoc(collection(db, 'lists', listId, 'items'), {
            data,
            userId: user.uid,
            createdAt: now,
            updatedAt: now
        });
        // Update parent list timestamp
        await updateDoc(doc(db, 'lists', listId), {
            updatedAt: now
        });
    };

    const updateItem = async (itemId: string, updates: Partial<Omit<ListItem, 'id' | 'listId' | 'createdAt'>>) => {
        const now = Date.now();
        await updateDoc(doc(db, 'lists', listId, 'items', itemId), {
            ...updates,
            updatedAt: now
        });
        // Update parent list timestamp
        await updateDoc(doc(db, 'lists', listId), {
            updatedAt: now
        });
    };

    const deleteItem = async (itemId: string) => {
        const now = Date.now();
        await deleteDoc(doc(db, 'lists', listId, 'items', itemId));
        // Update parent list timestamp
        await updateDoc(doc(db, 'lists', listId), {
            updatedAt: now
        });
    };

    const uncheckAllItems = async () => {
        const completedItems = items.filter(item => item.completed);
        if (completedItems.length === 0) return;

        const batch = writeBatch(db);
        const now = Date.now();

        completedItems.forEach(item => {
            const itemRef = doc(db, 'lists', listId, 'items', item.id);
            batch.update(itemRef, { completed: false, updatedAt: now });
        });

        // Update parent list timestamp
        const listRef = doc(db, 'lists', listId);
        batch.update(listRef, { updatedAt: now });

        await batch.commit();
    };

    return { items, loading, addItem, updateItem, deleteItem, uncheckAllItems };
};
