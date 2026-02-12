import React, { useEffect, useState } from 'react';
import { View, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import NotificationItem from '../../../components/global/NotificationItem.tsx';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import { Notification, NotificationsApiResponse } from '../../../types/index.ts';
import { formatRelativeTime } from '../inbox-outbox/actions.ts';

const NotificationsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const response = await api.get<NotificationsApiResponse>(
      apiEndpoints.NOTIFICATIONS_LISTING,
    );
    if (response.success && response.data?.Data?.Items) {
      setNotifications(response.data.Data.Items);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);


  const renderItem = ({ item }: { item: Notification }) => {
    const title = isRtl ? item.TitleAr : item.TitleEn;

    // Extract bold text from JsonData if possible
    let boldText = '';
    try {
      if (item.JsonData) {
        const jsonData = JSON.parse(item.JsonData);
        boldText = jsonData.StoreName || jsonData.OccasionUserName || jsonData.FullName || '';
      }
    } catch (e) {
      console.error('Error parsing JsonData', e);
    }

    // Fallback for title/description if placeholders exist
    let finalTitle = title;
    if (boldText && finalTitle.includes('{FullName}')) {
      finalTitle = finalTitle.replace('{FullName}', boldText);
    }
    if (boldText && finalTitle.includes('{StoreName}')) {
      finalTitle = finalTitle.replace('{StoreName}', boldText);
    }

    return (
      <NotificationItem
        title={finalTitle}
        onPress={() => { }}
        NotificationItemStyles={styles.NotificationItem}
        isGroupImage={item.Image}
        time={formatRelativeTime(item.CreatedOn)}
        boldText={boldText}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={getString('NOT_NOTIFICATIONS')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.NotificationId.toString()}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={{ height: theme.sizes.HEIGHT * 0.68 }}>
              <PlaceholderLogoText text={'No notifications found'} />
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;
