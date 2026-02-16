import { Button } from '@/components/Button';
import { db } from '@/config/firebase';
import { useListItems } from '@/hooks/useListItems';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { List, ListField } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListDetailScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [list, setList] = useState<List | null>(null);
    const { items, loading: itemsLoading, addItem, deleteItem, updateItem } = useListItems(id!);
    const { saveLastRoute, getListPreference, saveListPreference, loading: prefsLoading } = useUserPreferences();
    const router = useRouter();
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<Record<string, any>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [datePickerField, setDatePickerField] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState(new Date());
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'created'>('name');
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

    const [showCompleted, setShowCompleted] = useState(true);
    const [hasInitializedPrefs, setHasInitializedPrefs] = useState(false);

    // Initialize display preference from user settings
    useEffect(() => {
        if (!prefsLoading && !hasInitializedPrefs && id) {
            const pref = getListPreference(id);
            if (pref && pref.hideCompleted !== undefined) {
                setShowCompleted(!pref.hideCompleted);
            }
            setHasInitializedPrefs(true);
        }
    }, [prefsLoading, id, getListPreference, hasInitializedPrefs]);

    // Handle back navigation - go to home if no history (e.g., after route restoration)
    const handleBack = () => {
        // Save home route so closing browser after going back remembers dashboard
        saveLastRoute('/(tabs)');

        if (navigation.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)');
        }
    };

    // Save the current route for session persistence
    useEffect(() => {
        if (id) {
            saveLastRoute(`/list/${id}`);
        }
    }, [id, saveLastRoute]);

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

    const handleDeleteItem = (itemId: string, itemName: string) => {
        setItemToDelete({ id: itemId, name: itemName });
        setDeleteModalVisible(true);
    };

    const confirmDeleteItem = async () => {
        if (!itemToDelete) return;
        try {
            await deleteItem(itemToDelete.id);
            setDeleteModalVisible(false);
            setItemToDelete(null);
        } catch (error) {
            Alert.alert("Error", "Failed to delete item.");
        }
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
            if (!firstFieldId) return true;
            const value = item.data[firstFieldId]?.toString().toLowerCase() || '';
            const matchesSearch = search ? value.includes(search.toLowerCase()) : true;

            // If searching, show all matching items regardless of completion status
            if (search) {
                return matchesSearch;
            }

            // Otherwise, respect the "hide completed" toggle
            if (!showCompleted && item.completed) return false;

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'name' && firstFieldId) {
                const aValue = a.data[firstFieldId]?.toString().toLowerCase() || '';
                const bValue = b.data[firstFieldId]?.toString().toLowerCase() || '';
                return aValue.localeCompare(bValue);
            } else {
                return (b.createdAt || 0) - (a.createdAt || 0);
            }
        });

    const getItemName = (item: any) => {
        if (!list || list.fields.length === 0) return 'this item';
        return item.data[list.fields[0].id] || 'Untitled';
    };

    return (
        <TouchableWithoutFeedback onPress={() => setSortMenuVisible(false)}>
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
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#1f2937" />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.headerTitle}>{list.title}</Text>
                                {!!list.description && <Text style={styles.headerDescription}>{list.description}</Text>}
                            </View>
                        </View>

                        <View style={styles.searchSortContainer}>
                            <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
                                <Ionicons name="search" size={20} color={isSearchFocused ? "#1f2937" : "#9ca3af"} />
                                <TextInput
                                    placeholder="Search items..."
                                    value={search}
                                    onChangeText={setSearch}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    style={styles.searchInput}
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    const newValue = !showCompleted;
                                    setShowCompleted(newValue);
                                    if (id) {
                                        saveListPreference(id, { hideCompleted: !newValue });
                                    }
                                }}
                                style={styles.sortButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={showCompleted ? "eye-outline" : "eye-off-outline"}
                                    size={24}
                                    color="#1f2937"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setSortMenuVisible(!sortMenuVisible);
                                }}
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
                                        <Text style={[styles.itemMainText, item.completed && styles.itemMainTextCompleted]}>
                                            {list.fields[0].type === 'date'
                                                ? (item.data[list.fields[0].id] || 'No date')
                                                : item.data[list.fields[0].id] || 'Untitled'}
                                        </Text>

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
                            <TouchableOpacity onPress={() => handleDeleteItem(item.id, getItemName(item))} style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <TouchableOpacity
                    onPress={openAddModal}
                    style={styles.fab}
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>

                {/* Root-Level Dropdown for perfect z-index on iOS */}
                {sortMenuVisible && (
                    <View
                        style={styles.sortDropdown}
                        onStartShouldSetResponder={() => true}
                    >
                        <Text style={styles.dropdownTitle}>Sort by</Text>

                        <TouchableOpacity
                            style={[styles.dropdownItem, sortBy === 'created' && styles.dropdownItemActive]}
                            onPress={() => {
                                setSortBy('created');
                                setSortMenuVisible(false);
                            }}
                        >
                            <Ionicons name="time-outline" size={20} color={sortBy === 'created' ? '#1f2937' : '#4b5563'} />
                            <Text style={[styles.dropdownText, sortBy === 'created' && styles.dropdownTextActive]}>Date Created</Text>
                            {sortBy === 'created' && <Ionicons name="checkmark" size={16} color="#1f2937" style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dropdownItem, sortBy === 'name' && styles.dropdownItemActive]}
                            onPress={() => {
                                setSortBy('name');
                                setSortMenuVisible(false);
                            }}
                        >
                            <Ionicons name="text-outline" size={20} color={sortBy === 'name' ? '#1f2937' : '#4b5563'} />
                            <Text style={[styles.dropdownText, sortBy === 'name' && styles.dropdownTextActive]}>Alphabetical</Text>
                            {sortBy === 'name' && <Ionicons name="checkmark" size={16} color="#1f2937" style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                    </View>
                )}

                <Modal visible={modalVisible} animationType="slide" transparent={true} presentationStyle="overFullScreen">
                    <View style={styles.addItemModalOverlay}>
                        <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editingId ? 'Edit Item' : 'Add Item'}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonTextMain}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalContainer}>
                            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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

                            <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                                <Button title="Save Item" onPress={handleSaveItem} />
                            </View>

                            {/* Native Date Picker Bottom Sheet (Rendered Inside Modal) */}
                            {datePickerVisible && Platform.OS !== 'web' && (
                                <View style={styles.datePickerCtxOverlay}>
                                    <View style={[styles.datePickerSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                                        <View style={styles.datePickerToolbar}>
                                            <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                                                <Text style={styles.datePickerCancelText}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => {
                                                if (datePickerField) {
                                                    const formattedDate = tempDate.toISOString().split('T')[0];
                                                    setCurrentItem({ ...currentItem, [datePickerField]: formattedDate });
                                                }
                                                setDatePickerVisible(false);
                                            }}>
                                                <Text style={styles.datePickerConfirmText}>Confirm</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={tempDate}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, selectedDate) => {
                                                if (selectedDate) {
                                                    setTempDate(selectedDate);
                                                }
                                            }}
                                            style={{ height: 200 }}
                                            textColor="#1f2937"
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Date Picker Modal (Web Only) */}
                {datePickerVisible && Platform.OS === 'web' && (
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
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    visible={deleteModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.deleteModal}>
                            <View style={styles.deleteModalHeader}>
                                <Ionicons name="warning-outline" size={48} color="#ef4444" />
                                <Text style={styles.deleteModalTitle}>Delete Item</Text>
                            </View>
                            <Text style={styles.deleteModalMessage}>
                                Are you sure you want to delete "{itemToDelete?.name}"?{'\n'}
                                This action cannot be undone.
                            </Text>
                            <View style={styles.deleteModalButtons}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setDeleteModalVisible(false);
                                        setItemToDelete(null);
                                    }}
                                    style={[styles.deleteModalButton, styles.cancelButtonModal]}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={confirmDeleteItem}
                                    style={[styles.deleteModalButton, styles.confirmDeleteButton]}
                                >
                                    <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
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
        backgroundColor: '#f9fafb',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        zIndex: 100, // Ensure header (and dropdowns) stack above list
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
        zIndex: 102, // Ensure dropdown renders above list
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
        borderWidth: 1,
        borderColor: 'transparent',
    },
    searchBarFocused: {
        borderColor: '#1f2937',
        backgroundColor: '#ffffff',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        paddingVertical: 14,
        paddingHorizontal: 6,
        fontFamily: 'PlusJakartaSans_500Medium',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            } as any,
        }),
    },
    sortButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortDropdown: {
        position: 'absolute',
        top: 204, // Aligned with the sort button in the header
        right: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 8,
        width: 200,
        zIndex: 99999,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        // Premium Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 20,
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
        backgroundColor: '#f3f4f6',
    },
    dropdownText: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '500',
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    dropdownTextActive: {
        color: '#1f2937',
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
        maxWidth: 840,
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
    addItemModalOverlay: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    headerWrapper: {
        backgroundColor: '#f9fafb',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#1f2937',
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    cancelButtonTextMain: {
        fontSize: 16,
        color: '#4b5563',
        fontFamily: 'PlusJakartaSans_600SemiBold',
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
        backgroundColor: '#f3f4f6',
        borderColor: '#1f2937',
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
        color: '#1f2937',
    },
    booleanTextInactive: {
        color: '#6b7280',
    },
    modalFooter: {
        paddingTop: 16,
        paddingHorizontal: 24,
        paddingBottom: 12,
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
    datePickerCtxOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        zIndex: 1000,
    },
    datePickerSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    datePickerToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    datePickerCancelText: {
        fontSize: 16,
        color: '#ef4444',
        fontWeight: '600',
    },
    datePickerConfirmText: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '600',
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
        backgroundColor: '#1f2937',
    },
    deleteModal: {
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
    deleteModalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    deleteModalTitle: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#1f2937',
        marginTop: 12,
    },
    deleteModalMessage: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    deleteModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    deleteModalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonModal: {
        backgroundColor: '#f3f4f6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#4b5563',
    },
    confirmDeleteButton: {
        backgroundColor: '#ef4444',
    },
    confirmDeleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: 'white',
    },
});
