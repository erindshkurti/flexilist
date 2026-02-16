import { useListItems } from '@/hooks/useListItems';
import { List } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';

interface ListCardProps {
    list: List;
    onDelete: (id: string, title: string) => void;
    style?: StyleProp<ViewStyle>;
}

export const ListCard = ({ list, onDelete, style }: ListCardProps) => {
    const router = useRouter();
    const { items, loading } = useListItems(list.id);

    const counts = useMemo(() => {
        if (loading || !items) return { total: 0, completed: 0 };
        const total = items.length;
        const completed = items.filter(i => i.completed).length;
        return { total, completed };
    }, [items, loading]);

    return (
        <TouchableHighlight
            onPress={() => router.push(`/list/${list.id}`)}
            style={[styles.listCard, style]}
            underlayColor="#f3f4f6"
        >
            <View style={styles.innerContainer}>
                <View style={styles.listCardContent}>
                    <View style={styles.listHeader}>
                        <View style={styles.listInfo}>
                            <View style={styles.titleRow}>
                                <Text style={styles.listTitle}>{list.title}</Text>
                                {!loading && (
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countText}>
                                            {counts.completed}/{counts.total}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {list.description ? (
                                <Text style={styles.listDescription} numberOfLines={1}>{list.description}</Text>
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.fieldTags}>
                        {list.fields.slice(0, 3).map((field: any) => (
                            <View key={field.id} style={styles.fieldTag}>
                                <Text style={styles.fieldTagText}>{field.name}</Text>
                            </View>
                        ))}
                        {list.fields.length > 3 && (
                            <View style={styles.fieldTag}>
                                <Text style={styles.fieldTagText}>+{list.fields.length - 3}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.listCardActions}>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('Edit button clicked for:', list.title);
                            router.push(`/edit-list/${list.id}`);
                        }}
                        style={styles.editButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="create-outline" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('Delete button clicked!');
                            onDelete(list.id, list.title);
                        }}
                        style={styles.deleteButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
            </View>
        </TouchableHighlight>
    );
};

const styles = StyleSheet.create({
    listCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f9fafb',
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listCardContent: {
        flex: 1,
        paddingRight: 16,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    listInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 2,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#1f2937',
    },
    countBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#4b5563',
    },
    listDescription: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: '#6b7280',
    },
    listCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editButton: {
        padding: 4,
    },
    deleteButton: {
        padding: 4,
    },
    fieldTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    fieldTag: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    fieldTagText: {
        fontSize: 12,
        color: '#4b5563',
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
});
