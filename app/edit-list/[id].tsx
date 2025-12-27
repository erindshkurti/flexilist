import { Button } from '@/components/Button';
import { db } from '@/config/firebase';
import { useLists } from '@/hooks/useLists';
import { List, ListField } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditListScreen() {
    const { id } = useLocalSearchParams();
    const { updateList } = useLists();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<ListField[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [typeDropdownVisible, setTypeDropdownVisible] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ title?: string; fields?: Record<string, string> }>({});
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchList = async () => {
            if (!id) return;

            try {
                const listDoc = await getDoc(doc(db, 'lists', id as string));
                if (listDoc.exists()) {
                    const data = listDoc.data() as List;
                    setTitle(data.title);
                    setDescription(data.description || '');
                    setFields(data.fields);
                }
            } catch (error) {
                console.error('Error fetching list:', error);
                Alert.alert('Error', 'Failed to load list');
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [id]);

    const addField = () => {
        setFields([...fields, {
            id: Date.now().toString(),
            name: '',
            type: 'text',
            required: false
        }]);
    };

    const removeField = (fieldId: string) => {
        if (fields.length === 1) {
            window.alert("You must have at least one field.");
            return;
        }
        setFields(fields.filter(f => f.id !== fieldId));
    };

    const updateField = (fieldId: string, key: keyof ListField, value: any) => {
        setFields(fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f));
    };

    const handleSave = async () => {
        const newErrors: { title?: string; fields?: Record<string, string> } = {};

        if (!title.trim()) {
            newErrors.title = "Please enter a list title";
        }

        const fieldErrors: Record<string, string> = {};
        fields.forEach((f) => {
            if (!f.name.trim()) {
                fieldErrors[f.id] = "Field name is required";
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            newErrors.fields = fieldErrors;
        }

        if (newErrors.title || newErrors.fields) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        setSaving(true);
        try {
            await updateList(id as string, title, description, fields);
            router.back();
        } catch (error) {
            console.error('Error updating list:', error);
            window.alert('Failed to update list');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

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
                        <Text style={styles.headerTitle}>Edit List</Text>
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
                        style={[styles.input, errors.title && styles.inputError]}
                    />
                    {errors.title && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                            <Text style={styles.errorText}>{errors.title}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="What is this list for?"
                        placeholderTextColor="#9ca3af"
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={3}
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
                        <View
                            key={field.id}
                            style={[
                                styles.fieldCard,
                                typeDropdownVisible === field.id && styles.fieldCardActive
                            ]}
                        >
                            <View style={styles.fieldHeader}>
                                <View style={styles.fieldLabelContainer}>
                                    <Text style={styles.fieldLabel}>Field {index + 1}</Text>
                                    {index === 0 && (
                                        <TouchableOpacity
                                            onPress={() => setInfoModalVisible(true)}
                                            style={styles.infoIcon}
                                        >
                                            <Ionicons name="information-circle" size={16} color="#3b82f6" />
                                        </TouchableOpacity>
                                    )}
                                </View>
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
                                        style={[styles.fieldInput, errors.fields?.[field.id] && styles.inputError]}
                                    />
                                    {errors.fields?.[field.id] && (
                                        <View style={styles.errorContainer}>
                                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                            <Text style={styles.errorText}>{errors.fields[field.id]}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.fieldTypeContainer}>
                                    <TouchableOpacity
                                        onPress={() => setTypeDropdownVisible(typeDropdownVisible === field.id ? null : field.id)}
                                        style={styles.typeButton}
                                    >
                                        <Text style={styles.typeText}>{field.type}</Text>
                                        <Ionicons name="chevron-down" size={16} color="#6b7280" />
                                    </TouchableOpacity>

                                    {typeDropdownVisible === field.id && (
                                        <View style={styles.typeDropdown}>
                                            {(['text', 'number', 'date'] as const).map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    onPress={() => {
                                                        updateField(field.id, 'type', type);
                                                        setTypeDropdownVisible(null);
                                                    }}
                                                    style={[
                                                        styles.typeDropdownItem,
                                                        field.type === type && styles.typeDropdownItemActive
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.typeDropdownText,
                                                        field.type === type && styles.typeDropdownTextActive
                                                    ]}>{type}</Text>
                                                    {field.type === type && (
                                                        <Ionicons name="checkmark" size={16} color="#2563EB" />
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <Modal
                visible={infoModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setInfoModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.infoModal}>
                        <View style={styles.infoModalHeader}>
                            <Ionicons name="information-circle" size={32} color="#3b82f6" />
                            <Text style={styles.infoModalTitle}>Primary Field</Text>
                        </View>
                        <Text style={styles.infoModalMessage}>
                            This field will be used as the main text for each list item. It will be displayed prominently, while other fields appear as smaller labels.
                        </Text>
                        <TouchableOpacity
                            onPress={() => setInfoModalVisible(false)}
                            style={styles.infoModalButton}
                        >
                            <Text style={styles.infoModalButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.footer}>
                <Button title="Save Changes" onPress={handleSave} loading={saving} />
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
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        gap: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
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
    },
    section: {
        marginBottom: 24,
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
    fieldCardActive: {
        zIndex: 1000,
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
    fieldLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoIcon: {
        padding: 2,
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
        position: 'relative',
    },
    typeButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 14,
        color: '#1f2937',
        textTransform: 'capitalize',
    },
    typeDropdown: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 9999,
    },
    typeDropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    typeDropdownItemActive: {
        backgroundColor: '#eff6ff',
    },
    typeDropdownText: {
        fontSize: 14,
        color: '#4b5563',
        textTransform: 'capitalize',
    },
    typeDropdownTextActive: {
        color: '#2563EB',
        fontWeight: '600',
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
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 2,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    errorText: {
        fontSize: 13,
        color: '#ef4444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    infoModal: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 10,
    },
    infoModalHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    infoModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 12,
    },
    infoModalMessage: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    infoModalButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    infoModalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
});
