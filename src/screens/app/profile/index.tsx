import React, { useState } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
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
import { logout, useAuthStore } from '../../../store/reducer/auth';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';

const ProfileScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useAuthStore();
  const dummyImage = require('../../../assets/images/user.png');
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
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
      .put(apiEndpoints.UPDATE_PROFILE_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.log('Profile image updated:', response);
      })
      .catch(error => {
        console.error('Profile image update error:', error);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const profileMenuItems = [
    {
      id: 'wallet',
      title: 'Wallet',
      icon: <SvgProfileWallet />,
      onPress: () => {
        navigation.navigate('Wallet' as never);
      },
    },
    {
      id: 'gift-link',
      title: 'My Gift Link',
      icon: <SvgProfileLink />,
      onPress: () => {},
    },
    {
      id: 'favourites',
      title: 'My Favourites',
      icon: <SvgProfileFavorites />,
      onPress: () => {
        (navigation as any).navigate('BottomTabs', { screen: 'Favorites' });
      },
    },
    {
      id: 'friends',
      title: 'My Friends',
      icon: <SvgProfileFriends />,
      onPress: () => {
        (navigation as any).navigate('Search', {
          title: 'My Friends',
          showFriendsOnly: true,
        });
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <SvgProfileSettings />,
      onPress: () => {
        navigation.navigate('Settings' as never);
      },
    },
    {
      id: 'order',
      title: 'Order',
      icon: <SvgProfileOrder />,
      onPress: () => {
        navigation.navigate('Orders' as never);
      },
    },
    {
      id: 'connect',
      title: 'Connect',
      icon: <SvgProfileConnect />,
      onPress: () => {
        (navigation as any).navigate('Search', {
          title: 'Connect',
          showConnectOnly: true,
        });
      },
    },
    {
      id: 'contact-us',
      title: 'Contact us',
      icon: <SvgProfileCall />,
      onPress: () => {
        navigation.navigate('ContactUs' as never);
      },
    },

    {
      id: 'terms',
      title: 'Terms & conditions',
      icon: <SvgProfileTermsCondition />,
      onPress: () => {
        (navigation as any).navigate('StaticContent', {
          title: 'Terms & Conditions',
          code: 'TermsAndCondition',
        });
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <SvgProfilePrivacy />,
      onPress: () => {
        (navigation as any).navigate('StaticContent', {
          title: 'Privacy Policy',
          code: 'PrivacyPolicy',
        });
      },
    },
    {
      id: 'faq',
      title: 'FAQs',
      icon: <SvgProfileSupport />,
      onPress: () => {
        navigation.navigate('FAQ' as never);
      },
    },
    {
      id: 'logout',
      title: 'Logout',
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
        title="Profile"
        showBackButton={false}
        rightSideIcon={<SvgProfileCrossIcon />}
        rightSideTitle={true as any}
        rightSideTitlePress={() => navigation.goBack()}
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
