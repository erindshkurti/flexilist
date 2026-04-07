import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Offline cache helpers
// Uses AsyncStorage on native and localStorage on web.
// These are plain async functions (not a React hook) so they can be called
// freely from inside other hooks without violating rules-of-hooks.
// ---------------------------------------------------------------------------

const getStorage = () => {
    if (Platform.OS === 'web') return null; // web uses localStorage directly
    // Lazy-require so the native module is never touched on web.
    return require('@react-native-async-storage/async-storage').default as {
        getItem(key: string): Promise<string | null>;
        setItem(key: string, value: string): Promise<void>;
        removeItem(key: string): Promise<void>;
    };
};

export async function readCache<T>(key: string): Promise<T | null> {
    try {
        if (Platform.OS === 'web') {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : null;
        }
        const storage = getStorage()!;
        const raw = await storage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
    try {
        const serialised = JSON.stringify(data);
        if (Platform.OS === 'web') {
            localStorage.setItem(key, serialised);
        } else {
            const storage = getStorage()!;
            await storage.setItem(key, serialised);
        }
    } catch {
        // Cache writes are best-effort — never throw
    }
}

export async function clearCache(key: string): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await getStorage()!.removeItem(key);
        }
    } catch {
        // no-op
    }
}

// Stable key builders
export const cacheKey = {
    lists: (uid: string) => `fl_lists_${uid}`,
    archivedLists: (uid: string) => `fl_archived_lists_${uid}`,
    items: (listId: string) => `fl_items_${listId}`,
};
