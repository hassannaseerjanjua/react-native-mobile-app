import React, { useState } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Share,
  Modal,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import TabItem from '../../../components/global/TabItem';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import {
  SvgProfileWallet,
  SvgProfileFriends,
  SvgProfileSettings,
  SvgProfileOrder,
  SvgProfileConnect,
  SvgProfileCall,
  SvgProfileReport,
  SvgProfileTermsCondition,
  SvgProfilePrivacy,
  SvgProfileSupport,
  SvgProfileLogout,
  SvgProfileLink,
  SvgProfileFavorites,
  SvgProfileCrossIcon,
  SvgProfileQrIcon,
  SvgVerifiedIcon,
  SvgPencilIcon,
  CardsIcon,
  VisaIcon,
  NoonIcon,
} from '../../../assets/icons';
import { useDispatch } from 'react-redux';
import { login, logout, useAuthStore } from '../../../store/reducer/auth';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import { UpdateProfileApiResponse } from '../../../types';
import { useLocaleStore } from '../../../store/reducer/locale';
import QRCode from 'react-native-qrcode-svg';
import { scaleWithMax } from '../../../utils';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import CustomButton from '../../../components/global/Custombutton';
import { BlurView } from '@react-native-community/blur';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import { selectAndCropImage } from '../../../utils/imageCropper';
import { callLogoutWithDeviceToken } from '../../../utils/notificationService';
import { encodeGiftLinkParams } from '../../../utils/giftLinkCodec';

const ProfileScreen: React.FC = () => {
  const { styles: screenStyles, theme } = useStyles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, token } = useAuthStore();
  const { getString } = useLocaleStore();
  const isMerchant = user?.isMerchant === 1;
  const dummyImage = require('../../../assets/images/user.png');
  const [isUploading, setIsUploading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = async () => {
    await callLogoutWithDeviceToken();
    dispatch(logout());
  };

  const handleShareGiftLink = async () => {
    try {
      if (!user?.UserId || !user?.CityId) {
        return;
      }

      // Generate obfuscated deep link (encodes friendUserId, CityId, sendType)
      const token = encodeGiftLinkParams({
        friendUserId: user.UserId,
        CityId: user.CityId,
        sendType: 1,
      });
      const giftLink = `https://admin.giftee.hostinger.bitscollision.net/gift-me?t=${encodeURIComponent(
        token,
      )}`;

      // const shareMessage = `🎁 Want to send me a gift? Click the link below.\n\n${giftLink}`;
      const shareMessage = `${getString('LINK_MY_GIFT_LINK')}.\n\n${giftLink}`;
      const shareOptions = Platform.select({
        ios: {
          message: shareMessage,
        },
        android: {
          message: shareMessage,
          title: getString('PROFILE_GIFT_LINK_TITLE'),
        },
      }) || {
        message: shareMessage,
        title: getString('PROFILE_GIFT_LINK_TITLE'),
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {}
  };

  const handleImageSelect = async () => {
    if (isUploading) return;

    try {
      // Use WhatsApp-like cropper with circular overlay
      const croppedImage = await selectAndCropImage({
        cropSize: 400,
        circularOverlay: true, // Round overlay like WhatsApp
        fileNamePrefix: 'profile_image',
        compress: true,
        compressionQuality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (croppedImage) {
        uploadProfileImage(croppedImage);
      }
    } catch (error) {
      console.error('Error selecting/cropping image:', error);
    }
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
        }
      })
      .catch(error => {})
      .finally(() => {
        setIsUploading(false);
        setShowPhotoOptions(false);
      });
  };

  const handleRemovePhoto = () => {
    if (isUploading) return;
    uploadProfileImage(null, true);
  };

  const handleChangePhoto = () => {
    setShowPhotoOptions(false);
    setTimeout(() => {
      handleImageSelect();
    }, 300);
  };

  const profileMenuItems = [
    {
      id: 'wallet',
      title: getString('W_WALLET'),
      icon: <SvgProfileWallet />,
      onPress: () => {
        navigation.navigate('Wallet' as never);
      },
    },
    {
      id: 'gift-link',
      title: getString('P_MY_GIFT_LINK'),
      icon: <SvgProfileLink />,
      onPress: handleShareGiftLink,
    },
    {
      id: 'manage-cards',
      title: getString('P_MANAGE_CARDS'),
      icon: <CardsIcon />,
      onPress: () => {
        (navigation as any).navigate('AddCard', {
          fromProfile: true,
        });
      },
    },
    {
      id: 'favourites',
      title: getString('P_MY_FAVOURITES'),
      icon: <SvgProfileFavorites />,
      onPress: () => {
        (navigation as any).navigate('BottomTabs', {
          screen: 'Favorites',
          params: { redirectionType: 'profile' },
        });
      },
    },
    {
      id: 'friends',
      title: isMerchant
        ? getString('PROFILE_MY_EMPLOYEES')
        : getString('MF_MY_FRIENDS'),
      icon: <SvgProfileFriends />,
      onPress: () => {
        (navigation as any).navigate('Search', {
          title: isMerchant
            ? getString('PROFILE_MY_EMPLOYEES')
            : getString('MF_MY_FRIENDS'),
          ...(isMerchant
            ? { showEmployeesOnly: true }
            : { showFriendsOnly: true }),
        });
      },
    },
    {
      id: 'settings',
      title: getString('S_SETTINGS'),
      icon: <SvgProfileSettings />,
      onPress: () => {
        navigation.navigate('Settings' as never);
      },
    },

    {
      id: 'order',
      title: getString('O_ORDERS'),
      icon: <SvgProfileOrder />,
      onPress: () => {
        navigation.navigate('Orders' as never);
      },
    },
    {
      id: 'connect',
      title: getString('C_CONNECT'),
      icon: <SvgProfileConnect />,
      onPress: () => {
        (navigation as any).navigate('Search', {
          title: getString('C_CONNECT'),
          showConnectOnly: true,
        });
      },
    },
    {
      id: 'contact-us',
      title: getString('CU_CONTACT_US'),
      icon: <SvgProfileCall />,
      onPress: () => {
        navigation.navigate('ContactUs' as never);
      },
    },

    {
      id: 'terms',
      title: getString('TC_TERMS_AND_CONDITIONS'),
      icon: <SvgProfileTermsCondition />,
      onPress: () => {
        (navigation as any).navigate('StaticContent', {
          title: getString('TC_TERMS_AND_CONDITIONS'),
          code: 'TermsAndCondition',
        });
      },
    },
    {
      id: 'privacy',
      title: getString('PP_PRIVACY_POLICY'),
      icon: <SvgProfilePrivacy />,
      onPress: () => {
        (navigation as any).navigate('StaticContent', {
          title: getString('PP_PRIVACY_POLICY'),
          code: 'PrivacyPolicy',
        });
      },
    },
    {
      id: 'faq',
      title: getString('FAQS_FAQS'),
      icon: <SvgProfileSupport />,
      onPress: () => {
        navigation.navigate('FAQ' as never);
      },
    },
    {
      id: 'logout',
      title: getString('P_LOGOUT'),
      icon: <SvgProfileLogout />,
      onPress: () => {
        setShowLogoutConfirmation(true);
      },
    },
  ];

  console.log(user);
  const allowedMenuItems: (typeof profileMenuItems)[number]['id'][] = isMerchant
    ? [
        'wallet',
        // 'gift-link',
        // 'favourites',
        'friends',
        'settings',
        'manage-cards',
        'order',
        'connect',
        'contact-us',
        'terms',
        'privacy',
        'faq',
        'logout',
      ]
    : [
        'wallet',
        'gift-link',
        'favourites',
        'friends',
        'settings',
        'manage-cards',
        'order',
        'connect',
        'contact-us',
        'terms',
        'privacy',
        'faq',
        'logout',
      ];
  return (
    <ParentView style={screenStyles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={getString('P_PROFILE')}
        showBackButton={false}
        rightSideIcon={<SvgProfileCrossIcon />}
        rightSideTitle={true as any}
        onBackPress={() => navigation.navigate('BottomTabs' as never)}
        rightSideTitlePress={() => navigation.navigate('BottomTabs' as never)}
      />

      <ScrollView
        style={screenStyles.scrollView}
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={screenStyles.profileSection}>
          <TouchableOpacity
            onPress={() => {
              if (user?.ProfileUrl) {
                // If image exists, navigate to ProfileImageViewer
                (navigation as any).navigate('ProfileImageViewer', {
                  imageUri: user.ProfileUrl,
                  placeholderImage: dummyImage,
                });
              } else {
                // If no image, open gallery directly
                handleImageSelect();
              }
            }}
            disabled={isUploading}
            style={screenStyles.profileImageContainer}
          >
            <Image
              source={user?.ProfileUrl ? { uri: user.ProfileUrl } : dummyImage}
              style={[
                screenStyles.profileImage,
                isUploading && screenStyles.profileImageUploading,
              ]}
            />

            <View style={screenStyles.pencilIconContainer}>
              <SvgPencilIcon
                width={scaleWithMax(10, 12)}
                height={scaleWithMax(10, 12)}
              />
            </View>
          </TouchableOpacity>
          <View style={screenStyles.profileInfo}>
            <View style={screenStyles.verifiedIconContainer}>
              <Text style={screenStyles.profileName}>{user?.FullNameEn}</Text>{' '}
              {user?.IsVerified && <SvgVerifiedIcon />}
            </View>
            <Text style={screenStyles.profileUsername}>@{user?.UserName}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowQrModal(true)}>
            <SvgProfileQrIcon />
          </TouchableOpacity>
        </View>

        <View style={screenStyles.menuContainer}>
          {profileMenuItems.map((item, index) =>
            isMerchant && !allowedMenuItems.includes(item.id) ? null : (
              <View key={item.id} style={screenStyles.menuItemWrapper}>
                <TabItem
                  title={item.title}
                  onPress={item.onPress}
                  hideRightIcon={true}
                  icon={item.icon}
                  TabItemStyles={screenStyles.menuItem}
                  TabTextStyles={screenStyles.menuItemText}
                />
              </View>
            ),
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={screenStyles.modalContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={2}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
          />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowQrModal(false)}
          />
          <View
            style={[
              screenStyles.modalContent,
              {
                backgroundColor: theme.colors.BACKGROUND,
                borderRadius: theme.sizes.BORDER_RADIUS_HIGH,
              },
            ]}
          >
            <View style={screenStyles.qrContent}>
              <Text style={screenStyles.qrTitle}>
                {getString('P_LETSSWAPGIFTS')}
              </Text>
              <Text style={screenStyles.qrSubtitle}>
                {getString('P_SCANTOGETME')}
              </Text>

              <View style={screenStyles.qrCodeContainer}>
                <View style={screenStyles.modalProfileSection}>
                  <Image
                    source={
                      user?.ProfileUrl ? { uri: user.ProfileUrl } : dummyImage
                    }
                    style={screenStyles.modalProfileImage}
                  />
                  <View style={screenStyles.modalProfileInfo}>
                    <Text style={screenStyles.modalProfileName}>
                      {user?.FullNameEn}
                    </Text>
                    <Text style={screenStyles.modalProfileUsername}>
                      @{user?.UserName}
                    </Text>
                  </View>
                </View>

                {user?.UserId ? (
                  <QRCode
                    value={`giftee://add-friend/${user.UserId}`}
                    size={scaleWithMax(220, 250)}
                    color={theme.colors.PRIMARY}
                    backgroundColor={theme.colors.WHITE}
                    ecl="H"
                  />
                ) : (
                  <View
                    style={{
                      width: scaleWithMax(220, 250),
                      height: scaleWithMax(220, 250),
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#f0f0f0',
                    }}
                  >
                    <Text style={{ color: theme.colors.SECONDARY_TEXT }}>
                      {getString('P_NOUSERIDAVAILABLE')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <AppBottomSheet
        isOpen={showPhotoOptions}
        onClose={() => setShowPhotoOptions(false)}
        height={
          user?.ProfileUrl
            ? theme.sizes.HEIGHT * 0.2
            : theme.sizes.HEIGHT * 0.13
        }
        enablePanDownToClose={true}
      >
        <View style={screenStyles.bottomSheet}>
          <CustomButton
            title={
              user?.ProfileUrl
                ? getString('PROFILE_CHANGE_PHOTO')
                : getString('PROFILE_ADD_PHOTO')
            }
            onPress={handleChangePhoto}
            disabled={isUploading}
            loading={isUploading}
          />
          {user?.ProfileUrl && (
            <CustomButton
              title={getString('PROFILE_REMOVE_PHOTO')}
              type="secondary"
              onPress={handleRemovePhoto}
              disabled={isUploading}
              loading={isUploading}
              buttonStyle={{
                borderColor: 'red',
              }}
              labelStyle={{
                color: 'red',
              }}
            />
          )}
        </View>
      </AppBottomSheet>

      <ConfirmationPopup
        visible={showLogoutConfirmation}
        title={getString('P_LOGOUT') || 'Logout'}
        message={getString('PROFILE_LOGOUT_CONFIRM')}
        confirmText={getString('P_LOGOUT') || 'Logout'}
        cancelText={getString('NG_CANCEL') || 'Cancel'}
        onConfirm={async () => {
          setShowLogoutConfirmation(false);
          await handleLogout();
        }}
        onCancel={() => setShowLogoutConfirmation(false)}
      />
    </ParentView>
  );
};

export default ProfileScreen;
