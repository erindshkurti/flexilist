import { ListCard } from '@/components/ListCard';
import { SwipeableItem } from '@/components/SwipeableItem';
import { useAuth } from '@/context/AuthContext';
import { useLists } from '@/hooks/useLists';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function HomeScreen() {
  const { lists, loading, deleteList } = useLists();
  const { user, signOut, deleteAccount } = useAuth();
  const router = useRouter();

  const handleEditList = (listId: string) => {
    router.push(`/edit-list/${listId}`);
  };
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified'>('modified');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [listToDelete, setListToDelete] = useState<{ id: string; title: string } | null>(null);
  /* Removed duplicate router declaration */

  // Note: We intentionally don't save '/(tabs)' here because it would
  // overwrite the saved route before restoration logic can read it.

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account and all your lists? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/login');
            } catch (error: any) {
              if (error.code === 'auth/requires-recent-login' || error.message?.includes('requires-recent-login')) {
                Alert.alert(
                  "Session Expired",
                  "For your security, please sign in again to delete your account.",
                  [
                    { text: "OK", onPress: () => handleSignOut() }
                  ]
                );
              } else {
                Alert.alert("Error", error.message || "Failed to delete account. Please try again later.");
              }
            }
          }
        }
      ]
    );
  };

  const handleDeleteList = (listId: string, listTitle: string) => {
    setListToDelete({ id: listId, title: listTitle });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!listToDelete) return;

    try {
      console.log('Deleting list:', listToDelete.id);
      await deleteList(listToDelete.id);
      console.log('List deleted successfully');
      setDeleteModalVisible(false);
      setListToDelete(null);
    } catch (error: any) {
      window.alert('Error: Failed to delete list');
      console.error('Delete error:', error);
    }
  };

  const filteredLists = lists
    .filter(list => list.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'created') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    });


  /* Removed duplicate import and function */

  const renderItem = ({ item }: { item: any }) => (
    <View style={{ marginBottom: 16, zIndex: -1 }}>
      <SwipeableItem
        onEdit={() => handleEditList(item.id)}
        onDelete={() => handleDeleteList(item.id, item.title)}
        marginBottom={0}
        borderRadius={20}
      >
        <ListCard list={item} onDelete={handleDeleteList} style={{ marginBottom: 0 }} />
      </SwipeableItem>
    </View>
  );

  return (
    <>
      <TouchableWithoutFeedback onPress={() => {
        setFilterMenuVisible(false);
        setProfileMenuVisible(false);
      }}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#ffffff', '#f9fafb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={{ width: 40, height: 40, marginRight: 12 }}
                />
                <Text style={styles.headerTitle}>FlexiList</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setProfileMenuVisible(!profileMenuVisible);
                    setFilterMenuVisible(false);
                  }}
                  style={styles.profileButton}
                >
                  {user?.photoURL ? (
                    <Image
                      source={{ uri: user.photoURL }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={[styles.profileImage, styles.profilePlaceholder]}>
                      <Text style={styles.profileInitial}>{user?.email?.[0]?.toUpperCase() || 'U'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
                <Ionicons name="search" size={20} color={isSearchFocused ? "#1f2937" : "#9ca3af"} />
                <TextInput
                  placeholder="Search lists..."
                  value={search}
                  onChangeText={setSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={styles.searchInput}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.sortButtonWrapper}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setFilterMenuVisible(!filterMenuVisible);
                    setProfileMenuVisible(false);
                  }}
                  style={styles.sortButton}
                >
                  <Ionicons name="options-outline" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.listContainer}>
            <FlatList
              data={filteredLists}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !loading ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <Ionicons name="albums-outline" size={64} color="#d1d5db" />
                    </View>
                    <Text style={styles.emptyTitle}>No lists yet</Text>
                    <Text style={styles.emptySubtitle}>Create your first list to get started!</Text>
                  </View>
                ) : null
              }
            />
          </View>

          {/* Floating Action Button */}
          <TouchableOpacity
            onPress={() => router.push('/create-list')}
            style={styles.fab}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>


        </View>
      </TouchableWithoutFeedback>

      {/* Root-Level Dropdowns for perfect z-index on iOS */}
      {profileMenuVisible && (
        <View
          style={styles.profileMenuCard}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.profileHeader}>
            <Text style={styles.profileName} numberOfLines={1}>{user?.displayName || 'User'}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{user?.email}</Text>
          </View>
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setProfileMenuVisible(false);
              handleSignOut();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#6b7280" />
            <Text style={[styles.menuText, { color: '#4b5563' }]}>Sign Out</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setProfileMenuVisible(false);
              handleDeleteAccount();
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={[styles.menuText, { color: '#ef4444' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {filterMenuVisible && (
        <View
          style={styles.dropdownMenu}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.dropdownTitle}>Sort by</Text>

          <TouchableOpacity
            style={[styles.dropdownItem, sortBy === 'modified' && styles.dropdownItemActive]}
            onPress={() => {
              setSortBy('modified');
              setFilterMenuVisible(false);
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={sortBy === 'modified' ? '#1f2937' : '#4b5563'} />
            <Text style={[styles.dropdownText, sortBy === 'modified' && styles.dropdownTextActive]}>Date Modified</Text>
            {sortBy === 'modified' && <Ionicons name="checkmark" size={16} color="#1f2937" style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dropdownItem, sortBy === 'created' && styles.dropdownItemActive]}
            onPress={() => {
              setSortBy('created');
              setFilterMenuVisible(false);
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
              setFilterMenuVisible(false);
            }}
          >
            <Ionicons name="text-outline" size={20} color={sortBy === 'name' ? '#1f2937' : '#4b5563'} />
            <Text style={[styles.dropdownText, sortBy === 'name' && styles.dropdownTextActive]}>Alphabetical</Text>
            {sortBy === 'name' && <Ionicons name="checkmark" size={16} color="#1f2937" style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
        </View>
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
              <Text style={styles.deleteModalTitle}>Delete List</Text>
            </View>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete &quot;{listToDelete?.title}&quot;?{'\n'}
              This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setListToDelete(null);
                }}
                style={[styles.deleteModalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={[styles.deleteModalButton, styles.confirmDeleteButton]}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 1000,
    elevation: 10,
    position: 'relative',
    overflow: 'visible',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    zIndex: 2000,
    overflow: 'visible',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#1f2937',
  },
  headerRight: {
    position: 'relative',
    zIndex: 3000,
    overflow: 'visible',
  },
  profileButton: {
    // No shadow or background - just the circular image
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#f3f4f6', // Neutral light gray
  },
  profilePlaceholder: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  profileMenu: {
    position: 'absolute',
    top: 114,
    right: 0,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    // The menu itself should be a small card aligned to the right
    // We use a nested approach: this outer wrapper positions within the content column
    backgroundColor: 'transparent',
    zIndex: 99999,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  profileMenuCard: {
    position: 'absolute',
    top: 114,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    width: 220,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    zIndex: 99999,
  },
  profileHeader: {
    padding: 12,
    paddingBottom: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#6b7280',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#374151',
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
  dropdownMenu: {
    position: 'absolute',
    top: 194,
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
  listContainer: {
    flex: 1,
    marginTop: -16,
    position: 'relative',
    zIndex: -1,
  },
  listContent: {
    padding: 20,
    paddingTop: 40,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: '#ffffff',
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  cancelButton: {
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
