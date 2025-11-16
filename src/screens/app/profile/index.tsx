import React, { useState } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Share,
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

const ProfileScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useAuthStore();
  const { getString } = useLocaleStore();
  const dummyImage = require('../../../assets/images/user.png');
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleShareGiftLink = async () => {
    try {
      const giftLink = `https://giftee.app/share/${
        user?.UserName || 'user123'
      }`;
      const inviteLink = `giftee.com/inviteby/abc123?${
        user?.UserName || 'user123'
      }`;
      const shareOptions = Platform.select({
        ios: {
          message: `${getString('P_GIFT_ME_ON_GIFTEE')}\n\n${inviteLink}`,
          url: giftLink,
        },
        android: {
          message: `${getString(
            'P_GIFT_ME_ON_GIFTEE_EXCLAMATION',
          )}\n\n${inviteLink}`,
          title: getString('P_GIFT_ME_ON_GIFTEE'),
        },
      }) || {
        message: `${getString(
          'P_GIFT_ME_ON_GIFTEE_EXCLAMATION',
        )}\n\n${inviteLink}`,
        title: getString('P_GIFT_ME_ON_GIFTEE'),
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
    }
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

  const uploadProfileImage = (asset: any) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('File', {
      uri:
        Platform.OS === 'ios'
          ? asset.uri?.replace('file://', '') || ''
          : asset.uri || '',
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `profile_image_${Date.now()}.jpg`,
    });

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
        if (response.data?.Data) {
          dispatch(login({ ...user, ...response.data.Data }));
        }
      })
      .catch(error => {
      })
      .finally(() => {
        setIsUploading(false);
      });
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
        // Navigate to bottom tabs and then to favorites with profile parameter
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
        handleLogout();
      },
    },
  ];

  return (
    <ParentView style={styles.container}>
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handleImageSelect}
            disabled={isUploading}
            style={styles.profileImageContainer}
          >
            <Image
              source={user?.ProfileUrl ? { uri: user.ProfileUrl } : dummyImage}
              style={[
                styles.profileImage,
                isUploading && styles.profileImageUploading,
              ]}
            />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.FullNameEn}</Text>
            <Text style={styles.profileUsername}>{user?.UserName}</Text>
          </View>
          <SvgProfileQrIcon />
        </View>

        <View style={styles.menuContainer}>
          {profileMenuItems.map((item, index) => (
            <View key={item.id} style={styles.menuItemWrapper}>
              <TabItem
                title={item.title}
                onPress={item.onPress}
                hideRightIcon={true}
                icon={item.icon}
                TabItemStyles={styles.menuItem}
                TabTextStyles={styles.menuItemText}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ParentView>
  );
};

export default ProfileScreen;
