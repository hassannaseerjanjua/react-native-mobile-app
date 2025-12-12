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
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
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
import { GiftFilter } from '../../../types/index';
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

const MAX_VIDEO_DURATION = 15;

const GiftMessage: React.FC<AppStackScreen<'GiftMessage'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const [message, setMessage] = useState('');
  const { product, addToCartPayload, friendUserId, storeBranchId } =
    route.params as any;

  const getAllFiltersApi = useGetApi<GiftFilter[]>(
    apiEndpoints.GET_ALL_FILTERS,
    {
      transformData: (data: any) => data.Data?.Items || data.Data || [],
    },
  );

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

  // Safety: Auto-reset compression state if it gets stuck
  useEffect(() => {
    if (isCompressing) {
      console.log('[GiftMessage] Compression started, setting 60s timeout...');
      const timeout = setTimeout(() => {
        console.warn('[GiftMessage] Compression timeout - resetting state');
        setIsCompressing(false);
        setCompressionProgress(0);
      }, 60000); // 60 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [isCompressing]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isVideoCancelled, setIsVideoCancelled] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
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
  } = useVisionCamera();
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const [startRecordingAfterReady, setStartRecordingAfterReady] = useState<
    null | (() => void)
  >(null);

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
  const handleButtonPress = () => {
    if (isCompressing) {
      notify.error('Please wait, video is being processed...');
      return;
    }

    if (hasContent) {
      // Store local video path for caching
      const localVideoPath = sendMessagePayload.VideoFile?.uri || null;
      if (localVideoPath) {
        setPendingVideoPath(localVideoPath);
      }

      // Create upload promise
      const uploadPromise = (async () => {
        try {
          const formData = new FormData();
          formData.append(
            'ImageFilterId',
            sendMessagePayload.ImageFilterId?.toString() || '',
          );
          formData.append('Message', message);
          if (sendMessagePayload.VideoFile) {
            formData.append('VideoFile', sendMessagePayload.VideoFile);
          }

          console.log('[GiftMessage] Uploading file in background...');
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
            console.log(
              '[GiftMessage] Background upload completed successfully',
            );

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
              '[GiftMessage] Background upload failed:',
              response.error,
            );
            clearPendingVideoPath();
            notify.error(response.error || 'Failed to upload gift message');
            return { success: false, error: response.error };
          }
        } catch (error: any) {
          console.error('[GiftMessage] Background upload error:', error);
          clearPendingVideoPath();
          notify.error(error?.message || 'An error occurred while uploading');
          return { success: false, error: error?.message };
        } finally {
          clearVideoUploadPromise();
        }
      })();

      // Store the promise so checkout can wait for it
      setVideoUploadPromise(uploadPromise);

      // Navigate to checkout with upload state
      (navigation as any).navigate('CheckOut', {
        friendUserId,
        storeBranchId,
        isVideoUploading: true,
      });
    } else {
      // Clear any existing upload promise
      clearVideoUploadPromise();
      (navigation as any).navigate('CheckOut', {
        friendUserId,
        storeBranchId,
        isVideoUploading: false,
      });
    }
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

      setSendMessagePayload(prev => ({
        ...prev,
        VideoFile: {
          uri: processedUri,
          type: 'video/mp4',
          name: fileName || `video_${Date.now()}.mp4`,
        },
      }));
    } catch (error: any) {
      console.error('[GiftMessage] Video compression failed:', error);
      notify.error('Failed to process video. Please try again.');
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handleVideoSelect = () => {
    console.log(
      '[GiftMessage] handleVideoSelect called, isCompressing:',
      isCompressing,
    );
    setPopupVisible(false);
    if (isCompressing) {
      console.warn('[GiftMessage] Blocked by isCompressing=true');
      notify.error('Please wait, video is being processed...');
      return;
    }

    console.log('[GiftMessage] Launching image library...');
    try {
      const result = launchImageLibrary(
        {
          mediaType: 'video',
          quality: 1,
          selectionLimit: 1,
          videoQuality: 'high',
        },
        async response => {
          console.log('[GiftMessage] Image library response received:', {
            didCancel: response.didCancel,
            hasError: !!response.errorMessage,
            hasAssets: !!response.assets,
          });

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
      console.log('[GiftMessage] launchImageLibrary called successfully');
    } catch (error) {
      console.error(
        '[GiftMessage] Exception calling launchImageLibrary:',
        error,
      );
      notify.error('Failed to open gallery. Please try again.');
    }
  };

  const hasContent =
    sendMessagePayload.ImageFilterId !== null ||
    message.trim().length > 0 ||
    !!sendMessagePayload.VideoFile;

  const filters = getAllFiltersApi.data || [];

  // Find the selected filter for background
  const selectedFilter = filters.find(
    filter => filter.FilterId === sendMessagePayload.ImageFilterId,
  );
  if (device && isCameraActive && showCamera)
    return (
      <View style={{ flex: 1 }}>
        <Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          isActive={isCameraActive}
          device={device}
          video={true}
          audio={true}
          onInitialized={() => {
            console.log('Camera ready, start recording now');
            if (startRecordingAfterReady) {
              startRecordingAfterReady();
              setStartRecordingAfterReady(null);
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
              cancelRecording();
              setIsVideoCancelled(true);
            }}
            style={styles.crossButton}
          >
            <View style={styles.crossBackground}>
              <Text>Stop</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );

  return (
    <ParentView style={styles.container}>
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
        isRecording
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
        visible={popupVisible}
        title={'select'}
        message={'Select how you want the video'}
        confirmText={'from Gallery'}
        cancelText={'from Camera'}
        onConfirm={handleVideoSelect}
        onCancel={() => setPopupVisible(false)}
        onbtn2Press={() => {
          setShowCamera(true);

          setStartRecordingAfterReady(() => () => {
            console.log(
              'Camera ref exists?',
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
                    return;
                  }
                  console.log('video finised ', video);
                  setPopupVisible(false);
                  setShowCamera(false);
                  const videoUri = 'file://' + video.path;
                  compressVideo(videoUri, `video_${Date.now()}.mp4`);
                },
                onRecordingError: err => console.log('Error:', err),
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
                onPress={() => {
                  console.log(
                    '[GiftMessage] Camera icon pressed, isCompressing:',
                    isCompressing,
                  );
                  if (sendMessagePayload.VideoFile) {
                    setSelectedVideo(sendMessagePayload.VideoFile.uri);
                  } else {
                    setPopupVisible(true);
                  }
                }}
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
                        index === 0 ? { marginLeft: theme.sizes.PADDING } : {},
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setSendMessagePayload(prev => ({
                            ...prev,
                            ImageFilterId:
                              prev.ImageFilterId === filter.FilterId
                                ? null
                                : filter.FilterId,
                          }));
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
    </ParentView>
  );
};

export default GiftMessage;
