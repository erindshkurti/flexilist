import { ListCard } from '@/components/ListCard';
import { SwipeableItem } from '@/components/SwipeableItem';
import { useArchivedLists, useLists } from '@/hooks/useLists';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ArchivedScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { archivedLists, loading } = useArchivedLists();
    const { unarchiveList, deleteList } = useLists();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [listToDelete, setListToDelete] = useState<{ id: string; title: string } | null>(null);

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
                    <View style={styles.titleRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>Archived Lists</Text>
                            <Text style={styles.headerSubtitle}>Swipe right to restore</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.listContainer}>
                {loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Loading...</Text>
                    </View>
                ) : archivedLists.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="archive-outline" size={56} color="#d1d5db" />
                        <Text style={styles.emptyStateTitle}>No archived lists</Text>
                        <Text style={styles.emptyStateText}>
                            Lists you archive will appear here.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={archivedLists}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

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
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: '#9ca3af',
        marginTop: 2,
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
        paddingTop: 60,
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
