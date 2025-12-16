import {
  Image,
  FlatList,
  StatusBar,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  InteractionManager,
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
import { Text } from '../../../utils/elements';
import { AppStackScreen } from '../../../types/navigation.types';
import { useLocaleStore } from '../../../store/reducer/locale';
import { rtlPosition, scaleWithMax, rtlMargin } from '../../../utils';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { GiftFilter, CartResponse } from '../../../types/index';
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
import {
  saveGiftMessageData,
  loadGiftMessageData,
} from '../../../utils/giftMessageStorage';
import ViewTrimmer from '../../../components/app/ViewTrimmer';

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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isVideoCancelled, setIsVideoCancelled] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const videoViewerRef = useRef<{ preload: (url: string) => void } | null>(
    null,
  );

  const {
    recordVideo,
    cameraRef,
    device,
    timer,
    isCameraActive,
    cancelRecording,
    requestPermission,
  } = useVisionCamera();
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const [startRecordingAfterReady, setStartRecordingAfterReady] = useState<
    null | (() => void)
  >(null);

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
            if (savedData.VideoFile?.uri) {
              setSelectedVideo(savedData.VideoFile.uri);
            }
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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        // Scroll to top when keyboard closes
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const paddedMins = String(mins).padStart(2, '0');
    const paddedSecs = String(secs).padStart(2, '0');

    return `${paddedMins}:${paddedSecs}`;
  }
  const handleButtonPress = async () => {
    if (isCompressing) {
      notify.error('Please wait, video is being processed...');
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
          notify.error(response.error || 'Failed to send gift message');
          return { success: false, error: response.error };
        }
      } catch (error: any) {
        console.error('[GiftMessage] Error sending gift message:', error);
        clearPendingVideoPath();
        notify.error(error?.message || 'An error occurred while sending');
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

  const compressVideo = async (videoUri: string, fileName: string) => {
    console.log('[GiftMessage] Starting video compression:', { videoUri });
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const compressedUri = await Video.compress(
        videoUri,
        {
          compressionMethod: 'auto',
          maxSize: 1920,
          minimumFileSizeForCompress: 0,
        },
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
        uri: processedUri,
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
    } catch (error: any) {
      console.error('[GiftMessage] Video compression failed:', error);
      notify.error('Failed to process video. Please try again.');
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handleVideoSelect = () => {
    if (isCompressing) {
      notify.error('Please wait, video is being processed...');
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

            // Validate duration (backup check in case durationLimit doesn't work)
            if (duration > MAX_VIDEO_DURATION) {
              notify.error(
                `Video must be ${MAX_VIDEO_DURATION} seconds or less. Selected video is ${Math.round(
                  duration,
                )} seconds.`,
              );
              return;
            }

            const videoUri = asset.uri || '';
            const fileName = asset.fileName || `video_${Date.now()}.mp4`;

            // Compress the video before setting it
            await compressVideo(videoUri, fileName);
          }
        },
      );
    });
  };

  const handleOpenPopup = useCallback(() => {
    if (sendMessagePayload.VideoFile) {
      setSelectedVideo(sendMessagePayload.VideoFile.uri);
    } else {
      setPopupVisible(true);
    }
  }, [sendMessagePayload.VideoFile]);

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
    return <ViewTrimmer videoUrl={selectedVideo} />;
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
                onInitialized={() => {
                  console.log('✅ Camera initialized and ready');
                  if (startRecordingAfterReady) {
                    console.log('🎥 Starting recording...');
                    // Small delay to ensure camera is fully ready
                    setTimeout(() => {
                      startRecordingAfterReady();
                      setStartRecordingAfterReady(null);
                    }, 300);
                  }
                }}
                onError={error => {
                  console.error('❌ Camera error:', error);
                  Alert.alert('Camera Error', error.message);
                  setShowCamera(false);
                }}
              />
              <View style={styles.timer}>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
                <TouchableOpacity
                  onPress={() => {
                    console.log('🛑 Stop button pressed');
                    cancelRecording();
                    setIsVideoCancelled(true);
                    setShowCamera(false);
                  }}
                  style={styles.crossButton}
                >
                  <View style={styles.crossBackground}>
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>
                      Done
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Recording Play/Pause Control Button */}
              {/* <View style={{
                position: 'absolute',
                bottom: 100,
                alignSelf: 'center',
                zIndex: 1000,
              }}>
                <TouchableOpacity
                  onPress={() => setIsRecordingPaused(prev => !prev)}
                  activeOpacity={0.8}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {isRecordingPaused ? (
                    <PlayIcon size={30} color="#FFFFFF" />
                  ) : (
                    <PauseIcon size={30} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View> */}
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
            title={'select'}
            message={'Select how you want the video'}
            confirmText={'from Gallery'}
            cancelText={'from Camera'}
            onConfirm={handleVideoSelect}
            onCancel={() => setPopupVisible(false)}
            onbtn2Press={async () => {
              // Close the popup first
              setPopupVisible(false);

              // Request camera permissions first
              await requestPermission();

              // Then show camera
              setShowCamera(true);

              // Set up the recording callback
              setStartRecordingAfterReady(() => () => {
                console.log(
                  'Starting recording - Camera ref exists?',
                  !!cameraRef.current,
                  'Camera ready?',
                  isCameraActive,
                  'Device exists?',
                  !!device,
                );

                recordVideo(
                  {
                    onRecordingFinished: video => {
                      if (isVideoCancelled) {
                        setIsVideoCancelled(false);
                        setShowCamera(false);
                        return;
                      }
                      console.log('video finished ', video);
                      setShowCamera(false);
                      const videoUri = 'file://' + video.path;
                      compressVideo(videoUri, `video_${Date.now()}.mp4`);
                    },
                    onRecordingError: err => {
                      console.log('Recording Error:', err);
                      setShowCamera(false);
                      notify.error('Failed to record video');
                    },
                  },
                  MAX_VIDEO_DURATION,
                );
              });
            }}
            loading={false}
          />

          <HomeHeader
            title={getString('GIFT_MESSAGE_TITLE')}
            showBackButton={true}
            onBackPress={() => {
              Keyboard.dismiss();
              navigation.goBack();
            }}
          />
          <View style={styles.content}>
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              onTouchStart={() => {
                if (isKeyboardVisible) {
                  textInputRef.current?.blur();
                  Keyboard.dismiss();
                  setIsScrolling(true);
                }
              }}
              onScrollBeginDrag={() => {
                textInputRef.current?.blur();
                Keyboard.dismiss();
                setIsScrolling(true);
              }}
              onScroll={() => {
                // Keep input blurred during scroll to prevent keyboard from reopening
                if (isKeyboardVisible) {
                  textInputRef.current?.blur();
                }
              }}
              onScrollEndDrag={() => {
                setTimeout(() => {
                  setIsScrolling(false);
                }, 300);
              }}
              onMomentumScrollEnd={() => {
                setTimeout(() => {
                  setIsScrolling(false);
                }, 300);
              }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={isKeyboardVisible}
            >
              <View style={styles.body}>
                <View style={styles.messageContainer}>
                  <View style={styles.inputWrapper}>
                    {/* Filter background with low opacity */}
                    {selectedFilter && (
                      <Image
                        source={{ uri: selectedFilter.ImageUrl }}
                        style={styles.filterBackground}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.textInputWrapper}>
                      <TextInput
                        ref={textInputRef}
                        multiline
                        style={[
                          styles.textInput,
                          selectedFilter?.TextColor && {
                            color: selectedFilter.TextColor,
                          },
                        ]}
                        maxLength={100}
                        value={message}
                        onChangeText={setMessage}
                        placeholderTextColor={theme.colors.SECONDARY_TEXT}
                        placeholder={getString('GIFT_MESSAGE_PLACEHOLDER')}
                        editable={!isScrolling}
                        onFocus={() => {
                          if (isScrolling) {
                            textInputRef.current?.blur();
                          }
                        }}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={handleOpenPopup}
                    disabled={isCompressing}
                    style={{ opacity: isCompressing ? 0.5 : 1 }}
                  >
                    {isCompressing ? (
                      <View
                        style={[
                          styles.cameraIcon,
                          rtlPosition(isRtl, undefined, scaleWithMax(20, 25)),
                          {
                            justifyContent: 'center',
                            alignItems: 'center',
                          },
                        ]}
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
                      <SvgAddGiftMessageIcon
                        style={[
                          styles.cameraIcon,
                          rtlPosition(isRtl, undefined, scaleWithMax(20, 25)),
                        ]}
                      />
                    )}
                  </TouchableOpacity>
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
            </ScrollView>
            <View style={styles.footer}>
              <CustomButton
                title={hasContent ? 'Next' : 'Skip'}
                onPress={handleButtonPress}
                disabled={isCompressing}
              />
            </View>
          </View>
        </View>
      )}
    </ParentView>
  );
};

export default GiftMessage;
