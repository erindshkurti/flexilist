import { Button } from '@/components/Button';
import { ScreenLayout } from '@/components/ScreenLayout';
import { db } from '@/config/firebase';
import { useListItems } from '@/hooks/useListItems';
import { List, ListField } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ListDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [list, setList] = useState<List | null>(null);
    const { items, loading: itemsLoading, addItem, deleteItem, updateItem } = useListItems(id!);
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchList = async () => {
            if (!id) return;
            const docRef = doc(db, 'lists', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setList({ id: docSnap.id, ...docSnap.data() } as List);
            }
        };
        fetchList();
    }, [id]);

    const handleSaveItem = async () => {
        if (!list) return;

        // Basic validation
        const requiredFields = list.fields.filter(f => f.required);
        for (const field of requiredFields) {
            if (!currentItem[field.id]) {
                Alert.alert("Error", `${field.name} is required.`);
                return;
            }
        }

        try {
            if (editingId) {
                await updateItem(editingId, currentItem);
            } else {
                await addItem(currentItem);
            }
            setModalVisible(false);
            setCurrentItem({});
            setEditingId(null);
        } catch (error) {
            Alert.alert("Error", "Failed to save item.");
        }
    };

    const openEditModal = (item: any) => {
        setCurrentItem(item.data);
        setEditingId(item.id);
        setModalVisible(true);
    };

    const openAddModal = () => {
        setCurrentItem({});
        setEditingId(null);
        setModalVisible(true);
    };

    const renderFieldInput = (field: ListField) => {
        const value = currentItem[field.id];

        if (field.type === 'boolean') {
            return (
                <TouchableOpacity
                    onPress={() => setCurrentItem({ ...currentItem, [field.id]: !value })}
                    className={`p-3 rounded-lg border ${value ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                >
                    <Text className={`${value ? 'text-blue-700' : 'text-gray-500'}`}>
                        {value ? 'Yes' : 'No'}
                    </Text>
                </TouchableOpacity>
            );
        }

        return (
            <TextInput
                value={value?.toString() || ''}
                onChangeText={(text) => setCurrentItem({ ...currentItem, [field.id]: field.type === 'number' ? Number(text) : text })}
                placeholder={`Enter ${field.name}`}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            />
        );
    };

    if (!list) return <ScreenLayout><Text>Loading...</Text></ScreenLayout>;

    return (
        <ScreenLayout>
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold dark:text-white">{list.title}</Text>
                    {list.description && <Text className="text-gray-500">{list.description}</Text>}
                </View>
            </View>

            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => openEditModal(item)}
                        className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800 flex-row justify-between items-center"
                    >
                        <View className="flex-1">
                            {list.fields.map(field => (
                                <View key={field.id} className="mb-1">
                                    <Text className="text-xs text-gray-400">{field.name}</Text>
                                    <Text className="text-base text-gray-900 dark:text-white">
                                        {field.type === 'boolean' ? (item.data[field.id] ? 'Yes' : 'No') : item.data[field.id]}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity onPress={() => deleteItem(item.id)} className="p-2">
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                onPress={openAddModal}
                className="absolute bottom-10 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-white dark:bg-black p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold dark:text-white">{editingId ? 'Edit Item' : 'Add Item'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text className="text-blue-600 font-medium">Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        {list.fields.map(field => (
                            <View key={field.id} className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {field.name} {field.required && '*'}
                                </Text>
                                {renderFieldInput(field)}
                            </View>
                        ))}
                    </ScrollView>

                    <Button title="Save Item" onPress={handleSaveItem} />
                </View>
            </Modal>
        </ScreenLayout>
    );
}
