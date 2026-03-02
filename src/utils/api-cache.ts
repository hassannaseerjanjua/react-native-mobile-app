// ---------------------------------------------------------------------------
// API response cache
// ---------------------------------------------------------------------------
// In-memory Map for instant lookups this session.
// Backed by AsyncStorage so it survives app restarts.
// Strategy: stale-while-revalidate — callers receive cached data immediately
// and update state again once the fresh network response arrives.
// ---------------------------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_STORAGE_KEY = '@api_response_cache';
const MAX_ENTRIES = 200;

const memCache = new Map<string, any>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;

// Resolves once the persisted cache has been read into memCache.
// Callers can await this to avoid a race where the cache isn't populated yet.
export const cacheReadyPromise = AsyncStorage.getItem(CACHE_STORAGE_KEY)
  .then(raw => {
    if (!raw) return;
    const entries: [string, any][] = JSON.parse(raw);
    entries.forEach(([k, v]) => memCache.set(k, v));
  })
  .catch(() => {});

const persistCache = () => {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const entries = Array.from(memCache.entries()).slice(-MAX_ENTRIES);
    AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(entries)).catch(
      () => {},
    );
  }, 1500);
};

/**
 * Read a cached value. Awaits cacheReadyPromise so the result is always
 * accurate even if called before AsyncStorage has loaded.
 */
export const getCached = async <T>(key: string): Promise<T | null> => {
  await cacheReadyPromise;
  const value = memCache.get(key);
  return value !== undefined ? (value as T) : null;
};

/**
 * Write a value to both the in-memory map and (debounced) AsyncStorage.
 */
export const setCached = (key: string, data: any): void => {
  memCache.set(key, data);
  persistCache();
};

/**
 * Remove a specific key from cache (e.g. after a mutation).
 */
export const invalidateCache = (key: string): void => {
  if (!memCache.has(key)) return;
  memCache.delete(key);
  persistCache();
};

/**
 * Remove all keys that start with a given prefix.
 * Useful for invalidating a whole endpoint group after a mutation.
 */
export const invalidateCachePrefix = (prefix: string): void => {
  let changed = false;
  memCache.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      memCache.delete(key);
      changed = true;
    }
  });
  if (changed) persistCache();
};
