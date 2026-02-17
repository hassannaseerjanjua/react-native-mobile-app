import React, { useCallback, useMemo } from 'react';
import { View, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import useStyles from './style.ts';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import NotificationItem from '../../../components/global/NotificationItem.tsx';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import { Notification, NotificationsApiResponse } from '../../../types/index.ts';
import { formatRelativeTime } from '../inbox-outbox/actions.ts';
import { useListingApi } from '../../../hooks/useListingApi.ts';
import { useAuthStore } from '../../../store/reducer/auth.ts';

const NotificationsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, langCode } = useLocaleStore();
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();

  const notificationsApi = useListingApi<Notification>(
    apiEndpoints.NOTIFICATIONS_LISTING,
    token,
    {
      idExtractor: (item: Notification) => item.NotificationId,
      transformData: (data: NotificationsApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      pageSize: 10,
    }
  );

  const markAllAsSeen = async () => {
    try {
      await api.put(apiEndpoints.UPDATE_IS_SEEN_STATUS, {
        IsSeen: true,
      });
    } catch (e) {
      console.error("errror", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // useCallback(() => {
      // 
      // fetchNotifications();
      notificationsApi.recall(false);
      return () => {
        // const markAllAsSeen = async () => {
        //   try {
        //     await api.put(apiEndpoints.UPDATE_IS_SEEN_STATUS, {
        //       IsSeen: true,
        //     });
        //   } catch (e) {
        //     console.error("errror", e);
        //   }
        // };
        markAllAsSeen();
      };
    }, []),
  );


  const renderItem = ({ item }: { item: Notification }) => {
    const title = isRtl ? item.DescriptionAr : item.DescriptionEn;

    let boldText = '';
    try {
      if (item.JsonData) {
        const jsonData = JSON.parse(item.JsonData);
        boldText = jsonData.StoreName || jsonData.OccasionUserName || jsonData.FullName || '';
      }
    } catch (e) {
      console.error(e);
    }

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
        // onPress={() => { }}
        NotificationItemStyles={styles.NotificationItem}
        isGroupImage={item.Image}
        time={formatRelativeTime(item.CreatedOn)}
        boldText={boldText}
        isSeen={item.IsSeen}
      />
    );
  };

  const ListFooterComponent = useMemo(() => {
    if (notificationsApi.loadingMore) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color={theme.colors.PRIMARY} />
        </View>
      );
    }
    return null;
  }, [notificationsApi.loadingMore, theme.colors.PRIMARY]);

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

      {notificationsApi.loading && !notificationsApi.loadingMore ? (
        <SkeletonLoader screenType="notifications" />
      ) : (
        <FlatList
          data={notificationsApi.data}
          keyExtractor={item => item.NotificationId.toString()}
          contentContainerStyle={[styles.content, { paddingBottom: 20 }]}
          ListEmptyComponent={
            <View style={{ height: theme.sizes.HEIGHT * 0.68 }}>
              <PlaceholderLogoText
                text={getString('SEARCH_NO_RESULTS_FOUND')}
              />
            </View>
          }
          renderItem={renderItem}
          onEndReached={notificationsApi.loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;
