import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppStackScreen } from '../../../types/navigation.types';
import { SvgPencilIcon, SvgDeleteIcon } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { useDispatch } from 'react-redux';
import { login, useAuthStore } from '../../../store/reducer/auth';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import { UpdateProfileApiResponse } from '../../../types';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader';
import ParentView from '../../../components/app/ParentView';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import useStyles from './style';
import notify from '../../../utils/notify';
import { selectAndCropImage } from '../../../utils/imageCropper';

const ProfileImageViewer: React.FC<AppStackScreen<'ProfileImageViewer'>> = ({
  route,
}) => {
  const {
    imageUri,
    placeholderImage,
    title,
    occasionId,
    occasionName,
    occasionDate,
    isLocalOnly,
    onImageUpdate,
  } = route.params;
  const { styles: screenStyles, theme } = useStyles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, token } = useAuthStore();
  const { getString } = useLocaleStore();
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showImageLoader, setShowImageLoader] = useState(!!imageUri);

  // Check if this is for occasion or profile
  const isOccasionMode = occasionId !== null && occasionId !== undefined;

  const imageSource = imageUri
    ? { uri: imageUri }
    : placeholderImage || require('../../../assets/images/user.png');

  useEffect(() => {
    if (imageUri) {
      // Set a maximum timeout of 3 seconds for the loader
      const timer = setTimeout(() => {
        setShowImageLoader(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setShowImageLoader(false);
    }
  }, [imageUri]);

  const handleImageSelect = async () => {
    if (isUploading) return;

    try {
      // Use WhatsApp-like cropper with circular overlay
      const croppedImage = await selectAndCropImage({
        cropSize: 400,
        circularOverlay: true, // Round overlay like WhatsApp
        fileNamePrefix: isOccasionMode ? 'occasion_image' : 'profile_image',
        compress: true,
        compressionQuality: isOccasionMode ? 0.2 : 0.8, // Higher compression for occasions
        maxWidth: 800,
        maxHeight: 800,
      });

      if (croppedImage) {
        const asset = {
          uri: croppedImage.uri,
          type: croppedImage.type || 'image/jpeg',
          name: croppedImage.name,
        };
        if (isLocalOnly && onImageUpdate) {
          onImageUpdate({ type: 'update', asset });
          navigation.goBack();
        } else {
          uploadProfileImage(asset);
        }
      }
    } catch (error) {
      console.error('Error selecting/cropping image:', error);
    }
  };

  const uploadProfileImage = (asset: any, isRemove: boolean = false) => {
    setIsUploading(true);

    if (isOccasionMode) {
      // Handle occasion image update
      const formData = new FormData();
      formData.append('OccassionId', occasionId?.toString() || '');
      formData.append('NameEn', occasionName || '');
      formData.append('OccasionDate', occasionDate || '');

      if (isRemove) {
        // Explicitly indicate image removal by passing empty string
        formData.append('ImageUrl', '' as any);
      } else if (asset) {
        formData.append('ImageUrl', {
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `occasion_image_${Date.now()}.jpg`,
        } as any);
      }

      api
        .put(apiEndpoints.UPDATE_OCCASION(occasionId!), formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(response => {
          if (response.success) {
            // Navigate back on success - no success notification as per structure
            navigation.goBack();
          } else {
            notify.error(
              response.error ||
                getString('AU_ERROR_OCCURRED') ||
                'Failed to update occasion',
            );
            setIsUploading(false);
          }
        })
        .catch(error => {
          notify.error(
            error?.error ||
              getString('AU_ERROR_OCCURRED') ||
              'Failed to update occasion',
          );
          setIsUploading(false);
        })
        .finally(() => {
          setShowDeleteConfirmation(false);
        });
    } else {
      // Handle profile image update
      const formData = new FormData();
      formData.append('removePhoto', isRemove);

      if (!isRemove && asset) {
        // The URI is already processed by fileUriWrapper in handleImageSelect
        formData.append('File', {
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `profile_image_${Date.now()}.jpg`,
        });
      }

      api
        .put<UpdateProfileApiResponse>(
          apiEndpoints.UPDATE_PROFILE_IMAGE,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )
        .then(response => {
          if (response.data?.Data && token) {
            dispatch(
              login({
                user: { ...user, ...response.data.Data },
                token: token,
              }),
            );
            // Navigate back on success
            navigation.goBack();
          } else {
            // If no data, show error and stay on screen
            notify.error(
              getString('AU_ERROR_OCCURRED') ||
                'Failed to update profile image',
            );
            setIsUploading(false);
          }
        })
        .catch(error => {
          // Show error and stay on screen on failure
          notify.error(
            error?.error ||
              getString('AU_ERROR_OCCURRED') ||
              'Failed to update profile image',
          );
          setIsUploading(false);
        })
        .finally(() => {
          setShowDeleteConfirmation(false);
        });
    }
  };

  const handleRemovePhoto = () => {
    if (isUploading) return;
    setShowDeleteConfirmation(false);
    if (isLocalOnly && onImageUpdate) {
      onImageUpdate({ type: 'delete' });
      navigation.goBack();
    } else {
      uploadProfileImage(null, true);
    }
  };

  return (
    <ParentView style={screenStyles.container}>
      <View style={{ zIndex: 10, elevation: 10 }}>
        <HomeHeader
          title={title || getString('PROFILE_IMAGE_VIEWER_TITLE')}
          showBackButton
          onBackPress={() => !isUploading && navigation.goBack()}
          rightSideView={
            <View style={screenStyles.rightIconsContainer}>
              <TouchableOpacity
                onPress={handleImageSelect}
                activeOpacity={0.8}
                style={screenStyles.iconButton}
                disabled={isUploading}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <View style={screenStyles.iconWrapper}>
                  <SvgPencilIcon
                    width={scaleWithMax(20, 22)}
                    height={scaleWithMax(20, 22)}
                  />
                </View>
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity
                  onPress={() => setShowDeleteConfirmation(true)}
                  activeOpacity={0.8}
                  style={screenStyles.iconButton}
                  disabled={isUploading}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <View style={screenStyles.iconWrapper}>
                    <SvgDeleteIcon
                      width={scaleWithMax(20, 22)}
                      height={scaleWithMax(20, 22)}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
      <View style={screenStyles.imageContainer}>
        <TouchableOpacity
          style={screenStyles.imageTouchable}
          activeOpacity={1}
          onPress={() => !isUploading && navigation.goBack()}
          disabled={isUploading}
        >
          <Image
            source={imageSource}
            style={[
              screenStyles.image,
              isUploading && screenStyles.imageLoading,
            ]}
            resizeMode="contain"
            onLoad={() => {
              // Hide loader when image is actually loaded
              setShowImageLoader(false);
            }}
            onError={() => {
              // Hide loader on error
              setShowImageLoader(false);
            }}
          />
          {showImageLoader && imageUri && (
            <View style={screenStyles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
            </View>
          )}
          {isUploading && (
            <View style={screenStyles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ConfirmationPopup
        visible={showDeleteConfirmation}
        title={isOccasionMode ? getString('PROFILE_IMAGE_VIEWER_DELETE_IMAGE') : getString('PROFILE_IMAGE_VIEWER_DELETE_PHOTO')}
        message={
          isOccasionMode
            ? getString('PROFILE_IMAGE_VIEWER_DELETE_OCCASION_IMAGE_CONFIRM')
            : getString('PROFILE_IMAGE_VIEWER_DELETE_PHOTO_CONFIRM')
        }
        confirmText={getString('PROFILE_IMAGE_VIEWER_DELETE')}
        cancelText={getString('NG_CANCEL') || 'Cancel'}
        onConfirm={handleRemovePhoto}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </ParentView>
  );
};

export default ProfileImageViewer;
