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
import VideoTrimmer from './VideoTrimmer';

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
  isRecording?: boolean;
  onRemove?: () => void;
  isRecursive?: boolean;
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
      isRecording,
      isRecursive,
      onRemove,
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
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0); // Actual video duration, never changes after load
    console.log('Trim End ==> ', trimEnd);
    console.log('Video Duration ==> ', videoDuration);
    console.log('[VideoStoryViewer] Video URL:', resolvedVideoUrl);
    // Add trim handler - only updates trim positions, does NOT change videoDuration
    const handleTrimChange = useCallback((start: number, end: number) => {
      console.log('Trim change output', start, end);
      setTrimStart(start);
      setTrimEnd(end);
      console.log('Trim End ==> 1', end);

      // Seek video to the start position
      if (videoRef.current) {
        videoRef.current.seek(start);
      }
    }, []);

    // Check for cached local video path
    useEffect(() => {
      const checkCache = async () => {
        if (videoUrl) {
          const cachedPath = await getCachedVideoPath(videoUrl);
          if (cachedPath) {
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
            setResolvedVideoUrl(videoUrl);
          }
        }
      };
      checkCache();
    }, [videoUrl]);

    // Determine if we have text story (message with or without filter)
    const hasTextStory = !!messageText;
    const hasVideo = !!videoUrl && videoUrl.trim() !== '';
    // If we have text and video, show text first then video. If only text, show only text.
    const stories =
      hasTextStory && hasVideo
        ? ['text', 'video']
        : hasTextStory
        ? ['text']
        : hasVideo
        ? ['video']
        : [];

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

      textTimerRef.current = setTimeout(() => {
        setCurrentStoryIndex(prev => {
          const totalStories = hasTextStory && hasVideo ? 2 : 1;
          if (prev === 0 && totalStories > 1) {
            return 1;
          } else {
            // If this is the last story (text-only), close the viewer
            onClose();
          }
          return prev;
        });
      }, 3000);
    }, [textProgressAnim, hasTextStory, hasVideo, onClose]);

    // Reset progress when visibility changes
    useEffect(() => {
      if (!visible) {
        progressAnim.setValue(0);
        textProgressAnim.setValue(0);
        setIsLoading(true);
        setPreloadUrl(null);
        setCurrentStoryIndex(0);
        setIsPaused(false);
        if (textTimerRef.current) {
          clearTimeout(textTimerRef.current);
          textTimerRef.current = null;
        }
      } else {
        setIsLoading(true);
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
          setIsLoading(false);
          startTextStoryAnimation();
        } else if (isOnVideoStory) {
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
        // In recording mode, check if we've exceeded the trim end time
        if (isRecording && trimEnd > 0 && data.currentTime >= trimEnd) {
          // Loop back to trim start
          if (videoRef.current) {
            videoRef.current.seek(trimStart);
          }
          return;
        }

        if (data.seekableDuration > 0 && !isPaused) {
          // In recording mode, calculate progress relative to trimmed section
          let newProgress;
          if (isRecording && trimEnd > trimStart) {
            // Progress within the trimmed range
            const trimmedDuration = trimEnd - trimStart;
            const relativeTime = Math.max(0, data.currentTime - trimStart);
            newProgress = relativeTime / trimmedDuration;
          } else {
            // Normal progress for non-recording mode
            newProgress = data.currentTime / data.seekableDuration;
          }

          Animated.timing(progressAnim, {
            toValue: newProgress,
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      },
      [progressAnim, isPaused, isRecording, trimStart, trimEnd],
    );

    const handleLoadStart = useCallback(() => {
      setIsLoading(true);
    }, []);

    const handleLoad = useCallback(
      (data: OnLoadData) => {
        setIsLoading(false);
        console.log('Video loaded, duration ==>', data.duration);

        // Set actual video duration (this should only happen once per video load)
        setVideoDuration(data.duration);
        // Initialize trimEnd to full duration
        setTrimEnd(data.duration);
        setTrimStart(0);

        // In recording mode, seek to start (trimStart is 0 initially)
        if (isRecording && videoRef.current) {
          videoRef.current.seek(0);
        }
      },
      [isRecording],
    );

    const handleReadyForDisplay = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleEnd = useCallback(() => {
      // In recording mode, loop back to trimStart instead of ending
      if (isRecording && videoRef.current) {
        videoRef.current.seek(trimStart);
        return;
      }

      progressAnim.setValue(0);
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        if (isRecursive) {
          // Loop the video
          if (videoRef.current) {
            videoRef.current.seek(0);
          }
        } else onClose();
      }
    }, [
      onClose,
      progressAnim,
      currentStoryIndex,
      stories.length,
      isRecording,
      trimStart,
    ]);

    const handleClose = useCallback(() => {
      progressAnim.setValue(0);
      onClose();
    }, [onClose, progressAnim]);

    const handlePressIn = useCallback(() => {
      // In recording mode, pause on press (toggle happens in handleScreenPress)
      // For non-recording mode, pause on press in
      if (!isRecording) {
        setIsPaused(true);
      }
      // Pause text animation if on text story
      if (currentStoryIndex === 0 && hasTextStory) {
        if (textTimerRef.current) {
          clearTimeout(textTimerRef.current);
        }
      }
    }, [currentStoryIndex, hasTextStory, isRecording]);

    const handlePressOut = useCallback(() => {
      // In recording mode, don't resume on release
      if (!isRecording) {
        setIsPaused(false);
      }
      // Resume text animation if on text story
      if (currentStoryIndex === 0 && hasTextStory) {
        let currentProgress = 0;
        textProgressAnim.addListener(({ value }) => {
          currentProgress = value;
        });
        textProgressAnim.removeAllListeners();

        const remainingTime = (1 - currentProgress) * 3000;
        textTimerRef.current = setTimeout(() => {
          setCurrentStoryIndex(prev => {
            const totalStories = hasTextStory && hasVideo ? 2 : 1;
            if (prev === 0 && totalStories > 1) {
              return 1;
            } else {
              onClose();
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
    }, [
      currentStoryIndex,
      hasTextStory,
      hasVideo,
      textProgressAnim,
      isRecording,
      onClose,
    ]);

    const handlePreviousStory = useCallback(() => {
      setCurrentStoryIndex(prev => {
        if (prev > 0) {
          if (prev === (hasTextStory ? 1 : 0)) {
            progressAnim.setValue(0);
          } else if (prev === 0 && hasTextStory) {
            textProgressAnim.setValue(0);
          }

          if (textTimerRef.current) {
            clearTimeout(textTimerRef.current);
            textTimerRef.current = null;
          }

          return prev - 1;
        } else {
          onClose();
          return prev;
        }
      });
    }, [hasTextStory, progressAnim, textProgressAnim, onClose]);

    const handleNextStory = useCallback(() => {
      const totalStories = hasTextStory && hasVideo ? 2 : 1;
      setCurrentStoryIndex(prev => {
        if (prev < totalStories - 1) {
          if (prev === (hasTextStory ? 1 : 0)) {
            progressAnim.setValue(0);
          } else if (prev === 0 && hasTextStory) {
            textProgressAnim.setValue(0);
          }

          if (textTimerRef.current) {
            clearTimeout(textTimerRef.current);
            textTimerRef.current = null;
          }

          return prev + 1;
        } else {
          onClose();
          return prev;
        }
      });
    }, [hasTextStory, hasVideo, progressAnim, textProgressAnim, onClose]);

    const handleScreenPress = useCallback(
      (event: GestureResponderEvent) => {
        console.log('screen pressed');
        event.stopPropagation?.();
        // In recording mode, don't navigate - just pause/play
        if (isRecording) {
          setIsPaused(prev => !prev);
          return;
        }

        const { locationX } = event.nativeEvent;
        const screenWidth = SCREEN_WIDTH;
        const leftHalf = screenWidth / 2;

        if (locationX < leftHalf) {
          handlePreviousStory();
        } else {
          handleNextStory();
        }
      },
      [handlePreviousStory, handleNextStory, isRecording],
    );

    const currentStory = stories[currentStoryIndex];
    const isTextStory = currentStory === 'text';
    const isVideoStory = currentStory === 'video';

    return (
      <>
        {preloadUrl && !visible && (
          <Video
            ref={preloadVideoRef}
            source={{ uri: preloadUrl }}
            style={styles.hiddenVideo}
            paused={true}
            muted={true}
            repeat={isRecursive}
          />
        )}

        {visible && (
          <View style={styles.container}>
            <StatusBar hidden />

            {isTextStory && messageText && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.textStoryContainer}
                onPress={handleScreenPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                {filterImageUrl ? (
                  <Image
                    source={{ uri: filterImageUrl }}
                    style={styles.filterBackground}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.whiteBackground} />
                )}
                <View style={styles.textOverlay}>
                  <Text
                    style={
                      filterImageUrl
                        ? styles.messageText
                        : styles.messageTextBlack
                    }
                  >
                    {messageText}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

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
                  onReadyForDisplay={handleReadyForDisplay}
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
            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
              {/* Progress Bars */}
              {!isRecording && (
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
              )}

              {/* Header */}
              <View style={styles.header} pointerEvents="box-none">
                {isRecording ? (
                  <View style={styles.profileContainer}>
                    <View style={styles.userInfoContainer}>
                      <Text style={styles.userName}>{userName}</Text>
                      {
                        <Text style={styles.timeAgo} onPress={onRemove}>
                          Remove
                        </Text>
                      }
                    </View>
                  </View>
                ) : (
                  <View style={styles.profileContainer}>
                    <Image source={profileImage} style={styles.profileImage} />
                    <View style={styles.userInfoContainer}>
                      <Text style={styles.userName}>{userName}</Text>
                      {timeAgo && <Text style={styles.timeAgo}>{timeAgo}</Text>}
                    </View>
                  </View>
                )}
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

            {isRecording && videoDuration > 0 && (
              <VideoTrimmer
                videoDuration={videoDuration}
                onTrimChange={handleTrimChange}
                isRecording={isRecording}
                currentProgress={progressAnim}
              />
            )}

            {/* Loading Indicator */}
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
  messageTextBlack: {
    fontSize: scaleWithMax(24, 28),
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  whiteBackground: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
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
