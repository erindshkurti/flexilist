import { Button } from '@/components/Button';
import { db } from '@/config/firebase';
import { useListItems } from '@/hooks/useListItems';
import { List, ListField } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ListDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [list, setList] = useState<List | null>(null);
    const { items, loading: itemsLoading, addItem, deleteItem, updateItem } = useListItems(id!);
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<Record<string, any>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [datePickerField, setDatePickerField] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState(new Date());
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
    const [sortMenuVisible, setSortMenuVisible] = useState(false);

    const [showCompleted, setShowCompleted] = useState(true);

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

        const errors: Record<string, string> = {};

        // First field is always required
        if (list.fields.length > 0) {
            const firstField = list.fields[0];
            if (!currentItem[firstField.id] || currentItem[firstField.id].toString().trim() === '') {
                errors[firstField.id] = `${firstField.name} is required`;
            }
        }

        // Check other required fields
        list.fields.slice(1).forEach(field => {
            if (field.required && (!currentItem[field.id] || currentItem[field.id].toString().trim() === '')) {
                errors[field.id] = `${field.name} is required`;
            }
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            if (editingId) {
                await updateItem(editingId, { data: currentItem });
            } else {
                await addItem(currentItem);
            }
            setModalVisible(false);
            setCurrentItem({});
            setEditingId(null);
            setFieldErrors({});
        } catch (error) {
            Alert.alert("Error", "Failed to save item.");
        }
    };

    const toggleComplete = async (itemId: string, currentCompleted: boolean) => {
        try {
            await updateItem(itemId, { completed: !currentCompleted });
        } catch (error) {
            console.error('Error toggling item completion:', error);
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
        setFieldErrors({});
        setModalVisible(true);
    };


    const renderFieldInput = (field: ListField) => {
        const value = currentItem[field.id];
        const hasNumberError = field.type === 'number' && value && !/^\d*\.?\d*$/.test(value.toString());

        if (field.type === 'date') {
            return (
                <>
                    <TouchableOpacity
                        onPress={() => {
                            setDatePickerField(field.id);
                            if (value) {
                                const dateParts = value.split('-');
                                if (dateParts.length === 3) {
                                    setTempDate(new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
                                }
                            }
                            setDatePickerVisible(true);
                        }}
                        style={styles.dateInput}
                    >
                        <Text style={value ? styles.dateText : styles.datePlaceholder}>
                            {value || 'YYYY-MM-DD'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    </TouchableOpacity>
                </>
            );
        }

        return (
            <>
                <TextInput
                    value={value?.toString() || ''}
                    onChangeText={(text) => {
                        setCurrentItem({ ...currentItem, [field.id]: text });
                    }}
                    placeholder={`Enter ${field.name}`}
                    placeholderTextColor="#9ca3af"
                    keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                    style={styles.input}
                />
                {field.type === 'number' && value && value !== '' && !/^\d*\.?\d*$/.test(value.toString()) && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={styles.errorText}>Only numbers are allowed</Text>
                    </View>
                )}
            </>
        );
    };

    if (!list) return (
        <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
        </View>
    );

    // Filter and sort items
    const firstFieldId = list.fields[0]?.id;
    const filteredAndSortedItems = items
        .filter(item => {
            // Hide completed items if toggle is off
            if (!showCompleted && item.completed) return false;

            if (!search || !firstFieldId) return true;
            const value = item.data[firstFieldId]?.toString().toLowerCase() || '';
            return value.includes(search.toLowerCase());
        })
        .sort((a, b) => {
            if (sortBy === 'name' && firstFieldId) {
                const aValue = a.data[firstFieldId]?.toString().toLowerCase() || '';
                const bValue = b.data[firstFieldId]?.toString().toLowerCase() || '';
                return aValue.localeCompare(bValue);
            } else {
                return b.createdAt - a.createdAt;
            }
        });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
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
                        <View>
                            <Text style={styles.headerTitle}>{list.title}</Text>
                            {!!list.description && <Text style={styles.headerDescription}>{list.description}</Text>}
                        </View>
                    </View>

                    {/* Search and Sort Bar */}
                    <View style={styles.searchSortContainer}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#9ca3af" />
                            <TextInput
                                placeholder="Search items..."
                                value={search}
                                onChangeText={setSearch}
                                style={styles.searchInput}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowCompleted(!showCompleted)}
                            style={styles.sortButton}
                            activeOpacity={0.7}
                            {...(Platform.OS === 'web' ? { title: showCompleted ? "Hide Completed Items" : "Show Completed Items" } as any : {})}
                        >
                            <Ionicons
                                name={showCompleted ? "eye-outline" : "eye-off-outline"}
                                size={24}
                                color="#1f2937"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSortMenuVisible(!sortMenuVisible)}
                            style={styles.sortButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="options-outline" size={24} color="#1f2937" />
                        </TouchableOpacity>
                    </View>

                </View>
            </LinearGradient>

            <FlatList
                data={filteredAndSortedItems}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={[styles.itemCard, item.completed && styles.itemCardCompleted]}>
                        <TouchableOpacity
                            onPress={() => toggleComplete(item.id, item.completed || false)}
                            style={styles.checkbox}
                        >
                            <Ionicons
                                name={item.completed ? "checkbox" : "square-outline"}
                                size={24}
                                color={item.completed ? "#10b981" : "#9ca3af"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => openEditModal(item)}
                            style={styles.itemContent}
                        >
                            {list.fields.length > 0 && (
                                <View style={styles.itemRow}>
                                    {/* First field as main text */}
                                    <Text style={[styles.itemMainText, item.completed && styles.itemMainTextCompleted]}>
                                        {list.fields[0].type === 'date'
                                            ? (item.data[list.fields[0].id] || 'No date')
                                            : item.data[list.fields[0].id] || 'Untitled'}
                                    </Text>

                                    {/* Remaining fields as labels */}
                                    {list.fields.length > 1 && list.fields.slice(1).map(field => (
                                        item.data[field.id] && (
                                            <View key={field.id} style={styles.labelChip}>
                                                <Text style={[styles.labelText, item.completed && styles.labelTextCompleted]}>
                                                    {field.name}: {item.data[field.id]}
                                                </Text>
                                            </View>
                                        )
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {sortMenuVisible && (
                <View style={styles.sortDropdownOverlay}>
                    <View style={styles.sortDropdown}>
                        <Text style={styles.dropdownTitle}>Sort by</Text>

                        <TouchableOpacity
                            style={[styles.dropdownItem, sortBy === 'date' && styles.dropdownItemActive]}
                            onPress={() => {
                                setSortBy('date');
                                setSortMenuVisible(false);
                            }}
                        >
                            <Ionicons name="time-outline" size={20} color={sortBy === 'date' ? '#2563EB' : '#4b5563'} />
                            <Text style={[styles.dropdownText, sortBy === 'date' && styles.dropdownTextActive]}>Date Created</Text>
                            {sortBy === 'date' && <Ionicons name="checkmark" size={16} color="#2563EB" style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dropdownItem, sortBy === 'name' && styles.dropdownItemActive]}
                            onPress={() => {
                                setSortBy('name');
                                setSortMenuVisible(false);
                            }}
                        >
                            <Ionicons name="text-outline" size={20} color={sortBy === 'name' ? '#2563EB' : '#4b5563'} />
                            <Text style={[styles.dropdownText, sortBy === 'name' && styles.dropdownTextActive]}>Alphabetical</Text>
                            {sortBy === 'name' && <Ionicons name="checkmark" size={16} color="#2563EB" style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <TouchableOpacity
                onPress={openAddModal}
                style={styles.fab}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit Item' : 'Add Item'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {list.fields.map((field, index) => (
                            <View key={field.id} style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {field.name}{(index === 0 || field.required) && ' *'}
                                </Text>
                                {renderFieldInput(field)}
                                {fieldErrors[field.id] && (
                                    <View style={styles.errorContainer}>
                                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                        <Text style={styles.errorText}>{fieldErrors[field.id]}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <Button title="Save Item" onPress={handleSaveItem} />
                    </View>
                </View>
            </Modal>

            {/* Date Picker Modal */}
            {datePickerVisible && (
                Platform.OS === 'web' ? (
                    <Modal
                        visible={datePickerVisible}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setDatePickerVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.datePickerModal}>
                                <Text style={styles.datePickerTitle}>Select Date</Text>
                                <input
                                    type="date"
                                    value={tempDate.toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        if (!isNaN(date.getTime())) {
                                            setTempDate(date);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: 16,
                                        fontSize: 16,
                                        borderRadius: 12,
                                        border: '1px solid #e5e7eb',
                                        marginBottom: 24,
                                    }}
                                />
                                <View style={styles.datePickerButtons}>
                                    <TouchableOpacity
                                        onPress={() => setDatePickerVisible(false)}
                                        style={[styles.datePickerButton, styles.datePickerCancelButton]}
                                    >
                                        <Text style={styles.datePickerCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (datePickerField) {
                                                const formattedDate = tempDate.toISOString().split('T')[0];
                                                setCurrentItem({ ...currentItem, [datePickerField]: formattedDate });
                                            }
                                            setDatePickerVisible(false);
                                        }}
                                        style={[styles.datePickerButton, styles.datePickerConfirmButton]}
                                    >
                                        <Text style={styles.datePickerConfirmText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === 'set' && selectedDate && datePickerField) {
                                const formattedDate = selectedDate.toISOString().split('T')[0];
                                setCurrentItem({ ...currentItem, [datePickerField]: formattedDate });
                            }
                            setDatePickerVisible(false);
                        }}
                    />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    searchSortContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 32,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 0,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        paddingVertical: 14,
        paddingHorizontal: 6,
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    sortButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortDropdown: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 8,
        width: 200,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowOpacity: 0,
        elevation: 0,
    },
    sortDropdownOverlay: {
        position: 'absolute',
        top: 120,
        right: 20,
        zIndex: 2000,
    },
    dropdownTitle: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#9ca3af',
        paddingHorizontal: 12,
        paddingVertical: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },
    dropdownItemActive: {
        backgroundColor: '#eff6ff',
    },
    dropdownText: {
        fontSize: 16,
        color: '#4b5563',
        fontWeight: '500',
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    dropdownTextActive: {
        color: '#2563EB',
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        color: '#1f2937',
    },
    headerDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    listContent: {
        padding: 20,
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
        paddingBottom: 100, // Space for FAB
    },
    itemCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemCardCompleted: {
        backgroundColor: '#f3f4f6',
        opacity: 0.7,
    },
    checkbox: {
        marginRight: 12,
        padding: 4,
    },
    itemContent: {
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },
    itemMainText: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#1f2937',
    },
    itemMainTextCompleted: {
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    labelChip: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    labelText: {
        fontSize: 12,
        color: '#6b7280',
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    labelTextCompleted: {
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    fieldRow: {
        marginBottom: 4,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldLabelCompleted: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#d1d5db',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textDecorationLine: 'line-through',
    },
    fieldValue: {
        fontSize: 16,
        color: '#1f2937',
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    fieldValueCompleted: {
        fontSize: 16,
        color: '#9ca3af',
        fontFamily: 'PlusJakartaSans_400Regular',
        textDecorationLine: 'line-through',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#1f2937',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#1f2937',
    },
    cancelButton: {
        padding: 4,
    },
    modalContent: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
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
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    errorContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    booleanInput: {
        flexDirection: 'row',
        gap: 12,
    },
    booleanOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    booleanActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
    },
    booleanInactive: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    booleanText: {
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 16,
    },
    booleanTextActive: {
        color: '#1d4ed8',
    },
    booleanTextInactive: {
        color: '#6b7280',
    },
    modalFooter: {
        paddingTop: 16,
    },
    dateInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#1f2937',
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    datePlaceholder: {
        fontSize: 16,
        color: '#9ca3af',
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    fieldHint: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 6,
        fontStyle: 'italic',
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    datePickerModal: {
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
    datePickerTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#1f2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    datePickerInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1f2937',
        fontFamily: 'PlusJakartaSans_400Regular',
        marginBottom: 24,
        textAlign: 'center',
    },
    datePickerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    datePickerButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    datePickerCancelButton: {
        backgroundColor: '#f3f4f6',
    },
    datePickerConfirmButton: {
        backgroundColor: '#3b82f6',
    },
    datePickerCancelText: {
        color: '#4b5563',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    datePickerConfirmText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
});
