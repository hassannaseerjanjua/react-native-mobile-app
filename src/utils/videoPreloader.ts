// Video preloader utility for instant playback
// Uses react-native-video's internal caching mechanism

const MAX_PRELOAD_COUNT = 5; // Number of videos to preload in queue
const preloadQueue: string[] = [];
const preloadedUrls = new Set<string>();
const preloadPromises = new Map<string, Promise<void>>();

// Add video URLs to preload queue
export const queueVideosForPreload = (videoUrls: string[]): void => {
  if (!videoUrls || videoUrls.length === 0) return;

  const urlsToAdd = videoUrls
    .filter(
      url =>
        url &&
        url.trim() !== '' &&
        !preloadedUrls.has(url) &&
        !preloadQueue.includes(url),
    )
    .slice(0, MAX_PRELOAD_COUNT);

  urlsToAdd.forEach(url => {
    preloadQueue.push(url);
    console.log('[VideoPreloader] Queued:', url.substring(0, 60) + '...');
  });
};

// Get next video to preload
export const getNextPreloadUrl = (): string | null => {
  while (preloadQueue.length > 0) {
    const url = preloadQueue.shift();
    if (url && !preloadedUrls.has(url)) {
      return url;
    }
  }
  return null;
};

// Mark video as preloaded
export const markVideoPreloaded = (url: string): void => {
  preloadedUrls.add(url);
  console.log('[VideoPreloader] Preloaded:', url.substring(0, 60) + '...');
};

// Check if video is already preloaded
export const isVideoPreloaded = (url: string): boolean => {
  return preloadedUrls.has(url);
};

// Get count of videos waiting to preload
export const getPreloadQueueLength = (): number => {
  return preloadQueue.length;
};

// Clear preload data (call on logout or memory pressure)
export const clearPreloadData = (): void => {
  preloadQueue.length = 0;
  preloadedUrls.clear();
  preloadPromises.clear();
  console.log('[VideoPreloader] Cleared all preload data');
};

// Extract video URLs from inbox/outbox orders
export interface OrderWithVideo {
  orderImages?: Array<{ ImageUrl: string }>;
}

export const extractVideoUrls = (orders: OrderWithVideo[]): string[] => {
  if (!orders) return [];

  return orders
    .filter(order => order.orderImages && order.orderImages.length > 0)
    .map(order => order.orderImages![0].ImageUrl)
    .filter(url => url && url.trim() !== '');
};
