import React from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import TabItem from '../../../components/global/TabItem';
import {
  SvgGiftLink,
  SvgFavouriteInactive,
  SvgUser,
  SvgCrossIcon,
  SvgBackIcon,
} from '../../../assets/icons';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useDispatch } from 'react-redux';
import { logout, useAuthStore } from '../../../store/reducer/auth';
import ParentView from '../../../components/app/ParentView';

const ProfileScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();
  const dispatch = useDispatch();
  const { user } = useAuthStore();

  const handleLogout = () => {
    dispatch(logout());
  };

  const profileMenuItems = [
    {
      id: 'wallet',
      title: 'Wallet',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'gift-link',
      title: 'My Gift Link',
      icon: <SvgGiftLink />,
      onPress: () => {},
    },
    {
      id: 'favourites',
      title: 'My Favourites',
      icon: <SvgFavouriteInactive />,
      onPress: () => {},
    },
    {
      id: 'friends',
      title: 'My Friends',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'order',
      title: 'Order',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'connect',
      title: 'Connect',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'contact-us',
      title: 'Contact us',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'report-problem',
      title: 'Report a problem',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'terms',
      title: 'Terms & conditions',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <SvgUser />,
      onPress: () => {},
    },
    {
      id: 'faq',
      title: 'FAQ & support',
      icon: <SvgUser />,
      onPress: () => {},
    },
  ];

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SvgCrossIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: user?.ProfileUrl || '',
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.FullNameEn}</Text>
            <Text style={styles.profileUsername}>{user?.UserName}</Text>
          </View>
          <TouchableOpacity style={styles.qrButton}>
            <View style={styles.qrIcon}>
              <View style={styles.qrDot} />
              <View style={styles.qrDot} />
              <View style={styles.qrDot} />
              <View style={styles.qrDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {profileMenuItems.map((item, index) => (
            <View key={item.id} style={styles.menuItemWrapper}>
              <TabItem
                title={item.title}
                onPress={item.onPress}
                icon={item.icon}
              />
            </View>
          ))}

          {/* Logout Button */}
          <View style={styles.menuItemWrapper}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <View style={styles.logoutContent}>
                <SvgBackIcon />
                <Text style={styles.logoutText}>Log out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ParentView>
  );
};

export default ProfileScreen;
