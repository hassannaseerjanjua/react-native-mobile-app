import {
  Image,
  FlatList,
  StatusBar,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
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

  // Sync message with payload
  useEffect(() => {
    setSendMessagePayload(prev => ({
      ...prev,
      Message: message,
    }));
  }, [message]);

  const addGiftMessage = async () => {
    const response = await api.post(apiEndpoints.SEND_GIFT_FILTER, {
      ...sendMessagePayload,
      Message: message,
    });
    if (response.success) {
      (navigation as any).navigate('CheckOut', {
        friendUserId,
        storeBranchId,
      });
    } else {
      notify.error(response.error);
    }
  };

  const handleVideoSelect = () => {
    launchImageLibrary(
      {
        mediaType: 'video',
        quality: 1,
        selectionLimit: 1,
        videoQuality: 'high',
      },
      response => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          notify.error(response.errorMessage);
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const duration = asset.duration || 0; // Duration in seconds

          if (duration > 15) {
            notify.error('Video duration must be 15 seconds or less');
            return;
          }

          setSendMessagePayload(prev => ({
            ...prev,
            VideoFile: {
              uri:
                Platform.OS === 'ios'
                  ? asset.uri?.replace('file://', '') || asset.uri || ''
                  : asset.uri || '',
              type: asset.type || 'video/mp4',
              name: asset.fileName || `video_${Date.now()}.mp4`,
            },
          }));
        }
      },
    );
  };

  // Check if there's any content (filter, message, or video)
  const hasContent =
    sendMessagePayload.ImageFilterId !== null ||
    message.trim().length > 0 ||
    !!sendMessagePayload.VideoFile;

  const handleButtonPress = async () => {
    if (hasContent) {
      // If there's content, call the API
      await addGiftMessage();
    } else {
      // If no content, skip and navigate to checkout
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
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <View style={styles.body}>
          <View style={styles.messageContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                multiline
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
                placeholderTextColor={theme.colors.SECONDARY_TEXT}
                placeholder={getString('GIFT_MESSAGE_PLACEHOLDER')}
              />
            </View>
            <TouchableOpacity onPress={handleVideoSelect}>
              <SvgAddGiftMessageIcon
                style={[
                  styles.cameraIcon,
                  rtlPosition(isRtl, undefined, scaleWithMax(20, 25)),
                ]}
              />
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
          <View style={styles.footer}>
            <CustomButton
              title={hasContent ? 'Next' : 'Skip'}
              onPress={handleButtonPress}
            />
          </View>
        </View>
      </View>
    </ParentView>
  );
};

export default GiftMessage;
