import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { List, ListField } from '@/types';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
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

        // Simple query — no composite index needed.
        // We filter archived lists client-side so existing docs without the field work too.
        const q = query(
            collection(db, 'lists'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listsData = (snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    hasPendingWrites: doc.metadata.hasPendingWrites,
                    ...doc.data()
                })) as List[])
                .filter(l => !l.archived);  // hide archived from main view
            setLists(listsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching lists:", error);
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

    return { lists, loading, createList, deleteList, updateList, archiveList, unarchiveList };
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

        // Simple query, filter client-side — avoids composite index requirement
        const q = query(
            collection(db, 'lists'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listsData = (snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    hasPendingWrites: doc.metadata.hasPendingWrites,
                    ...doc.data()
                })) as List[])
                .filter(l => l.archived === true)
                .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            setArchivedLists(listsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching archived lists:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [user?.uid]);

    return { archivedLists, loading };
};
