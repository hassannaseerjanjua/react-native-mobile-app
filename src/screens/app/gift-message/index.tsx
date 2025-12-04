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

const MAX_VIDEO_DURATION = 15; // Maximum video duration in seconds

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

  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setSendMessagePayload(prev => ({
      ...prev,
      Message: message,
    }));
  }, [message]);

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

  const addGiftMessage = async () => {
    console.log('[GiftMessage] Starting background upload:', {
      hasFilter: !!sendMessagePayload.ImageFilterId,
      hasMessage: !!message.trim(),
      hasVideo: !!sendMessagePayload.VideoFile,
    });

    // Navigate immediately without waiting for upload
    (navigation as any).navigate('CheckOut', {
      friendUserId,
      storeBranchId,
    });

    // Upload in background
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
      const response = await api.post(apiEndpoints.SEND_GIFT_FILTER, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        console.log('[GiftMessage] Background upload completed successfully');
        notify.success('Gift message uploaded successfully');
      } else {
        console.error(
          '[GiftMessage] Background upload failed:',
          response.error,
        );
        notify.error(response.error || 'Failed to upload gift message');
      }
    } catch (error: any) {
      console.error('[GiftMessage] Background upload error:', error);
      notify.error(error?.message || 'An error occurred while uploading');
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
          maxSize: 720,
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

      notify.success('Video ready to send');
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
  };

  const hasContent =
    sendMessagePayload.ImageFilterId !== null ||
    message.trim().length > 0 ||
    !!sendMessagePayload.VideoFile;

  const handleButtonPress = () => {
    if (isCompressing) {
      notify.error('Please wait, video is being processed...');
      return;
    }

    if (hasContent) {
      // Start upload in background and navigate immediately
      addGiftMessage();
    } else {
      (navigation as any).navigate('CheckOut', {
        friendUserId,
        storeBranchId,
      });
    }
  };

  const filters = getAllFiltersApi.data || [];
  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
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
                <TextInput
                  ref={textInputRef}
                  multiline
                  style={styles.textInput}
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
              <TouchableOpacity
                onPress={handleVideoSelect}
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
