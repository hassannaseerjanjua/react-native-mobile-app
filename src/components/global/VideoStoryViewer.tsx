import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageSourcePropType,
  SafeAreaView,
} from 'react-native';
import Video, { OnProgressData, OnLoadData } from 'react-native-video';
import { Text } from '../../utils/elements';
import { SvgCrossIcon } from '../../assets/icons';
import { scaleWithMax } from '../../utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoStoryViewerProps {
  visible: boolean;
  videoUrl: string;
  profileImage: ImageSourcePropType;
  userName: string;
  timeAgo?: string;
  onClose: () => void;
}

export interface VideoStoryViewerRef {
  preload: (url: string) => void;
}

const VideoStoryViewer = forwardRef<VideoStoryViewerRef, VideoStoryViewerProps>(
  ({ visible, videoUrl, profileImage, userName, timeAgo, onClose }, ref) => {
    const videoRef = useRef<any>(null);
    const preloadVideoRef = useRef<any>(null);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [preloadUrl, setPreloadUrl] = useState<string | null>(null);

    // Expose preload method to parent
    useImperativeHandle(ref, () => ({
      preload: (url: string) => {
        setPreloadUrl(url);
      },
    }));

    // Reset progress when visibility changes
    useEffect(() => {
      if (!visible) {
        setProgress(0);
        setPreloadUrl(null);
      }
    }, [visible]);

    const handleProgress = useCallback((data: OnProgressData) => {
      if (data.seekableDuration > 0) {
        setProgress(data.currentTime / data.seekableDuration);
      }
    }, []);

    const handleLoad = useCallback((_data: OnLoadData) => {
      // Video loaded, ready to play
    }, []);

    const handleEnd = useCallback(() => {
      setProgress(0);
      onClose();
    }, [onClose]);

    const handleClose = useCallback(() => {
      setProgress(0);
      onClose();
    }, [onClose]);

    const handlePressIn = useCallback(() => {
      setIsPaused(true);
    }, []);

    const handlePressOut = useCallback(() => {
      setIsPaused(false);
    }, []);

    return (
      <>
        {/* Hidden preload video - starts loading before player is visible */}
        {preloadUrl && !visible && (
          <Video
            ref={preloadVideoRef}
            source={{ uri: preloadUrl }}
            style={styles.hiddenVideo}
            paused={true}
            muted={true}
          />
        )}

        {/* Main visible player */}
        {visible && (
          <View style={styles.container}>
            <StatusBar hidden />

            {/* Video Player */}
            <TouchableOpacity
              activeOpacity={1}
              style={styles.videoContainer}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                resizeMode="contain"
                paused={isPaused}
                onProgress={handleProgress}
                onLoad={handleLoad}
                onEnd={handleEnd}
                repeat={false}
                playInBackground={false}
                playWhenInactive={false}
                bufferConfig={{
                  minBufferMs: 2500,
                  maxBufferMs: 5000,
                  bufferForPlaybackMs: 1000,
                  bufferForPlaybackAfterRebufferMs: 1500,
                }}
              />
            </TouchableOpacity>

            {/* Overlay Content */}
            <SafeAreaView style={styles.overlay}>
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Header with Profile and Close */}
              <View style={styles.header}>
                <View style={styles.profileContainer}>
                  <Image source={profileImage} style={styles.profileImage} />
                  <View style={styles.userInfoContainer}>
                    <Text style={styles.userName}>{userName}</Text>
                    {timeAgo && <Text style={styles.timeAgo}>{timeAgo}</Text>}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <View style={styles.closeIconWrapper}>
                    <SvgCrossIcon
                      width={scaleWithMax(10, 12)}
                      height={scaleWithMax(10, 12)}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        )}
      </>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  hiddenVideo: {
    width: 0,
    height: 0,
    position: 'absolute',
    opacity: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  progressBarContainer: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: scaleWithMax(28, 32),
    height: scaleWithMax(28, 32),
    borderRadius: scaleWithMax(14, 16),
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userInfoContainer: {
    marginLeft: 8,
    justifyContent: 'flex-start',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: scaleWithMax(12, 14),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: scaleWithMax(10, 11),
    fontWeight: '400',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 4,
  },
  closeIconWrapper: {
    width: scaleWithMax(22, 26),
    height: scaleWithMax(22, 26),
    borderRadius: scaleWithMax(11, 13),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default VideoStoryViewer;
