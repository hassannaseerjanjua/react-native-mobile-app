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
import { launchImageLibrary } from 'react-native-image-picker';
import { AppStackScreen } from '../../../types/navigation.types';
import { SvgPencilIcon, SvgDeleteIcon } from '../../../assets/icons';
import { scaleWithMax, compressImage, fileUriWrapper } from '../../../utils';
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

const ProfileImageViewer: React.FC<AppStackScreen<'ProfileImageViewer'>> = ({
    route,
}) => {
    const { imageUri, placeholderImage, title } = route.params;
    const { styles: screenStyles, theme } = useStyles();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { user, token } = useAuthStore();
    const { getString } = useLocaleStore();
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showImageLoader, setShowImageLoader] = useState(!!imageUri);

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

    const handleImageSelect = () => {
        if (isUploading) return;

        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 1,
            },
            async response => {
                if (response.assets && response.assets[0]) {
                    const asset = response.assets[0];
                    try {
                        const imageUri = fileUriWrapper(asset.uri || '');
                        const compressedImage = await compressImage(imageUri || '');

                        // Create a new asset object with compressed URI
                        const compressedAsset = {
                            ...asset,
                            uri: compressedImage,
                        };
                        uploadProfileImage(compressedAsset);
                    } catch (error) {
                        console.error('Error compressing image:', error);
                        // Fallback to original image if compression fails
                        uploadProfileImage(asset);
                    }
                }
            },
        );
    };

    const uploadProfileImage = (asset: any, isRemove: boolean = false) => {
        setIsUploading(true);

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
                    notify.error(getString('AU_ERROR_OCCURRED') || 'Failed to update profile image');
                    setIsUploading(false);
                }
            })
            .catch(error => {
                // Show error and stay on screen on failure
                notify.error(error?.error || getString('AU_ERROR_OCCURRED') || 'Failed to update profile image');
                setIsUploading(false);
            })
            .finally(() => {
                setShowDeleteConfirmation(false);
            });
    };

    const handleRemovePhoto = () => {
        if (isUploading) return;
        setShowDeleteConfirmation(false);
        uploadProfileImage(null, true);
    };

    return (
        <ParentView style={screenStyles.container}>
            <StatusBar
                backgroundColor={theme.colors.HOME_BACKGROUND}
                barStyle="dark-content"
            />
            <HomeHeader
                title={title || "Profile Picture"}
                showBackButton
                onBackPress={() => !isUploading && navigation.goBack()}
                rightSideView={
                    <View style={screenStyles.rightIconsContainer}>

                        <TouchableOpacity
                            onPress={handleImageSelect}
                            activeOpacity={0.8}
                            style={screenStyles.iconButton}
                            disabled={isUploading}
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
                            <ActivityIndicator
                                size="large"
                                color={theme.colors.PRIMARY}
                            />
                        </View>
                    )}
                    {isUploading && (
                        <View style={screenStyles.loadingOverlay}>
                            <ActivityIndicator
                                size="large"
                                color={theme.colors.PRIMARY}
                            />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ConfirmationPopup
                visible={showDeleteConfirmation}
                title="Delete Photo"
                message="Are you sure you want to delete this photo?"
                confirmText="Delete"
                cancelText={getString('NG_CANCEL') || 'Cancel'}
                onConfirm={handleRemovePhoto}
                onCancel={() => setShowDeleteConfirmation(false)}
            />
        </ParentView>
    );
};

export default ProfileImageViewer;
