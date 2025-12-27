import { useAuth } from '@/context/AuthContext';
import { useLists } from '@/hooks/useLists';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function HomeScreen() {
  const { lists, loading } = useLists();
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error.message);
    }
  };

  const filteredLists = lists
    .filter(list => list.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      return b.createdAt - a.createdAt;
    });

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/list/${item.id}`)}
      style={styles.listCard}
      activeOpacity={0.7}
    >
      <View style={styles.listCardContent}>
        <View style={styles.listHeader}>
          <View style={styles.iconBadge}>
            <Ionicons name="list-outline" size={20} color="#667eea" />
          </View>
          <View style={styles.listInfo}>
            <Text style={styles.listTitle}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.listDescription} numberOfLines={1}>{item.description}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.fieldTags}>
          {item.fields.slice(0, 3).map((field: any) => (
            <View key={field.id} style={styles.fieldTag}>
              <Text style={styles.fieldTagText}>{field.name}</Text>
            </View>
          ))}
          {item.fields.length > 3 && (
            <View style={styles.fieldTag}>
              <Text style={styles.fieldTagText}>+{item.fields.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
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
              <Ionicons name="list-outline" size={32} color="#1f2937" style={{ marginRight: 12 }} />
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

              {profileMenuVisible && (
                <View style={styles.profileMenu}>
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
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={[styles.menuText, { color: '#ef4444' }]}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                placeholder="Search lists..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                placeholderTextColor="#9ca3af"
              />
            </View>
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

            {filterMenuVisible && (
              <View style={styles.dropdownMenu}>
                <Text style={styles.dropdownTitle}>Sort by</Text>

                <TouchableOpacity
                  style={[styles.dropdownItem, sortBy === 'date' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSortBy('date');
                    setFilterMenuVisible(false);
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
                    setFilterMenuVisible(false);
                  }}
                >
                  <Ionicons name="text-outline" size={20} color={sortBy === 'name' ? '#2563EB' : '#4b5563'} />
                  <Text style={[styles.dropdownText, sortBy === 'name' && styles.dropdownTextActive]}>Alphabetical</Text>
                  {sortBy === 'name' && <Ionicons name="checkmark" size={16} color="#2563EB" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              </View>
            )}
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
    zIndex: 100, // Ensure header content stacks above list
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    zIndex: 101,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
  },
  headerRight: {
    position: 'relative',
    zIndex: 200, // Higher than searchContainer to ensure dropdown appears on top
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
    borderColor: '#22c55e', // Modern vibrant green for active login
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
  },
  profileMenu: {
    position: 'absolute',
    top: 54,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    width: 220,
    padding: 8,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowOpacity: 0,
    elevation: 0,
  },
  profileHeader: {
    padding: 12,
    paddingBottom: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
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
    zIndex: 102, // Ensure dropdown renders above
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  },
  sortButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    width: 200,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowOpacity: 0,
    elevation: 0,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  dropdownTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    marginTop: -16,
  },
  listContent: {
    padding: 20,
    paddingTop: 24,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  listCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  listCardContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  listDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  fieldTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fieldTag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fieldTagText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
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
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
});
