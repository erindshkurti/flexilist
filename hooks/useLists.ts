import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { List, ListField } from '@/types';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
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

        const q = query(
            collection(db, 'lists'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as List[];
            setLists(listsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching lists:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [user?.uid]); // Only re-subscribe when user ID changes

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
        await deleteDoc(doc(db, 'lists', listId));
    };

    return { lists, loading, createList, deleteList };
};
