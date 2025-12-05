// Video cache utility for storing local video paths
// Maps server video URLs to local file paths for HD playback

import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDEO_CACHE_KEY = '@video_cache';
const MAX_CACHE_SIZE = 50; // Maximum number of cached videos

interface VideoCacheEntry {
  localPath: string;
  timestamp: number;
}

interface VideoCache {
  [serverUrl: string]: VideoCacheEntry;
}

let memoryCache: VideoCache = {};
let isInitialized = false;

// Initialize cache from AsyncStorage
export const initVideoCache = async (): Promise<void> => {
  if (isInitialized) return;

  try {
    const cached = await AsyncStorage.getItem(VIDEO_CACHE_KEY);
    if (cached) {
      memoryCache = JSON.parse(cached);
    }
    isInitialized = true;
  } catch (error) {
    console.error('[VideoCache] Failed to initialize cache:', error);
    memoryCache = {};
    isInitialized = true;
  }
};

// Save cache to AsyncStorage
const persistCache = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(memoryCache));
  } catch (error) {
    console.error('[VideoCache] Failed to persist cache:', error);
  }
};

// Clean old entries if cache is too large
const cleanOldEntries = (): void => {
  const entries = Object.entries(memoryCache);
  if (entries.length <= MAX_CACHE_SIZE) return;

  // Sort by timestamp (oldest first) and remove excess
  entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
  const toRemove = entries.length - MAX_CACHE_SIZE;

  for (let i = 0; i < toRemove; i++) {
    delete memoryCache[entries[i][0]];
  }
};

// Cache a local video path for a server URL
export const cacheVideoPath = async (
  serverUrl: string,
  localPath: string,
): Promise<void> => {
  if (!serverUrl || !localPath) return;

  await initVideoCache();

  memoryCache[serverUrl] = {
    localPath,
    timestamp: Date.now(),
  };

  cleanOldEntries();
  await persistCache();

  console.log('[VideoCache] Cached video:', { serverUrl, localPath });
};

// Get cached local path for a server URL
export const getCachedVideoPath = async (
  serverUrl: string,
): Promise<string | null> => {
  if (!serverUrl) return null;

  await initVideoCache();

  const entry = memoryCache[serverUrl];
  if (entry) {
    console.log('[VideoCache] Cache hit:', {
      serverUrl,
      localPath: entry.localPath,
    });
    return entry.localPath;
  }

  console.log('[VideoCache] Cache miss:', serverUrl);
  return null;
};

// Store pending local path (before we know the server URL)
let pendingLocalPath: string | null = null;

export const setPendingVideoPath = (localPath: string | null): void => {
  pendingLocalPath = localPath;
  console.log('[VideoCache] Set pending local path:', localPath);
};

export const getPendingVideoPath = (): string | null => {
  return pendingLocalPath;
};

export const clearPendingVideoPath = (): void => {
  pendingLocalPath = null;
};

// Clear all cached videos
export const clearVideoCache = async (): Promise<void> => {
  memoryCache = {};
  await AsyncStorage.removeItem(VIDEO_CACHE_KEY);
  console.log('[VideoCache] Cache cleared');
};
