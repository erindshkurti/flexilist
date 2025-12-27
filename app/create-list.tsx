import { Button } from '@/components/Button';
import { useLists } from '@/hooks/useLists';
import { ListField } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
            console.log('Creating list with:', { title, description, fields });
            await createList(title, description, fields);
            console.log('List created successfully, navigating back...');
            router.back();
        } catch (error) {
            console.error('Error creating list:', error);
            Alert.alert("Error", `Failed to create list: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ffffff', '#f9fafb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Create New List</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.label}>List Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g., Grocery List"
                        placeholderTextColor="#9ca3af"
                        style={styles.input}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="What is this list for?"
                        placeholderTextColor="#9ca3af"
                        style={styles.input}
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Fields</Text>
                        <TouchableOpacity onPress={addField} style={styles.addFieldButton}>
                            <Ionicons name="add-circle" size={20} color="#1f2937" />
                            <Text style={styles.addFieldText}>Add Field</Text>
                        </TouchableOpacity>
                    </View>

                    {fields.map((field, index) => (
                        <View key={field.id} style={styles.fieldCard}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.fieldLabel}>Field {index + 1}</Text>
                                {fields.length > 1 && (
                                    <TouchableOpacity onPress={() => removeField(field.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.fieldRow}>
                                <View style={styles.fieldNameContainer}>
                                    <TextInput
                                        value={field.name}
                                        onChangeText={(text) => updateField(field.id, 'name', text)}
                                        placeholder="Field Name"
                                        placeholderTextColor="#9ca3af"
                                        style={styles.fieldInput}
                                    />
                                </View>
                                <View style={styles.fieldTypeContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const types: ListField['type'][] = ['text', 'number', 'boolean', 'date'];
                                            const currentIdx = types.indexOf(field.type);
                                            const nextType = types[(currentIdx + 1) % types.length];
                                            updateField(field.id, 'type', nextType);
                                        }}
                                        style={styles.typeButton}
                                    >
                                        <Text style={styles.typeText}>{field.type}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Create List" onPress={handleCreate} loading={loading} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1f2937',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1f2937',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    addFieldButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addFieldText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    fieldCard: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
    },
    fieldRow: {
        flexDirection: 'row',
        gap: 12,
    },
    fieldNameContainer: {
        flex: 1,
    },
    fieldInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#1f2937',
    },
    fieldTypeContainer: {
        width: 110,
    },
    typeButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeText: {
        fontSize: 15,
        color: '#1f2937',
        textTransform: 'capitalize',
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
});
