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
    }, [user]);

    const createList = async (title: string, description: string, fields: ListField[]) => {
        if (!user) return;

        await addDoc(collection(db, 'lists'), {
            userId: user.uid,
            title,
            description,
            fields,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    };

    const deleteList = async (listId: string) => {
        await deleteDoc(doc(db, 'lists', listId));
    };

    return { lists, loading, createList, deleteList };
};
