import { ListCard } from '@/components/ListCard';
import { SwipeableItem } from '@/components/SwipeableItem';
import { useArchivedLists, useLists } from '@/hooks/useLists';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ArchivedScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { archivedLists, loading } = useArchivedLists();
    const { unarchiveList, deleteList } = useLists();

    const [search, setSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified'>('modified');
    const [sortMenuVisible, setSortMenuVisible] = useState(false);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [listToDelete, setListToDelete] = useState<{ id: string; title: string } | null>(null);

    const filteredLists = archivedLists
        .filter(list => list.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            if (sortBy === 'created') return (b.createdAt || 0) - (a.createdAt || 0);
            return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
        });

    const handleRestore = async (listId: string) => {
        try {
            await unarchiveList(listId);
        } catch (error) {
            Alert.alert('Error', 'Failed to restore list. Please try again.');
        }
    };

    const handleDeletePress = (listId: string, listTitle: string) => {
        setListToDelete({ id: listId, title: listTitle });
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!listToDelete) return;
        try {
            await deleteList(listToDelete.id);
            setDeleteModalVisible(false);
            setListToDelete(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to delete list. Please try again.');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={{ marginBottom: 16 }}>
            <SwipeableItem
                onEdit={() => handleRestore(item.id)}
                onDelete={() => handleDeletePress(item.id, item.title)}
                marginBottom={0}
                borderRadius={20}
                leftIcon="arrow-undo-outline"
                leftLabel="Restore"
                leftColor="#10b981"
            >
                <ListCard list={item} onDelete={handleDeletePress} style={{ marginBottom: 0 }} />
            </SwipeableItem>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ffffff', '#f9fafb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: Math.max(insets.top + 20, 60) }]}
            >
                <View style={styles.headerContent}>
                    {/* Title row */}
                    <View style={styles.titleRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Archived Lists</Text>
                    </View>

                    {/* Search + sort row */}
                    <View style={styles.searchContainer}>
                        <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
                            <Ionicons name="search" size={20} color={isSearchFocused ? '#1f2937' : '#9ca3af'} />
                            <TextInput
                                placeholder="Search archived..."
                                value={search}
                                onChangeText={setSearch}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                style={styles.searchInput}
                                placeholderTextColor="#9ca3af"
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.sortButtonWrapper}>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setSortMenuVisible(!sortMenuVisible);
                                }}
                                style={styles.sortButton}
                            >
                                <Ionicons name="options-outline" size={24} color="#1f2937" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.listContainer}>
                {loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Loading...</Text>
                    </View>
                ) : filteredLists.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="archive-outline" size={56} color="#d1d5db" />
                        <Text style={styles.emptyStateTitle}>
                            {archivedLists.length === 0 ? 'No archived lists' : 'No results'}
                        </Text>
                        <Text style={styles.emptyStateText}>
                            {archivedLists.length === 0
                                ? 'Lists you archive will appear here.'
                                : 'Try a different search term.'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredLists}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Sort dropdown */}
            {sortMenuVisible && (
                <View style={styles.sortMenuOverlay} pointerEvents="box-none">
                    <TouchableOpacity
                        style={styles.sortMenuDismiss}
                        activeOpacity={1}
                        onPress={() => setSortMenuVisible(false)}
                    />
                    <View style={styles.sortMenuCard} onStartShouldSetResponder={() => true}>
                        <Text style={styles.dropdownTitle}>Sort by</Text>
                        {([
                            { key: 'modified', label: 'Date Modified', icon: 'calendar-outline' },
                            { key: 'created',  label: 'Date Created',  icon: 'time-outline'     },
                            { key: 'name',     label: 'Alphabetical',  icon: 'text-outline'     },
                        ] as const).map(({ key, label, icon }) => (
                            <TouchableOpacity
                                key={key}
                                style={[styles.dropdownItem, sortBy === key && styles.dropdownItemActive]}
                                onPress={() => { setSortBy(key); setSortMenuVisible(false); }}
                            >
                                <Ionicons name={icon} size={20} color={sortBy === key ? '#1f2937' : '#4b5563'} />
                                <Text style={[styles.dropdownText, sortBy === key && styles.dropdownTextActive]}>
                                    {label}
                                </Text>
                                {sortBy === key && <Ionicons name="checkmark" size={16} color="#1f2937" style={{ marginLeft: 'auto' }} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Delete confirmation modal */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Delete List</Text>
                        <Text style={styles.modalMessage}>
                            Permanently delete "{listToDelete?.title}"? This cannot be undone.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        paddingBottom: 24,
        paddingHorizontal: 20,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderTopWidth: 0,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        zIndex: 100,
        position: 'relative',
        overflow: 'visible',
    },
    headerContent: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        color: '#1f2937',
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 12,
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
        zIndex: 102,
        overflow: 'visible',
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
    sortButtonWrapper: {
        position: 'relative',
        zIndex: 3000,
        overflow: 'visible',
    },
    sortButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        marginTop: -16,
        position: 'relative',
        zIndex: 1,
    },
    listContent: {
        paddingTop: 36,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxWidth: 840,
        width: '100%',
        alignSelf: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 60,
        gap: 12,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#6b7280',
    },
    emptyStateText: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: '#9ca3af',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    // Sort dropdown
    sortMenuOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2000,
    },
    sortMenuDismiss: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    sortMenuCard: {
        position: 'absolute',
        top: 155,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 8,
        width: 200,
        zIndex: 99999,
        borderWidth: 1,
        borderColor: '#f3f4f6',
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
        fontFamily: 'PlusJakartaSans_500Medium',
        color: '#4b5563',
        fontWeight: '500',
    },
    dropdownTextActive: {
        color: '#1f2937',
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    // Delete modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#111827',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: '#6b7280',
        lineHeight: 22,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#374151',
        fontSize: 14,
    },
    deleteButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#ef4444',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#ffffff',
        fontSize: 14,
    },
});
