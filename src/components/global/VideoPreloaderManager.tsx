// VideoPreloaderManager - Renders hidden Video components to preload videos in background
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import {
  getNextPreloadUrl,
  markVideoPreloaded,
  getPreloadQueueLength,
  isVideoPreloaded,
} from '../../utils/videoPreloader';

const MAX_CONCURRENT_PRELOADS = 2;
const PRELOAD_CHECK_INTERVAL = 500; // ms

interface PreloadingVideo {
  url: string;
  loaded: boolean;
}

interface VideoPreloaderManagerProps {
  // Called when a video is loaded, with the URL
  onVideoPreloaded?: (url: string) => void;
}

const VideoPreloaderManager: React.FC<VideoPreloaderManagerProps> = ({
  onVideoPreloaded,
}) => {
  const [preloadingVideos, setPreloadingVideos] = useState<PreloadingVideo[]>(
    [],
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check queue and add videos to preload
  const processQueue = useCallback(() => {
    const activeCount = preloadingVideos.filter(v => !v.loaded).length;

    if (activeCount >= MAX_CONCURRENT_PRELOADS) {
      return;
    }

    const slotsAvailable = MAX_CONCURRENT_PRELOADS - activeCount;
    const newVideos: PreloadingVideo[] = [];

    for (let i = 0; i < slotsAvailable; i++) {
      const nextUrl = getNextPreloadUrl();
      if (nextUrl && !preloadingVideos.some(v => v.url === nextUrl)) {
        newVideos.push({ url: nextUrl, loaded: false });
      }
    }

    if (newVideos.length > 0) {
      setPreloadingVideos(prev => [...prev, ...newVideos]);
    }
  }, [preloadingVideos]);

  // Start interval to check queue
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (getPreloadQueueLength() > 0) {
        processQueue();
      }
    }, PRELOAD_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [processQueue]);

  // Handle video load complete
  const handleVideoLoad = useCallback(
    (url: string) => {
      markVideoPreloaded(url);

      setPreloadingVideos(prev =>
        prev.map(v => (v.url === url ? { ...v, loaded: true } : v)),
      );

      // Remove loaded videos after a short delay to prevent flickering
      setTimeout(() => {
        setPreloadingVideos(prev => prev.filter(v => !v.loaded));
      }, 100);

      onVideoPreloaded?.(url);
      console.log(
        '[VideoPreloaderManager] Video preloaded:',
        url.substring(0, 60),
      );
    },
    [onVideoPreloaded],
  );

  // Handle video load error
  const handleVideoError = useCallback((url: string, error: any) => {
    console.warn(
      '[VideoPreloaderManager] Failed to preload:',
      url.substring(0, 60),
      error,
    );

    // Remove failed video from preloading list
    setPreloadingVideos(prev => prev.filter(v => v.url !== url));
  }, []);

  if (preloadingVideos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {preloadingVideos.map(video => (
        <Video
          key={video.url}
          source={{ uri: video.url }}
          style={styles.hiddenVideo}
          paused={true}
          muted={true}
          resizeMode="contain"
          onLoad={() => handleVideoLoad(video.url)}
          onError={e => handleVideoError(video.url, e)}
          // Aggressive buffering for preload
          bufferConfig={{
            minBufferMs: 5000,
            maxBufferMs: 15000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
  hiddenVideo: {
    width: 1,
    height: 1,
  },
});

export default VideoPreloaderManager;
