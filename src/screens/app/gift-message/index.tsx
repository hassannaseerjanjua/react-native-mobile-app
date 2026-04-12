import {
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
  StyleSheet,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { Video } from 'react-native-compressor';
import useStyles from './style';
import HomeHeader from '../../../components/global/HomeHeader';
import {
  CameraIcon,
  SvgGalleryIcon,
  SvgGalleryUploadIcon,
  SvgAddGiftMessageIcon,
} from '../../../assets/icons';
import CustomButton from '../../../components/global/Custombutton';
import ParentView from '../../../components/app/ParentView';
import ShadowView from '../../../components/global/ShadowView';
import InputField from '../../../components/global/InputField';
import { Text, Image } from '../../../utils/elements';
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
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
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
import Svg, { Circle, Path } from 'react-native-svg';
import {
  saveGiftMessageData,
  loadGiftMessageData,
} from '../../../utils/giftMessageStorage';
import ViewTrimmer from '../../../components/app/ViewTrimmer';
import { useAuthStore } from '../../../store/reducer/auth';
import ConfettiFilterSvg from '../../../assets/images/confetti-filter.svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MAX_VIDEO_DURATION = 15;
const CONFETTI_FILTER_ID = -1;
const GIFT_MESSAGE_TEXT_MIN_LEN = 3;
const GIFT_MESSAGE_TEXT_MAX_LEN = 100;

const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 9 9" fill="none">
    <Path
      d="M1.70005 7.99976L1.00005 7.29976L3.80005 4.49976L1.00005 1.69976L1.70005 0.999756L4.50005 3.79976L7.30005 0.999756L8.00005 1.69976L5.20005 4.49976L8.00005 7.29976L7.30005 7.99976L4.50005 5.19976L1.70005 7.99976Z"
      fill="white"
    />
  </Svg>
);

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
  const [giftMessageInputAreaHeight, setGiftMessageInputAreaHeight] =
    useState(0);
  const [filterTextSubmitAttempted, setFilterTextSubmitAttempted] =
    useState(false);
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
            const rawFilterId = savedData.ImageFilterId;
            const hasText = (savedData.Message || '').trim().length > 0;
            const hasVideo = Boolean(savedData.VideoFile);
            // Older builds saved implicit "default" as confetti (-1) with no message/video — treat as no selection.
            const normalizedFilterId =
              rawFilterId === null || rawFilterId === undefined
                ? null
                : rawFilterId === CONFETTI_FILTER_ID && !hasText && !hasVideo
                  ? null
                  : rawFilterId;
            setSendMessagePayload({
              ImageFilterId: normalizedFilterId,
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

  const hasFilterSelected =
    typeof sendMessagePayload.ImageFilterId === 'number';
  const giftMessageMeetsFilterTextRules =
    message.trim().length >= GIFT_MESSAGE_TEXT_MIN_LEN &&
    message.length <= GIFT_MESSAGE_TEXT_MAX_LEN;
  const filterRequiresTextBlocked =
    hasFilterSelected && !giftMessageMeetsFilterTextRules;
  const showFilterTextValidationError =
    filterRequiresTextBlocked && filterTextSubmitAttempted;
  const filterInlineValidationMessage = useMemo(() => {
    if (!showFilterTextValidationError) {
      return '';
    }
    if (message.length > GIFT_MESSAGE_TEXT_MAX_LEN) {
      return getString('GIFT_MESSAGE_FILTER_TEXT_TOO_LONG').replace(
        '{max}',
        String(GIFT_MESSAGE_TEXT_MAX_LEN),
      );
    }
    return getString('GIFT_MESSAGE_FILTER_TEXT_TOO_SHORT').replace(
      '{min}',
      String(GIFT_MESSAGE_TEXT_MIN_LEN),
    );
  }, [
    showFilterTextValidationError,
    message,
    getString,
  ]);
  const isFooterPrimaryDisabled = isCompressing;
  const hasGiftMessageToSubmit =
    message.trim().length > 0 ||
    !!sendMessagePayload.VideoFile ||
    hasFilterSelected;

  useEffect(() => {
    if (!filterRequiresTextBlocked) {
      setFilterTextSubmitAttempted(false);
    }
  }, [filterRequiresTextBlocked]);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const paddedMins = String(mins).padStart(2, '0');
    const paddedSecs = String(secs).padStart(2, '0');

    return `${paddedMins}:${paddedSecs}`;
  }
  const handleButtonPress = async () => {
    if (!hasGiftMessageToSubmit) {
      (navigation as any).navigate('CheckOut', {
        friendUserId,
        storeBranchId,
        isVideoUploading: false,
      });
      return;
    }
    if (isCompressing) {
      notify.error(getString('GIFT_MESSAGE_PLEASE_WAIT_VIDEO'));
      return;
    }

    if (hasFilterSelected) {
      const trimmed = message.trim();
      if (trimmed.length < GIFT_MESSAGE_TEXT_MIN_LEN) {
        setFilterTextSubmitAttempted(true);
        return;
      }
      if (message.length > GIFT_MESSAGE_TEXT_MAX_LEN) {
        setFilterTextSubmitAttempted(true);
        return;
      }
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
        const id = sendMessagePayload.ImageFilterId;
        const imageFilterIdToSend =
          typeof id !== 'number'
            ? ''
            : id === CONFETTI_FILTER_ID
            ? ''
            : String(id);
        formData.append('ImageFilterId', imageFilterIdToSend);
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

    // Navigate (push) to checkout so back from checkout returns to GiftMessage
    // isVideoUploading should be true only if there's a video file to upload
    (navigation as any).navigate('CheckOut', {
      friendUserId,
      storeBranchId,
      isVideoUploading: !!sendMessagePayload.VideoFile,
    });
  };

  const compressVideo = async (videoUri: string, fileName: string) => {
    // Normalize the video URI to ensure proper format for Video.compress
    let normalizedUri = videoUri;

    // For Android content:// URIs, keep as is
    if (Platform.OS === 'android' && normalizedUri.startsWith('content://')) {
      // Keep content:// URI as is
    } else {
      // For file paths, normalize:
      // Remove file:// prefix if present (Video.compress handles paths without it)
      if (normalizedUri.startsWith('file://')) {
        normalizedUri = normalizedUri.replace('file://', '');
      }

      // Ensure absolute path (add leading slash if missing)
      if (
        !normalizedUri.startsWith('/') &&
        !normalizedUri.startsWith('content://')
      ) {
        normalizedUri = '/' + normalizedUri;
      }
    }

    console.log('[GiftMessage] Starting video compression:', {
      originalUri: videoUri,
      normalizedUri,
      platform: Platform.OS,
    });
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      // Dynamic compression settings for 1080p resolution
      // Target: 1080p (1920x1080) with optimized bitrate for smaller file size
      // Bitrate: 2.5 Mbps - good balance between quality and file size for 1080p
      const compressionOptions =
        Platform.OS === 'android'
          ? {
              // Android: Use manual compression for consistent 1080p output
              compressionMethod: 'manual' as const,
              maxSize: 1080, // 1080p resolution (1920x1080)
              bitrate: 2500000, // 2.5 Mbps - optimized for 1080p quality
              minimumFileSizeForCompress: 0,
            }
          : {
              // iOS: Manual compression with 1080p target
              compressionMethod: 'manual' as const,
              maxSize: 1080, // 1080p resolution (1920x1080)
              bitrate: 2500000, // 2.5 Mbps - optimized for 1080p quality
              minimumFileSizeForCompress: 0,
            };

      const compressedUri = await Video.compress(
        normalizedUri,
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

      // Note: Trim screen is now opened before compression
      // This function only compresses (called from trim screen's onSaveVideo)
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
          selectionLimit: 1,
          // Don't set videoQuality - this prevents transcoding and returns the original video instantly
          // Compression will be applied later when saving from trim screen
          assetRepresentationMode: 'current', // iOS: Use original asset without conversion
          formatAsMp4: false, // iOS: Don't convert to MP4 (we'll compress later)
        },
        response => {
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

            console.log('[GiftMessage] Video selected from gallery:', {
              uri: asset.uri,
              duration: duration,
              fileSize: asset.fileSize,
              type: asset.type,
              fileName: asset.fileName,
            });

            const videoUri = asset.uri || '';

            // Normalize URI for trim screen
            let normalizedUri = videoUri;
            if (Platform.OS === 'ios' && !normalizedUri.startsWith('file://')) {
              normalizedUri = 'file://' + normalizedUri;
            }

            // Always open trim screen - don't compress yet
            console.log('[GiftMessage] Opening trim screen for gallery video');
            setOriginalVideoPath(normalizedUri);
            setSelectedVideo(normalizedUri);
            setIsVideoLongerThan15Seconds(duration > MAX_VIDEO_DURATION);
          }
        },
      );
    });
  };

  const handleOpenPopup = useCallback(() => {
    // Always show popup - content changes based on whether video exists
    setPopupVisible(true);
  }, []);

  const filters = getAllFiltersApi.data || [];

  const filtersForUi = [
    { FilterId: CONFETTI_FILTER_ID } as unknown as GiftFilter,
    ...filters,
  ];

  // API filter only (confetti chip uses local asset; not in filters list)
  const selectedFilter =
    typeof sendMessagePayload.ImageFilterId !== 'number' ||
    sendMessagePayload.ImageFilterId === CONFETTI_FILTER_ID
      ? null
      : filters.find(
          f => f.FilterId === sendMessagePayload.ImageFilterId,
        );

  const giftMessageTextVerticalInset = useMemo(() => {
    const h = giftMessageInputAreaHeight;
    const fontSize = theme.sizes.FONTSIZE_HIGH;
    const lh = Math.round(fontSize * 1.35);
    if (h <= 0) {
      const b = scaleWithMax(8, 12);
      return {
        paddingTop: scaleWithMax(32, 40) + b,
        paddingBottom: scaleWithMax(20, 26),
      };
    }
    const approxCharW = fontSize * 0.55;
    const innerWidth = Math.max(
      0,
      theme.sizes.WIDTH -
        theme.sizes.PADDING * 2 -
        scaleWithMax(30, 36) * 2,
    );
    const charsPerLine = Math.max(12, Math.floor(innerWidth / approxCharW));
    const lineCount = message
      ? message.split('\n').reduce((acc, segment) => {
          const len = segment.length || 0;
          return acc + Math.max(1, Math.ceil(len / charsPerLine));
        }, 0)
      : 0;
    const effectiveLines = Math.max(1, lineCount);
    const contentH = Math.min(effectiveLines * lh + scaleWithMax(6, 10), h);
    const inset = Math.max(0, (h - contentH) / 2);
    const downwardBias = scaleWithMax(10, 14);
    return {
      paddingTop: inset + downwardBias,
      paddingBottom: Math.max(0, inset - downwardBias),
    };
  }, [
    giftMessageInputAreaHeight,
    message,
    theme.sizes.FONTSIZE_HIGH,
    theme.sizes.WIDTH,
    theme.sizes.PADDING,
  ]);

  /** No chip selected: warm tint (#FFF7F1) + confetti. Any selection: neutral white behind artwork. */
  const hasNoFilterSelection =
    sendMessagePayload.ImageFilterId === null ||
    sendMessagePayload.ImageFilterId === undefined;
  /** Confetti asset in the message area for default state or when confetti chip is selected. */
  const showConfettiInMessageArea =
    hasNoFilterSelection ||
    sendMessagePayload.ImageFilterId === CONFETTI_FILTER_ID;

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
        onSaveVideo={async trimmedPath => {
          // Close ViewTrimmer FIRST to prevent re-renders during compression
          const fileName =
            sendMessagePayload.VideoFile?.name || `video_${Date.now()}.mp4`;

          setOriginalVideoPath(null);
          setIsVideoLongerThan15Seconds(false);
          setSelectedVideo(null);
          setShowCamera(false);

          // Compress AFTER ViewTrimmer is unmounted
          await compressVideo(trimmedPath, fileName);
        }}
        onCancel={() => {
          // Remove video on cancel - don't save anything
          setSendMessagePayload(prev => {
            const updated = { ...prev, VideoFile: undefined };
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
                    <CloseIcon size={18} />
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

                              // Handle video path - normalize and open trim screen
                              let videoUri = video.path;

                              // Normalize URI format for trim screen
                              if (Platform.OS === 'android') {
                                // Android: Ensure proper URI format
                                if (
                                  !videoUri.startsWith('file://') &&
                                  !videoUri.startsWith('content://')
                                ) {
                                  videoUri = 'file://' + videoUri;
                                }
                              } else {
                                // iOS: Ensure file:// prefix
                                if (!videoUri.startsWith('file://')) {
                                  videoUri = 'file://' + videoUri;
                                }
                              }

                              // Always open trim screen - don't compress yet
                              // Add a small delay on Android to ensure video file is fully finalized
                              const openTrimScreen = () => {
                                console.log(
                                  '[GiftMessage] Opening trim screen for recorded video:',
                                  {
                                    platform: Platform.OS,
                                    originalPath: videoUri,
                                  },
                                );
                                setOriginalVideoPath(videoUri);
                                setSelectedVideo(videoUri);
                                setIsVideoLongerThan15Seconds(
                                  recordingTime >= MAX_VIDEO_DURATION,
                                );
                              };

                              if (Platform.OS === 'android') {
                                // Add delay on Android to ensure video file is fully finalized
                                setTimeout(openTrimScreen, 500);
                              } else {
                                // iOS - open immediately
                                openTrimScreen();
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
              <ActivityIndicator size="large" color="#C73E51" />
              <Text style={{ color: '#FFF', marginTop: 16 }}>
                {getString('GIFT_MESSAGE_LOADING_CAMERA')}
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
                ? getString('GIFT_MESSAGE_REMOVE_VIDEO')
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
                // setOriginalVideoPath(sendMessagePayload.VideoFile.uri);
                // setSelectedVideo(sendMessagePayload.VideoFile.uri);
                setSendMessagePayload({
                  ...sendMessagePayload,
                  VideoFile: undefined,
                });
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

              // Request camera permissions first - only show camera if granted
              const granted = await requestPermission();
              if (granted) {
                setShowCamera(true);
              }
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
              <ShadowView preset="default">
                <View style={styles.messageContainer}>
                  <View
                    style={[
                      styles.inputWrapper,
                      !hasNoFilterSelection && {
                        backgroundColor: theme.colors.WHITE,
                      },
                      showFilterTextValidationError && {
                        borderWidth: 1,
                        borderColor: theme.colors.RED,
                      },
                    ]}
                    pointerEvents="box-none"
                  >
                    {showConfettiInMessageArea && (
                      <View
                        pointerEvents="none"
                        style={StyleSheet.absoluteFillObject}
                      >
                        <Image
                          source={require('../../../assets/images/Confetti.png')}
                          resizeMode="cover"
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: scaleWithMax(12, 14),
                          }}
                        />
                      </View>
                    )}
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
                      onLayout={e => {
                        setGiftMessageInputAreaHeight(
                          e.nativeEvent.layout.height,
                        );
                      }}
                    >
                      <InputField
                        noShadow
                        fieldProps={{
                          multiline: true,
                          scrollEnabled: true,
                          maxLength: GIFT_MESSAGE_TEXT_MAX_LEN,
                          value: message,
                          onChangeText: setMessage,
                          placeholder: getString('GIFT_MESSAGE_PLACEHOLDER'),
                          inputAccessoryViewID:
                            Platform.OS === 'ios'
                              ? inputAccessoryViewID
                              : undefined,
                          style: [
                            styles.textInput,
                            giftMessageTextVerticalInset,
                            selectedFilter?.TextColor && {
                              color: selectedFilter.TextColor,
                            },
                          ],
                        }}
                        style={[
                          styles.inputFieldContainer,
                          styles.giftMessageInputField,
                        ]}
                      />
                    </View>
                  </View>
                  {showFilterTextValidationError && (
                    <View
                      style={[
                        styles.giftFilterErrorRow,
                        isRtl
                          ? styles.giftFilterErrorRowRtl
                          : styles.giftFilterErrorRowLtr,
                      ]}
                    >
                      <Text style={styles.giftFilterErrorText}>
                        {filterInlineValidationMessage}
                      </Text>
                    </View>
                  )}
                  <Pressable
                    onPress={() => {
                      handleOpenPopup();
                    }}
                    style={{
                      position: 'absolute',
                      bottom: scaleWithMax(5, 6),
                      // [isRtl ? 'left' : 'right']: scaleWithMax(20, 25),
                      end: scaleWithMax(20, 25),
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
                        <View
                          pointerEvents="none"
                          style={{
                            position: 'absolute',
                            width: scaleWithMax(36, 38),
                            height: scaleWithMax(36, 38),
                            borderRadius: 8,
                            // backgroundColor: 'rgba(255, 255, 255, 0.85)',
                          }}
                        />
                        <SvgAddGiftMessageIcon />
                        {/* Badge when video is added */}
                        {sendMessagePayload.VideoFile && (
                          <View
                            pointerEvents="none"
                            style={{
                              position: 'absolute',
                              top: 13,
                              end: 13,
                              // [isRtl ? 'left' : 'right']: scaleWithMax(6, 8),
                              width: 14,
                              height: 14,
                              borderRadius: scaleWithMax(10, 11),
                              backgroundColor: theme.colors.PRIMARY,
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
              </ShadowView>

              <View style={styles.filtersWrapper}>
                <Text style={styles.sectionTitle}>
                  {getString('GIFT_MESSAGE_FILTER')}
                </Text>
                {getAllFiltersApi.loading ? (
                  <SkeletonLoader screenType="giftFilters" />
                ) : (
                  <FlatList
                    data={filtersForUi}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    extraData={sendMessagePayload.ImageFilterId}
                    keyExtractor={item => item.FilterId.toString()}
                    renderItem={({ item: filter, index }) => (
                      <ShadowView preset="default">
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
                              const isCurrentlySelected =
                                sendMessagePayload.ImageFilterId ===
                                filter.FilterId;
                              const newFilterId = isCurrentlySelected
                                ? null
                                : filter.FilterId;
                              setSendMessagePayload(prev => ({
                                ...prev,
                                ImageFilterId: newFilterId,
                              }));
                              if (orderId) {
                                await saveGiftMessageData(orderId, {
                                  ImageFilterId: newFilterId,
                                  Message: sendMessagePayload.Message,
                                  VideoFile: sendMessagePayload.VideoFile,
                                });
                              }
                            }}
                          >
                            <View
                              style={[
                                styles.filterThumbFrame,
                                {
                                  borderWidth:
                                    typeof sendMessagePayload.ImageFilterId ===
                                      'number' &&
                                    filter.FilterId ===
                                      sendMessagePayload.ImageFilterId
                                      ? 2
                                      : 0,
                                  borderColor: theme.colors.PRIMARY,
                                },
                              ]}
                            >
                              {filter.FilterId === CONFETTI_FILTER_ID ? (
                                <View style={styles.confettiFilterWrapper}>
                                  <ConfettiFilterSvg
                                    width="100%"
                                    height="100%"
                                    preserveAspectRatio="xMidYMid slice"
                                    style={styles.confettiFilterSvg}
                                  />
                                </View>
                              ) : (
                                <Image
                                  style={styles.filterImage}
                                  source={{ uri: filter.ImageUrl }}
                                  resizeMode="cover"
                                />
                              )}
                            </View>
                          </TouchableOpacity>
                        </View>
                      </ShadowView>
                    )}
                    ListEmptyComponent={
                      <View
                        style={{
                          height: theme.sizes.HEIGHT * 0.2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          flex: 1,
                        }}
                      >
                        <PlaceholderLogoText
                          text={getString('GIFT_MESSAGE_NO_FILTERS_AVAILABLE')}
                        />
                      </View>
                    }
                    contentContainerStyle={styles.filtersScrollContent}
                  />
                )}
              </View>
            </View>
            <View style={styles.footer}>
              <CustomButton
                title={getString(
                  hasGiftMessageToSubmit ? 'NG_NEXT' : 'NG_SKIP',
                )}
                onPress={handleButtonPress}
                disabled={isFooterPrimaryDisabled}
                buttonStyle={
                  isFooterPrimaryDisabled
                    ? styles.footerPrimaryButtonDisabled
                    : undefined
                }
                labelStyle={
                  isFooterPrimaryDisabled
                    ? styles.footerPrimaryButtonDisabledLabel
                    : undefined
                }
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
                  <Text style={styles.doneButtonText}>
                    {getString('GIFT_MESSAGE_DONE')}
                  </Text>
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
