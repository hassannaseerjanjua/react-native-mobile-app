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
  Animated,
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import Video, { OnProgressData, OnLoadData } from 'react-native-video';
import { Text } from '../../utils/elements';
import { SvgCrossIcon } from '../../assets/icons';
import { scaleWithMax } from '../../utils';
import { getCachedVideoPath } from '../../utils/videoCache';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoStoryViewerProps {
  visible: boolean;
  videoUrl: string;
  profileImage: ImageSourcePropType;
  userName: string;
  timeAgo?: string;
  onClose: () => void;
  filterImageUrl?: string | null;
  messageText?: string | null;
}

export interface VideoStoryViewerRef {
  preload: (url: string) => void;
}

const VideoStoryViewer = forwardRef<VideoStoryViewerRef, VideoStoryViewerProps>(
  (
    {
      visible,
      videoUrl,
      profileImage,
      userName,
      timeAgo,
      onClose,
      filterImageUrl,
      messageText,
    },
    ref,
  ) => {
    const videoRef = useRef<any>(null);
    const preloadVideoRef = useRef<any>(null);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const textProgressAnim = useRef(new Animated.Value(0)).current;
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [preloadUrl, setPreloadUrl] = useState<string | null>(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const textTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>(videoUrl);

    // Check for cached local video path
    useEffect(() => {
      const checkCache = async () => {
        if (videoUrl) {
          const cachedPath = await getCachedVideoPath(videoUrl);
          if (cachedPath) {
            // Use local cached path (HD version)
            const localUri =
              Platform.OS === 'ios' && !cachedPath.startsWith('file://')
                ? `file://${cachedPath}`
                : cachedPath;
            console.log(
              '[VideoStoryViewer] Using cached local video:',
              localUri,
            );
            setResolvedVideoUrl(localUri);
          } else {
            // Use server URL
            setResolvedVideoUrl(videoUrl);
          }
        }
      };
      checkCache();
    }, [videoUrl]);

    // Determine if we have text story (filter + message)
    const hasTextStory = filterImageUrl && messageText;
    const stories = hasTextStory ? ['text', 'video'] : ['video'];

    // Expose preload method to parent
    useImperativeHandle(ref, () => ({
      preload: (url: string) => {
        setPreloadUrl(url);
      },
    }));

    // Start text story animation (3 seconds)
    const startTextStoryAnimation = useCallback(() => {
      if (textTimerRef.current) {
        clearTimeout(textTimerRef.current);
      }
      textProgressAnim.setValue(0);
      Animated.timing(textProgressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      // Auto-advance to video after 3 seconds
      textTimerRef.current = setTimeout(() => {
        setCurrentStoryIndex(prev => {
          const totalStories = hasTextStory ? 2 : 1;
          if (prev === 0 && totalStories > 1) {
            return 1;
          }
          return prev;
        });
      }, 3000);
    }, [textProgressAnim, hasTextStory]);

    // Reset progress when visibility changes
    useEffect(() => {
      if (!visible) {
        progressAnim.setValue(0);
        textProgressAnim.setValue(0);
        setIsLoading(true);
        setPreloadUrl(null);
        setCurrentStoryIndex(0);
        if (textTimerRef.current) {
          clearTimeout(textTimerRef.current);
          textTimerRef.current = null;
        }
      } else {
        // Show loading when video becomes visible
        setIsLoading(true);
        // Start text story animation if it's the first story
        if (hasTextStory && currentStoryIndex === 0) {
          startTextStoryAnimation();
        }
      }
    }, [
      visible,
      progressAnim,
      textProgressAnim,
      hasTextStory,
      currentStoryIndex,
      startTextStoryAnimation,
    ]);

    // Handle story index changes
    useEffect(() => {
      if (visible) {
        const isOnTextStory = currentStoryIndex === 0 && hasTextStory;
        const isOnVideoStory = currentStoryIndex === (hasTextStory ? 1 : 0);

        if (isOnTextStory) {
          // On text story
          setIsLoading(false);
          startTextStoryAnimation();
        } else if (isOnVideoStory) {
          // On video story
          setIsLoading(true);
          if (textTimerRef.current) {
            clearTimeout(textTimerRef.current);
            textTimerRef.current = null;
          }
        }
      }
    }, [currentStoryIndex, visible, hasTextStory, startTextStoryAnimation]);

    const handleProgress = useCallback(
      (data: OnProgressData) => {
        if (data.seekableDuration > 0 && !isPaused) {
          const newProgress = data.currentTime / data.seekableDuration;
          Animated.timing(progressAnim, {
            toValue: newProgress,
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      },
      [progressAnim, isPaused],
    );

    const handleLoadStart = useCallback(() => {
      setIsLoading(true);
    }, []);

    const handleLoad = useCallback((_data: OnLoadData) => {
      // Video loaded, ready to play
      setIsLoading(false);
    }, []);

    const handleEnd = useCallback(() => {
      progressAnim.setValue(0);
      // If we have more stories, move to next, otherwise close
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        onClose();
      }
    }, [onClose, progressAnim, currentStoryIndex, stories.length]);

    const handleClose = useCallback(() => {
      progressAnim.setValue(0);
      onClose();
    }, [onClose, progressAnim]);

    const handlePressIn = useCallback(() => {
      setIsPaused(true);
      // Pause text animation if on text story
      if (currentStoryIndex === 0 && hasTextStory) {
        if (textTimerRef.current) {
          clearTimeout(textTimerRef.current);
        }
      }
    }, [currentStoryIndex, hasTextStory]);

    const handlePressOut = useCallback(() => {
      setIsPaused(false);
      // Resume text animation if on text story
      if (currentStoryIndex === 0 && hasTextStory) {
        // Get current progress value
        let currentProgress = 0;
        textProgressAnim.addListener(({ value }) => {
          currentProgress = value;
        });
        textProgressAnim.removeAllListeners();

        const remainingTime = (1 - currentProgress) * 3000;
        textTimerRef.current = setTimeout(() => {
          setCurrentStoryIndex(prev => {
            if (prev === 0 && hasTextStory) {
              return 1;
            }
            return prev;
          });
        }, remainingTime);
        Animated.timing(textProgressAnim, {
          toValue: 1,
          duration: remainingTime,
          useNativeDriver: false,
        }).start();
      }
    }, [currentStoryIndex, hasTextStory, textProgressAnim]);

    const handlePreviousStory = useCallback(() => {
      setCurrentStoryIndex(prev => {
        if (prev > 0) {
          // Reset current story progress
          if (prev === (hasTextStory ? 1 : 0)) {
            progressAnim.setValue(0);
          } else if (prev === 0 && hasTextStory) {
            textProgressAnim.setValue(0);
          }

          // Clear any timers
          if (textTimerRef.current) {
            clearTimeout(textTimerRef.current);
            textTimerRef.current = null;
          }

          return prev - 1;
        } else {
          // Already at first story, close viewer
          onClose();
          return prev;
        }
      });
    }, [hasTextStory, progressAnim, textProgressAnim, onClose]);

    const handleNextStory = useCallback(() => {
      const totalStories = hasTextStory ? 2 : 1;
      setCurrentStoryIndex(prev => {
        if (prev < totalStories - 1) {
          // Reset current story progress
          if (prev === (hasTextStory ? 1 : 0)) {
            progressAnim.setValue(0);
          } else if (prev === 0 && hasTextStory) {
            textProgressAnim.setValue(0);
          }

          // Clear any timers
          if (textTimerRef.current) {
            clearTimeout(textTimerRef.current);
            textTimerRef.current = null;
          }

          return prev + 1;
        } else {
          // Already at last story, close viewer
          onClose();
          return prev;
        }
      });
    }, [hasTextStory, progressAnim, textProgressAnim, onClose]);

    const handleScreenPress = useCallback(
      (event: GestureResponderEvent) => {
        // Prevent event bubbling to avoid conflicts with header buttons
        event.stopPropagation?.();

        const { locationX } = event.nativeEvent;
        const screenWidth = SCREEN_WIDTH;
        const leftHalf = screenWidth / 2;

        // Determine which side was tapped
        if (locationX < leftHalf) {
          // Left side - go to previous story
          handlePreviousStory();
        } else {
          // Right side - go to next story
          handleNextStory();
        }
      },
      [handlePreviousStory, handleNextStory],
    );

    const currentStory = stories[currentStoryIndex];
    const isTextStory = currentStory === 'text';
    const isVideoStory = currentStory === 'video';

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

            {/* Text Story Screen */}
            {isTextStory && filterImageUrl && messageText && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.textStoryContainer}
                onPress={handleScreenPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <Image
                  source={{ uri: filterImageUrl }}
                  style={styles.filterBackground}
                  resizeMode="contain"
                />
                <View style={styles.textOverlay}>
                  <Text style={styles.messageText}>{messageText}</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Video Player */}
            {isVideoStory && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.videoContainer}
                onPress={handleScreenPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <Video
                  ref={videoRef}
                  source={{ uri: resolvedVideoUrl }}
                  style={styles.video}
                  resizeMode="contain"
                  paused={isPaused}
                  onProgress={handleProgress}
                  onLoadStart={handleLoadStart}
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
            )}

            {/* Overlay Content */}
            <SafeAreaView style={styles.overlay}>
              {/* Progress Bars for Multiple Stories */}
              <View style={styles.progressBarContainer}>
                {stories.map((story, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressBarBackground,
                      {
                        flex: 1,
                        marginRight: index < stories.length - 1 ? 4 : 0,
                      },
                    ]}
                  >
                    {story === 'text' && index === currentStoryIndex ? (
                      <Animated.View
                        style={[
                          styles.progressBarFill,
                          {
                            width: textProgressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                          },
                        ]}
                      />
                    ) : story === 'video' && index === currentStoryIndex ? (
                      <Animated.View
                        style={[
                          styles.progressBarFill,
                          {
                            width: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                          },
                        ]}
                      />
                    ) : index < currentStoryIndex ? (
                      <View
                        style={[styles.progressBarFill, { width: '100%' }]}
                      />
                    ) : null}
                  </View>
                ))}
              </View>

              {/* Header with Profile and Close */}
              <View style={styles.header} pointerEvents="box-none">
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
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

            {/* Loading Indicator - only show for video */}
            {isLoading && isVideoStory && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
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
  textStoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBackground: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#000000',
  },
  textOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  messageText: {
    fontSize: scaleWithMax(24, 28),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    flexDirection: 'row',
    gap: 4,
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
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default VideoStoryViewer;
