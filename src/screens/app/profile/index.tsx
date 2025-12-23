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
import { launchImageLibrary } from 'react-native-image-picker';
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

const ProfileScreen: React.FC = () => {
  const { styles: screenStyles, theme } = useStyles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, token } = useAuthStore();
  const { getString } = useLocaleStore();
  const dummyImage = require('../../../assets/images/user.png');
  const [isUploading, setIsUploading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleShareGiftLink = async () => {
    try {
      const giftLink = `https://giftee.app/share/${user?.UserId}-${user?.CityId}`;
      const shareMessage = `🎁 Want to send me a gift? Clink the link below to send a gift.\n\n ${giftLink}`;
      const shareOptions = Platform.select({
        ios: {
          message: shareMessage,
          url: giftLink,
        },
        android: {
          message: shareMessage,
          title: getString('P_GIFT_ME_ON_GIFTEE'),
        },
      }) || {
        message: shareMessage,
        title: getString('P_GIFT_ME_ON_GIFTEE'),
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {}
  };

  const handleImageSelect = () => {
    if (isUploading) return;

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          uploadProfileImage(asset);
        }
      },
    );
  };

  const uploadProfileImage = (asset: any, isRemove: boolean = false) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('removePhoto', isRemove);

    if (!isRemove && asset) {
      formData.append('File', {
        uri:
          Platform.OS === 'ios'
            ? asset.uri?.replace('file://', '') || ''
            : asset.uri || '',
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
      title: getString('MF_MY_FRIENDS'),
      icon: <SvgProfileFriends />,
      onPress: () => {
        (navigation as any).navigate('Search', {
          title: getString('MF_MY_FRIENDS'),
          showFriendsOnly: true,
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
            onPress={() => setShowPhotoOptions(true)}
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
          </TouchableOpacity>
          <View style={screenStyles.profileInfo}>
            <Text style={screenStyles.profileName}>{user?.FullNameEn}</Text>
            <Text style={screenStyles.profileUsername}>{user?.UserName}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowQrModal(true)}>
            <SvgProfileQrIcon />
          </TouchableOpacity>
        </View>

        <View style={screenStyles.menuContainer}>
          {profileMenuItems.map((item, index) => (
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
          ))}
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
              <Text style={screenStyles.qrTitle}>Let's Swap Gifts! 🎁</Text>
              <Text style={screenStyles.qrSubtitle}>Scan to add me</Text>

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
                      {user?.UserName}
                    </Text>
                  </View>
                </View>

                {user?.UserId ? (
                  <QRCode
                    value={`giftee://add-friend/${user.UserId}`}
                    size={scaleWithMax(220, 250)}
                    color={theme.colors.PRIMARY}
                    backgroundColor={theme.colors.WHITE}
                    ecl="Q"
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
                      No user ID available
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
            title={user?.ProfileUrl ? 'Change Photo' : 'Add Photo'}
            onPress={handleChangePhoto}
            disabled={isUploading}
            loading={isUploading}
          />
          {user?.ProfileUrl && (
            <CustomButton
              title="Remove Photo"
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
        onConfirm={() => {
          setShowLogoutConfirmation(false);
          handleLogout();
        }}
        onCancel={() => setShowLogoutConfirmation(false)}
      />
    </ParentView>
  );
};

export default ProfileScreen;
