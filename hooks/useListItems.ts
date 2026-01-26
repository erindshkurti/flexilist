import { db } from '@/config/firebase';
import { ListItem } from '@/types';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useListItems = (listId: string) => {
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!listId) return;

        const q = query(
            collection(db, 'lists', listId, 'items'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({
                id: doc.id,
                listId,
                ...doc.data()
            })) as ListItem[];
            setItems(itemsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching items:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [listId]);

    const addItem = async (data: Record<string, any>) => {
        const now = Date.now();
        await addDoc(collection(db, 'lists', listId, 'items'), {
            data,
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

    return { items, loading, addItem, updateItem, deleteItem };
};
