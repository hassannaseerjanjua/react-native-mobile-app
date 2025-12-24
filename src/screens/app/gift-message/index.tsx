import {
  Image,
  FlatList,
  StatusBar,
  View,
  TouchableOpacity,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  InteractionManager,
  Animated,
  InputAccessoryView,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { Video } from 'react-native-compressor';
import useStyles from './style';
import HomeHeader from '../../../components/global/HomeHeader';
import {
  CameraIcon,
  SvgGalleryIcon,
  SvgGalleryUploadIcon,
  SvgAddGiftMessageIcon,
  SvgProfileCrossIcon,
} from '../../../assets/icons';
import CustomButton from '../../../components/global/Custombutton';
import ParentView from '../../../components/app/ParentView';
import InputField from '../../../components/global/InputField';
import { Text } from '../../../utils/elements';
import { AppStackScreen } from '../../../types/navigation.types';
import { useLocaleStore } from '../../../store/reducer/locale';
import {
  rtlPosition,
  scaleWithMax,
  rtlMargin,
  fileUriWrapper,
} from '../../../utils';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import {
  GiftFilter,
  CartResponse,
  fetchApiResponse,
} from '../../../types/index';
import SkeletonLoader from '../../../components/SkeletonLoader';
import api from '../../../utils/api';
import notify from '../../../utils/notify';
import {
  setVideoUploadPromise,
  clearVideoUploadPromise,
} from '../../../utils/videoUploadState';
import {
  setPendingVideoPath,
  cacheVideoPath,
  clearPendingVideoPath,
} from '../../../utils/videoCache';
import ConfirmationModal from '../../../components/global/ConfirmationModal';
import { useVisionCamera } from '../../../hooks/useCamera';
import { Camera } from 'react-native-vision-camera';
import VideoStoryViewer from '../../../components/global/VideoStoryViewer';
import Svg, { Circle } from 'react-native-svg';
import {
  saveGiftMessageData,
  loadGiftMessageData,
} from '../../../utils/giftMessageStorage';
import ViewTrimmer from '../../../components/app/ViewTrimmer';
import { useAuthStore } from '../../../store/reducer/auth';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MAX_VIDEO_DURATION = 15;

const GiftMessage: React.FC<AppStackScreen<'GiftMessage'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const {
    friendUserId,
    storeBranchId,
    orderId: routeOrderId,
  } = route.params as any;
  const [message, setMessage] = useState('');
  const [isLoadingSavedData, setIsLoadingSavedData] = useState(false);
  const [orderId, setOrderId] = useState<number | undefined>(routeOrderId);

  const getAllFiltersApi = useGetApi<GiftFilter[]>(
    apiEndpoints.GET_ALL_FILTERS,
    {
      transformData: (data: any) => data.Data?.Items || data.Data || [],
    },
  );

  // Fetch cart to get orderId if not provided in route params
  const cartApi = useGetApi<CartResponse>(
    !routeOrderId ? apiEndpoints.GET_CART_ITEMS : '',
    {
      transformData: (data: any) => {
        const cartData = (data?.Data || data) as CartResponse;
        if (cartData?.OrderId && !routeOrderId) {
          setOrderId(cartData.OrderId);
        }
        return cartData;
      },
    },
  );

  // Update orderId when route params change
  useEffect(() => {
    if (routeOrderId) {
      setOrderId(routeOrderId);
    }
  }, [routeOrderId]);

  const [sendMessagePayload, setSendMessagePayload] = useState<{
    ImageFilterId: number | null;
    Message: string;
    VideoFile: any;
  }>({
    ImageFilterId: null,
    Message: message,
    VideoFile: undefined,
  });
  const [videoViewerData, setVideoViewerData] = useState<{
    visible: boolean;
    videoUrl: string;
    profileImage: any;
    userName: string;
    timeAgo: string;
    filterImageUrl?: string | null;
    messageText?: string | null;
  }>({
    visible: false,
    videoUrl: '',
    profileImage: null,
    userName: '',
    timeAgo: '',
    filterImageUrl: null,
    messageText: null,
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [originalVideoPath, setOriginalVideoPath] = useState<string | null>(
    null,
  );
  const [isVideoLongerThan15Seconds, setIsVideoLongerThan15Seconds] =
    useState(false);
  const [isVideoCancelled, setIsVideoCancelled] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const { token } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const videoViewerRef = useRef<{ preload: (url: string) => void } | null>(
    null,
  );

  // Animation for recording progress
  const recordingProgress = useRef(new Animated.Value(0)).current;

  const {
    recordVideo,
    cameraRef,
    device,
    timer,
    isCameraActive,
    cancelRecording,
    requestPermission,
    toggleCamera,
    cameraPosition,
  } = useVisionCamera();
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const inputAccessoryViewID = 'giftMessageDoneButton';
  const [isFlashOn, setIsFlashOn] = useState(false);

  // Reset flash when switching cameras
  useEffect(() => {
    if (cameraPosition === 'front') {
      setIsFlashOn(false);
    }
  }, [cameraPosition]);

  // Cleanup: Ensure timer is stopped when camera is closed
  useEffect(() => {
    if (!showCamera && isRecording) {
      setIsRecording(false);
      recordingProgress.setValue(0);
    }
  }, [showCamera, isRecording]);

  // Load saved data when orderId is available
  useEffect(() => {
    const loadSavedData = async () => {
      if (orderId) {
        setIsLoadingSavedData(true);
        try {
          const savedData = await loadGiftMessageData(orderId);
          if (savedData) {
            setMessage(savedData.Message || '');
            setSendMessagePayload({
              ImageFilterId: savedData.ImageFilterId,
              Message: savedData.Message || '',
              VideoFile: savedData.VideoFile,
            });
            // if (savedData.VideoFile?.uri) {
            //   setSelectedVideo(savedData.VideoFile.uri);
            // } commented becuase the video was auto opening
          }
        } catch (error) {
          console.error('[GiftMessage] Error loading saved data:', error);
        } finally {
          setIsLoadingSavedData(false);
        }
      }
    };

    loadSavedData();
  }, [orderId]);

  // Save data whenever it changes (if orderId is present)
  useEffect(() => {
    const saveData = async () => {
      if (orderId && !isLoadingSavedData) {
        try {
          await saveGiftMessageData(orderId, {
            ImageFilterId: sendMessagePayload.ImageFilterId,
            Message: sendMessagePayload.Message,
            VideoFile: sendMessagePayload.VideoFile,
          });
        } catch (error) {
          console.error('[GiftMessage] Error saving data:', error);
        }
      }
    };

    // Debounce saving to avoid too many writes
    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [sendMessagePayload, orderId, isLoadingSavedData]);

  useEffect(() => {
    setSendMessagePayload(prev => ({
      ...prev,
      Message: message,
    }));
  }, [message]);
  console.log('sendMessagePayload', sendMessagePayload);
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const paddedMins = String(mins).padStart(2, '0');
    const paddedSecs = String(secs).padStart(2, '0');

    return `${paddedMins}:${paddedSecs}`;
  }
  const handleButtonPress = async () => {
    if (!hasContent && !sendMessagePayload.VideoFile) {
      (navigation as any).navigate('CheckOut', {
        friendUserId,
        storeBranchId,
        isVideoUploading: !!sendMessagePayload.VideoFile,
      });
      return;
    }
    if (isCompressing) {
      notify.error(getString('GIFT_MESSAGE_PLEASE_WAIT_VIDEO'));
      return;
    }

    // Store local video path for caching
    const localVideoPath = sendMessagePayload.VideoFile?.uri || null;
    if (localVideoPath) {
      setPendingVideoPath(localVideoPath);
    }

    // Always call API, even if no content (video is optional)
    const uploadPromise = (async () => {
      try {
        const formData = new FormData();
        formData.append(
          'ImageFilterId',
          sendMessagePayload.ImageFilterId?.toString() || '',
        );
        formData.append('Message', message || '');
        // Video is optional - only append if it exists
        if (sendMessagePayload.VideoFile) {
          formData.append('VideoFile', sendMessagePayload.VideoFile);
        }

        console.log('[GiftMessage] Sending gift message data...', {
          ImageFilterId: sendMessagePayload.ImageFilterId,
          Message: message,
          hasVideo: !!sendMessagePayload.VideoFile,
        });
        const response = await api.post(
          apiEndpoints.SEND_GIFT_FILTER,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (response.success) {
          console.log('[GiftMessage] Gift message sent successfully');

          // Cache the video path if server URL is in response
          const responseData = response.data as any;
          const serverVideoUrl =
            responseData?.Data?.ImageUrl || responseData?.ImageUrl;
          if (serverVideoUrl && localVideoPath) {
            await cacheVideoPath(serverVideoUrl, localVideoPath);
          }

          return { success: true, serverVideoUrl };
        } else {
          console.error(
            '[GiftMessage] Failed to send gift message:',
            response.error,
          );
          clearPendingVideoPath();
          notify.error(
            response.error || getString('GIFT_MESSAGE_FAILED_TO_SEND'),
          );
          return { success: false, error: response.error };
        }
      } catch (error: any) {
        console.error('[GiftMessage] Error sending gift message:', error);
        clearPendingVideoPath();
        notify.error(
          error?.message || getString('GIFT_MESSAGE_ERROR_WHILE_SENDING'),
        );
        return { success: false, error: error?.message };
      } finally {
        clearVideoUploadPromise();
      }
    })();

    // Store the promise so checkout can wait for it
    // Only wait if there's a video file (large file upload)
    // For text/filter only, API call is quick so we don't need to wait
    if (sendMessagePayload.VideoFile) {
      setVideoUploadPromise(uploadPromise);
    } else {
      // No video - API call is quick, don't wait in checkout
      clearVideoUploadPromise();
    }

    // Save data before navigating
    if (orderId) {
      await saveGiftMessageData(orderId, sendMessagePayload);
    }

    // Navigate to checkout
    // isVideoUploading should be true only if there's a video file to upload
    (navigation as any).navigate('CheckOut', {
      friendUserId,
      storeBranchId,
      isVideoUploading: !!sendMessagePayload.VideoFile,
    });
  };

  const compressVideo = async (
    videoUri: string,
    fileName: string,
    autoOpenTrim: boolean = false,
  ) => {
    console.log('[GiftMessage] Starting video compression:', {
      videoUri,
      autoOpenTrim,
    });
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const compressionOptions =
        Platform.OS === 'android'
          ? {
              // Use auto compression for Android camera videos for better compatibility
              compressionMethod: 'auto' as const,
            }
          : {
              compressionMethod: 'manual' as const,
              maxSize: 720, // Reduced from 1920 for smaller file size
              bitrate: 1000000, // 1 Mbps for better compression
              minimumFileSizeForCompress: 0,
            };

      const compressedUri = await Video.compress(
        videoUri,
        compressionOptions,
        progress => {
          console.log('[GiftMessage] Compression progress:', progress);
          setCompressionProgress(progress);
        },
      );

      console.log('[GiftMessage] Video compressed successfully:', {
        originalUri: videoUri,
        compressedUri: compressedUri,
      });

      const processedUri =
        Platform.OS === 'ios'
          ? compressedUri.replace('file://', '')
          : compressedUri;

      const videoFile = {
        uri: fileUriWrapper(processedUri),
        type: 'video/mp4',
        name: fileName || `video_${Date.now()}.mp4`,
      };
      setSendMessagePayload(prev => {
        const updated = {
          ...prev,
          VideoFile: videoFile,
        };
        // Save data after video compression
        if (orderId) {
          saveGiftMessageData(orderId, updated);
        }
        return updated;
      });

      // Auto-open trim screen if video is longer than 15 seconds
      if (autoOpenTrim) {
        console.log('[GiftMessage] Auto-opening trim screen for long video');
        setOriginalVideoPath(fileUriWrapper(processedUri));
        setIsVideoLongerThan15Seconds(true);
        setSelectedVideo(fileUriWrapper(processedUri));
      }
    } catch (error: any) {
      console.error('[GiftMessage] Video compression failed:', error);
      notify.error(getString('GIFT_MESSAGE_FAILED_TO_PROCESS_VIDEO'));
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handleVideoSelect = () => {
    if (isCompressing) {
      notify.error(getString('GIFT_MESSAGE_PLEASE_WAIT_VIDEO'));
      return;
    }

    // Close popup first
    setPopupVisible(false);

    // Wait for modal to fully close and interactions to complete
    // before opening the native image picker
    InteractionManager.runAfterInteractions(() => {
      launchImageLibrary(
        {
          mediaType: 'video',
          quality: 1,
          selectionLimit: 1,
          videoQuality: 'high',
        },
        async response => {
          if (response.didCancel) {
            console.log('[GiftMessage] User cancelled video selection');
            return;
          }

          if (response.errorMessage) {
            console.error(
              '[GiftMessage] Image picker error:',
              response.errorMessage,
            );
            notify.error(response.errorMessage);
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            const duration = asset.duration || 0;

            console.log('[GiftMessage] Video selected:', {
              uri: asset.uri,
              duration: duration,
              fileSize: asset.fileSize,
              type: asset.type,
              fileName: asset.fileName,
            });

            const videoUri = asset.uri || '';
            const fileName = asset.fileName || `video_${Date.now()}.mp4`;

            // Check if video is longer than 15 seconds
            const shouldAutoTrim = duration > MAX_VIDEO_DURATION;
            if (shouldAutoTrim) {
              console.log(
                `[GiftMessage] Video is ${duration}s, will auto-open trim screen`,
              );
            }

            // Compress the video before setting it
            await compressVideo(videoUri, fileName, shouldAutoTrim);
          }
        },
      );
    });
  };

  const handleOpenPopup = useCallback(() => {
    // Always show popup - content changes based on whether video exists
    setPopupVisible(true);
  }, []);

  const hasContent =
    sendMessagePayload.ImageFilterId !== null ||
    message.trim().length > 0 ||
    !!sendMessagePayload.VideoFile;

  const filters = getAllFiltersApi.data || [];

  // Find the selected filter for background
  const selectedFilter = filters.find(
    filter => filter.FilterId === sendMessagePayload.ImageFilterId,
  );

  useEffect(() => {
    console.log('📹 Camera State:', {
      showCamera,
      isCameraActive,
      hasDevice: !!device,
      hasCameraRef: !!cameraRef.current,
    });
  }, [showCamera, isCameraActive, device, cameraRef.current]);

  // Play/Pause Icon Components for camera recording
  const PauseIcon = ({
    size = 24,
    color = '#FFFFFF',
  }: {
    size?: number;
    color?: string;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.25,
          height: size * 0.7,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />
      <View
        style={{
          width: size * 0.25,
          height: size * 0.7,
          backgroundColor: color,
          borderRadius: 2,
          marginLeft: size * 0.25,
        }}
      />
    </View>
  );

  const PlayIcon = ({
    size = 24,
    color = '#FFFFFF',
  }: {
    size?: number;
    color?: string;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: size * 0.6,
          borderTopWidth: size * 0.35,
          borderBottomWidth: size * 0.35,
          borderLeftColor: color,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          marginLeft: 3,
        }}
      />
    </View>
  );

  if (selectedVideo) {
    return (
      <ViewTrimmer
        videoUrl={selectedVideo}
        onSaveVideo={trimmedPath => {
          const videoFile = {
            uri: fileUriWrapper(trimmedPath),
            type: 'video/mp4',
            name:
              sendMessagePayload.VideoFile?.name || `video_${Date.now()}.mp4`,
          };

          setSendMessagePayload(prev => {
            const updated = { ...prev, VideoFile: videoFile };
            if (orderId) {
              saveGiftMessageData(orderId, updated);
            }
            return updated;
          });

          setOriginalVideoPath(null);
          setIsVideoLongerThan15Seconds(false);
          setSelectedVideo(null);
          setShowCamera(false);
        }}
        onCancel={() => {
          // Only remove video on cancel if it was originally longer than 15 seconds
          if (isVideoLongerThan15Seconds) {
            // Video is longer than 15 seconds - remove it on cancel
            setSendMessagePayload(prev => {
              const updated = { ...prev, VideoFile: undefined };
              if (orderId) {
                saveGiftMessageData(orderId, updated);
              }
              return updated;
            });
          } else {
            // Video is 15 seconds or less - save the full video on cancel
            if (selectedVideo) {
              const videoFile = {
                uri: fileUriWrapper(selectedVideo),
                type: 'video/mp4',
                name:
                  sendMessagePayload.VideoFile?.name ||
                  `video_${Date.now()}.mp4`,
              };

              setSendMessagePayload(prev => {
                const updated = { ...prev, VideoFile: videoFile };
                if (orderId) {
                  saveGiftMessageData(orderId, updated);
                }
                return updated;
              });
            }
          }
          setOriginalVideoPath(null);
          setIsVideoLongerThan15Seconds(false);
          setSelectedVideo(null);
          setShowCamera(false);
        }}
      />
    );
  }

  return (
    <ParentView style={styles.container}>
      {device && showCamera ? (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {isCameraActive ? (
            <>
              <Camera
                ref={cameraRef}
                style={{ flex: 1 }}
                isActive={isCameraActive}
                device={device}
                video={true}
                audio={true}
                torch={isFlashOn ? 'on' : 'off'}
                onInitialized={() => {
                  console.log('✅ Camera initialized and ready');
                  // Don't auto-start recording - wait for button press
                }}
                onError={error => {
                  console.error('❌ Camera error:', error);
                  Alert.alert('Camera Error', error.message);
                  setShowCamera(false);
                }}
              />
              {/* Close Button - Top Left - Hide when recording */}
              {!isRecording && (
                <TouchableOpacity
                  onPress={() => {
                    console.log('🛑 Close button pressed - discarding video');
                    if (recordingTimerRef.current) {
                      clearInterval(recordingTimerRef.current);
                      recordingTimerRef.current = null;
                    }
                    setIsVideoCancelled(true);
                    cancelRecording();
                    setShowCamera(false);
                    setIsRecording(false);
                    recordingProgress.setValue(0);
                    setRecordingTime(0);
                  }}
                  style={styles.doneButtonContainer}
                  activeOpacity={0.7}
                >
                  <View style={styles.crossBackground}>
                    <Image
                      source={require('../../../assets/close.png')}
                      style={styles.closeButtonIcon}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              )}

              {/* Timer Display - Top Center */}
              {isRecording && (
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerText}>
                    {Math.floor(recordingTime / 60)}:
                    {(recordingTime % 60).toString().padStart(2, '0')} /{' '}
                    {MAX_VIDEO_DURATION}s
                  </Text>
                </View>
              )}

              {/* Flash Button - Top Right - Only show for back camera and when not recording */}
              {cameraPosition === 'back' && !isRecording && (
                <TouchableOpacity
                  onPress={() => {
                    setIsFlashOn(prev => !prev);
                  }}
                  style={styles.flashButton}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.flashButtonBackground,
                      isFlashOn && styles.flashButtonBackgroundActive,
                    ]}
                  >
                    <Image
                      source={require('../../../assets/images/flash.png')}
                      style={styles.flashButtonIcon}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              )}

              {/* Recording Button with Progress Border and Flip Button */}
              <View style={styles.recordButtonContainer}>
                <View style={styles.recordButtonWrapper}>
                  <TouchableOpacity
                    onPress={() => {
                      if (!isRecording) {
                        console.log(
                          '🎥 Record button pressed - starting recording',
                        );
                        setIsRecording(true);
                        setRecordingTime(0);

                        // Start timer for display
                        if (recordingTimerRef.current) {
                          clearInterval(recordingTimerRef.current);
                        }
                        recordingTimerRef.current = setInterval(() => {
                          setRecordingTime(prev => {
                            const next = prev + 1;
                            if (next >= MAX_VIDEO_DURATION) {
                              clearInterval(recordingTimerRef.current);
                              recordingTimerRef.current = null;
                            }
                            return next;
                          });
                        }, 1000);

                        // Animate progress border over 15 seconds
                        Animated.timing(recordingProgress, {
                          toValue: 1,
                          duration: MAX_VIDEO_DURATION * 1000,
                          useNativeDriver: false,
                        }).start();

                        // Start actual video recording
                        recordVideo(
                          {
                            onRecordingFinished: video => {
                              console.log('Recording finished:', video);
                              setIsRecording(false);
                              recordingProgress.setValue(0);
                              setRecordingTime(0);
                              if (recordingTimerRef.current) {
                                clearInterval(recordingTimerRef.current);
                                recordingTimerRef.current = null;
                              }

                              // Handle the recorded video
                              if (isVideoCancelled) {
                                setIsVideoCancelled(false);
                                setShowCamera(false);
                                return;
                              }

                              console.log('Video recorded:', video);
                              setShowCamera(false);

                              if (!video?.path) {
                                notify.error(getString('AU_ERROR_OCCURRED'));
                                return;
                              }

                              // Handle video path correctly for both platforms
                              // On Android, path might already include file:// or might not need it
                              let videoUri = video.path;
                              if (Platform.OS === 'android') {
                                // Ensure proper URI format for Android
                                if (
                                  !videoUri.startsWith('file://') &&
                                  !videoUri.startsWith('content://')
                                ) {
                                  videoUri = 'file://' + videoUri;
                                }
                                // Add a small delay on Android to ensure video file is fully finalized
                                setTimeout(() => {
                                  compressVideo(
                                    videoUri,
                                    `video_${Date.now()}.mp4`,
                                  );
                                }, 500);
                              } else {
                                // iOS format
                                videoUri = 'file://' + videoUri;
                                compressVideo(
                                  videoUri,
                                  `video_${Date.now()}.mp4`,
                                );
                              }
                            },
                            onRecordingError: error => {
                              console.error('Recording error:', error);
                              setIsRecording(false);
                              recordingProgress.setValue(0);
                              setRecordingTime(0);
                              if (recordingTimerRef.current) {
                                clearInterval(recordingTimerRef.current);
                                recordingTimerRef.current = null;
                              }
                              notify.error(
                                getString('GIFT_MESSAGE_RECORDING_FAILED'),
                              );
                            },
                          },
                          MAX_VIDEO_DURATION,
                        );
                      } else {
                        // Stop recording manually
                        console.log('⏹ Stop button pressed');
                        if (recordingTimerRef.current) {
                          clearInterval(recordingTimerRef.current);
                          recordingTimerRef.current = null;
                        }
                        cancelRecording();
                        setIsRecording(false);
                        recordingProgress.setValue(0);
                        setRecordingTime(0);
                        setShowCamera(false);
                      }
                    }}
                    activeOpacity={0.8}
                    style={styles.recordButton}
                  >
                    {/* Animated Progress Border - Circular fill using SVG */}
                    {isRecording && (
                      <Animated.View
                        style={{
                          position: 'absolute',
                          width: scaleWithMax(70, 80),
                          height: scaleWithMax(70, 80),
                        }}
                      >
                        <Svg
                          width={scaleWithMax(70, 80)}
                          height={scaleWithMax(70, 80)}
                          style={{ transform: [{ rotate: '-90deg' }] }}
                        >
                          {/* Background circle */}
                          <Circle
                            cx={scaleWithMax(35, 40)}
                            cy={scaleWithMax(35, 40)}
                            r={scaleWithMax(33, 38)}
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="4"
                            fill="transparent"
                          />
                          {/* Progress circle */}
                          <AnimatedCircle
                            cx={scaleWithMax(35, 40)}
                            cy={scaleWithMax(35, 40)}
                            r={scaleWithMax(33, 38)}
                            stroke="#FF0000"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={`${
                              2 * Math.PI * scaleWithMax(33, 38)
                            }`}
                            strokeDashoffset={recordingProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [
                                2 * Math.PI * scaleWithMax(33, 38),
                                0,
                              ],
                            })}
                            strokeLinecap="round"
                          />
                        </Svg>
                      </Animated.View>
                    )}

                    {/* Inner Button */}
                    <View
                      style={
                        isRecording
                          ? styles.recordButtonInnerRecording
                          : styles.recordButtonInner
                      }
                    />
                  </TouchableOpacity>
                </View>
                {/* Flip Button - Hide when recording */}
                {!isRecording && (
                  <TouchableOpacity
                    onPress={() => {
                      toggleCamera();
                    }}
                    style={styles.flipButton}
                    activeOpacity={0.7}
                  >
                    <View style={styles.flipButtonBackground}>
                      <Image
                        source={require('../../../assets/images/flip-icon.png')}
                        style={styles.flipButtonIcon}
                        resizeMode="cover"
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color="#F08080" />
              <Text style={{ color: '#FFF', marginTop: 16 }}>
                Loading Camera...
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <StatusBar
            backgroundColor={theme.colors.BACKGROUND}
            barStyle="dark-content"
          />
          <VideoStoryViewer
            ref={videoViewerRef}
            visible={selectedVideo !== null}
            videoUrl={selectedVideo ?? ''}
            profileImage={videoViewerData.profileImage}
            userName={videoViewerData.userName}
            isRecursive
            onRemove={() => {
              setSendMessagePayload({
                ...sendMessagePayload,
                VideoFile: undefined,
              });
              setSelectedVideo(null);
            }}
            timeAgo={videoViewerData.timeAgo}
            filterImageUrl={videoViewerData.filterImageUrl}
            messageText={videoViewerData.messageText}
            onClose={() => setSelectedVideo(null)}
          />
          <ConfirmationModal
            key={popupVisible ? 'open' : 'closed'}
            visible={popupVisible}
            title={
              sendMessagePayload.VideoFile
                ? getString('GIFT_MESSAGE_VIDEO_OPTIONS')
                : getString('GIFT_MESSAGE_SELECT')
            }
            message={
              sendMessagePayload.VideoFile
                ? getString('GIFT_MESSAGE_CHOOSE_VIDEO_ACTION')
                : getString('GIFT_MESSAGE_SELECT_VIDEO_SOURCE')
            }
            confirmText={
              sendMessagePayload.VideoFile
                ? getString('GIFT_MESSAGE_TRIM_VIDEO')
                : getString('GIFT_MESSAGE_FROM_GALLERY')
            }
            cancelText={
              sendMessagePayload.VideoFile
                ? getString('GIFT_MESSAGE_RETAKE_VIDEO')
                : getString('GIFT_MESSAGE_FROM_CAMERA')
            }
            onConfirm={() => {
              setPopupVisible(false);
              if (sendMessagePayload.VideoFile) {
                // Trim video - open ViewTrimmer
                // Don't set isVideoLongerThan15Seconds here since this is manual trim (video might be <= 15s)
                setOriginalVideoPath(sendMessagePayload.VideoFile.uri);
                setSelectedVideo(sendMessagePayload.VideoFile.uri);
              } else {
                // Select from gallery
                handleVideoSelect();
              }
            }}
            onCancel={() => setPopupVisible(false)}
            onbtn2Press={async () => {
              // Close the popup first
              setPopupVisible(false);

              if (sendMessagePayload.VideoFile) {
                // Retake video - clear existing and open camera
                setSendMessagePayload({
                  ...sendMessagePayload,
                  VideoFile: undefined,
                });
              }

              // Request camera permissions first
              await requestPermission();

              // Then show camera - recording will start when user presses the button
              setShowCamera(true);
            }}
            loading={false}
          />

          <HomeHeader
            title={getString('GIFT_MESSAGE_TITLE')}
            showBackButton={true}
            onBackPress={() => {
              navigation.goBack();
            }}
          />
          <View style={styles.content}>
            <View style={styles.body}>
              <View style={styles.messageContainer}>
                <View style={styles.inputWrapper} pointerEvents="box-none">
                  {/* Filter background with low opacity */}
                  {selectedFilter && (
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <Image
                        source={{ uri: selectedFilter.ImageUrl }}
                        style={styles.filterBackground}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  <View
                    style={styles.textInputWrapper}
                    pointerEvents="box-none"
                  >
                    <InputField
                      fieldProps={{
                        multiline: true,
                        maxLength: 100,
                        value: message,
                        onChangeText: setMessage,
                        placeholder: getString('GIFT_MESSAGE_PLACEHOLDER'),
                        inputAccessoryViewID:
                          Platform.OS === 'ios'
                            ? inputAccessoryViewID
                            : undefined,
                        style: [
                          styles.textInput,
                          selectedFilter?.TextColor && {
                            color: selectedFilter.TextColor,
                          },
                        ],
                      }}
                      style={styles.inputFieldContainer}
                    />
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    handleOpenPopup();
                  }}
                  style={{
                    position: 'absolute',
                    bottom: scaleWithMax(5, 6),
                    [isRtl ? 'left' : 'right']: scaleWithMax(20, 25),
                    zIndex: 1000,
                    width: scaleWithMax(50, 60),
                    height: scaleWithMax(50, 60),
                  }}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  android_ripple={{
                    color: 'rgba(0, 0, 0, 0.1)',
                    borderless: false,
                    radius: 50,
                  }}
                >
                  {isCompressing ? (
                    <View
                      pointerEvents="none"
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.PRIMARY}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          color: theme.colors.PRIMARY,
                          marginTop: 2,
                        }}
                      >
                        {Math.round(compressionProgress * 100)}%
                      </Text>
                    </View>
                  ) : (
                    <View
                      pointerEvents="none"
                      style={{
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <SvgAddGiftMessageIcon />
                      {/* Badge when video is added */}
                      {sendMessagePayload.VideoFile && (
                        <View
                          pointerEvents="none"
                          style={{
                            position: 'absolute',
                            top: scaleWithMax(2, 4),

                            [isRtl ? 'left' : 'right']: scaleWithMax(6, 8),
                            width: scaleWithMax(14, 16),
                            height: scaleWithMax(14, 16),
                            borderRadius: scaleWithMax(10, 11),
                            backgroundColor: '#FF0000',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={styles.videoBadgeText}>1</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
              </View>

              <View style={styles.filtersWrapper}>
                <Text style={styles.sectionTitle}>
                  {getString('GIFT_MESSAGE_FILTER')}
                </Text>
                {getAllFiltersApi.loading ? (
                  <SkeletonLoader screenType="giftFilters" />
                ) : (
                  <FlatList
                    data={filters}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.FilterId.toString()}
                    renderItem={({ item: filter, index }) => (
                      <View
                        style={[
                          styles.imageContainer,
                          index === 0
                            ? { marginLeft: theme.sizes.PADDING }
                            : {},
                        ]}
                      >
                        <TouchableOpacity
                          onPress={async () => {
                            const newFilterId =
                              sendMessagePayload.ImageFilterId ===
                              filter.FilterId
                                ? null
                                : filter.FilterId;
                            setSendMessagePayload(prev => ({
                              ...prev,
                              ImageFilterId: newFilterId,
                            }));
                            // Save data when filter changes
                            if (orderId) {
                              await saveGiftMessageData(orderId, {
                                ImageFilterId: newFilterId,
                                Message: sendMessagePayload.Message,
                                VideoFile: sendMessagePayload.VideoFile,
                              });
                            }
                          }}
                        >
                          <Image
                            style={[
                              styles.filterImage,
                              {
                                borderWidth:
                                  filter.FilterId ===
                                  sendMessagePayload.ImageFilterId
                                    ? 2
                                    : 0,
                                borderColor: theme.colors.PRIMARY,
                              },
                            ]}
                            source={{ uri: filter.ImageUrl }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    ListEmptyComponent={
                      <View style={styles.imageContainer}>
                        <Text>No filters available</Text>
                      </View>
                    }
                    contentContainerStyle={styles.filtersScrollContent}
                  />
                )}
              </View>
            </View>
            <View style={styles.footer}>
              <CustomButton
                title={hasContent ? 'Next' : 'Skip'}
                onPress={handleButtonPress}
                disabled={isCompressing}
              />
            </View>
          </View>

          {/* iOS Input Accessory - Done Button */}
          {Platform.OS === 'ios' && (
            <InputAccessoryView nativeID={inputAccessoryViewID}>
              <View style={styles.inputAccessory}>
                <TouchableOpacity
                  onPress={() => {
                    // Dismiss keyboard - blur is not directly available, use Keyboard.dismiss
                    const { Keyboard } = require('react-native');
                    Keyboard.dismiss();
                  }}
                  style={styles.doneButton}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </InputAccessoryView>
          )}
        </View>
      )}
    </ParentView>
  );
};

export default GiftMessage;
