import { useLists } from '@/hooks/useLists';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { lists, loading } = useLists();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const router = useRouter();

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f9fafb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.headerTitle}>My Lists</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/create-list')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
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
            onPress={() => setSortBy(prev => prev === 'date' ? 'name' : 'date')}
            style={styles.sortButton}
          >
            <Ionicons name={sortBy === 'date' ? 'time-outline' : 'text-outline'} size={22} color="white" />
          </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 4,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
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
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listContainer: {
    flex: 1,
    marginTop: -16,
  },
  listContent: {
    padding: 20,
    paddingTop: 24,
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
