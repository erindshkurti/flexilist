import { Button } from '@/components/Button';
import { ScreenLayout } from '@/components/ScreenLayout';
import { useLists } from '@/hooks/useLists';
import { ListField } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateListScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<ListField[]>([
        { id: '1', name: 'Name', type: 'text', required: true }
    ]);
    const { createList } = useLists();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const addField = () => {
        setFields([...fields, {
            id: Date.now().toString(),
            name: '',
            type: 'text',
            required: false
        }]);
    };

    const removeField = (id: string) => {
        if (fields.length === 1) {
            Alert.alert("Error", "You must have at least one field.");
            return;
        }
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, key: keyof ListField, value: any) => {
        setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter a list title.");
            return;
        }
        if (fields.some(f => !f.name.trim())) {
            Alert.alert("Error", "All fields must have a name.");
            return;
        }

        setLoading(true);
        try {
            await createList(title, description, fields);
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to create list.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenLayout>
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold dark:text-white">Create New List</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="mb-6 space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">List Title</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g., Grocery List"
                            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="What is this list for?"
                            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                        />
                    </View>
                </View>

                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold dark:text-white">Fields</Text>
                        <TouchableOpacity onPress={addField} className="flex-row items-center">
                            <Ionicons name="add-circle" size={20} color="#2563EB" />
                            <Text className="text-blue-600 ml-1 font-medium">Add Field</Text>
                        </TouchableOpacity>
                    </View>

                    {fields.map((field, index) => (
                        <View key={field.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-3 border border-gray-200 dark:border-gray-700">
                            <View className="flex-row justify-between items-start mb-3">
                                <Text className="text-xs font-bold text-gray-400 uppercase">Field {index + 1}</Text>
                                {fields.length > 1 && (
                                    <TouchableOpacity onPress={() => removeField(field.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View className="flex-row space-x-3">
                                <View className="flex-1">
                                    <TextInput
                                        value={field.name}
                                        onChangeText={(text) => updateField(field.id, 'name', text)}
                                        placeholder="Field Name"
                                        className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                    />
                                </View>
                                <View className="w-1/3">
                                    {/* Simple Type Selector - could be a modal or dropdown */}
                                    <View className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                        {/* For simplicity, just cycling types on tap or hardcoded for now. 
                         Ideally use a Picker or Modal. I'll implement a simple cycler for MVP. */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                const types: ListField['type'][] = ['text', 'number', 'boolean', 'date'];
                                                const currentIdx = types.indexOf(field.type);
                                                const nextType = types[(currentIdx + 1) % types.length];
                                                updateField(field.id, 'type', nextType);
                                            }}
                                            className="p-3 items-center"
                                        >
                                            <Text className="text-gray-900 dark:text-white capitalize">{field.type}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button title="Create List" onPress={handleCreate} loading={loading} />
            </View>
        </ScreenLayout>
    );
}
