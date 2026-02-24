import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ActivityIndicator,
  DeviceEventEmitter,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import WebView from 'react-native-webview';
import useStyles from './style.ts';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import NotificationItem from '../../../components/global/NotificationItem.tsx';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import {
  Notification,
  NotificationsApiResponse,
} from '../../../types/index.ts';
import { formatRelativeTime } from '../inbox-outbox/actions.ts';
import { useListingApi } from '../../../hooks/useListingApi.ts';
import { useAuthStore } from '../../../store/reducer/auth.ts';
import useGetApi from '../../../hooks/useGetApi.ts';
import notify from '../../../utils/notify.ts';
import { rtlFlexDirection } from '../../../utils';

const NotificationsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, langCode } = useLocaleStore();
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { user, isAuthenticated } = useAuthStore();

  const notificationsApi = useListingApi<Notification>(
    apiEndpoints.NOTIFICATIONS_LISTING,
    token,
    {
      idExtractor: (item: Notification) => item.NotificationId,
      transformData: (data: NotificationsApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
    },
  );

  const [showWelcomeWebView, setShowWelcomeWebView] = useState(false);
  const [welcomeHtml, setWelcomeHtml] = useState<string>('');
  const [welcomeTitle, setWelcomeTitle] = useState<string>('');
  const [loadingWelcome, setLoadingWelcome] = useState(false);

  const markAllAsSeen = async () => {
    try {
      await api.put(apiEndpoints.UPDATE_IS_SEEN_STATUS, {
        IsSeen: true,
      });
      getNotificationCount.refetch();
      DeviceEventEmitter.emit('REFRESH_NOTIFICATIONS_COUNT');
    } catch (e) {
      console.error('errror', e);
    }
  };

  const getNotificationCount = useGetApi<any>(
    isAuthenticated ? apiEndpoints.GET_UNSEEN_NOTIFICATION_COUNT : '',
    {
      transformData: data => data.Data,
    },
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isRefreshing && !notificationsApi.loading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, notificationsApi.loading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    notificationsApi.recall(false);
    markAllAsSeen();
  };

  useFocusEffect(
    useCallback(() => {
      notificationsApi.recall(false);
      markAllAsSeen();
    }, []),
  );

  const handleNotificationPress = async (item: Notification) => {
    if (item.NotificationType !== 12) return;
    const title = isRtl ? item.TitleAr : item.TitleEn;
    setWelcomeTitle(title);
    setShowWelcomeWebView(true);
    setLoadingWelcome(true);
    setWelcomeHtml('');
    try {
      const res = await api.get<{ data?: string; Data?: string }>(
        apiEndpoints.WELCOME_MESSAGE,
      );
      if (res.success && res.data) {
        const raw = res.data;
        const html =
          typeof raw === 'string'
            ? raw
            : ((raw?.Data ?? raw?.data ?? '') as string);
        setWelcomeHtml(html);
      }
    } catch (e) {
      notify.error(getString('AU_ERROR_OCCURRED'));
      setShowWelcomeWebView(false);
    } finally {
      setLoadingWelcome(false);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const title = isRtl ? item.DescriptionAr : item.DescriptionEn;

    let boldText = '';
    try {
      if (item.JsonData) {
        const jsonData = JSON.parse(item.JsonData);
        boldText =
          jsonData.StoreName ||
          jsonData.OccasionUserName ||
          jsonData.FullName ||
          '';
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
        onPress={
          item.NotificationType === 12
            ? () => {
                void handleNotificationPress(item);
              }
            : undefined
        }
        NotificationItemStyles={styles.NotificationItem}
        isGroupImage={item.Image}
        time={formatRelativeTime(item.CreatedOn, getString)}
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

      {notificationsApi.loading &&
      !notificationsApi.loadingMore &&
      !isRefreshing ? (
        <SkeletonLoader screenType="notifications" />
      ) : (
        <FlatList
          data={notificationsApi.data}
          keyExtractor={item => item.NotificationId.toString()}
          contentContainerStyle={[styles.content, { paddingBottom: 20 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.PRIMARY}
              colors={[theme.colors.PRIMARY]}
            />
          }
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

      {/* Welcome message WebView modal (type 12) */}
      <Modal
        visible={showWelcomeWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowWelcomeWebView(false);
          setWelcomeHtml('');
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.WHITE,
            paddingBottom: theme.sizes.HEIGHT * 0.01,
          }}
        >
          <View
            style={{
              flexDirection: rtlFlexDirection(isRtl),
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.sizes.PADDING,
              paddingVertical: theme.sizes.HEIGHT * 0.006,
              backgroundColor: theme.colors.WHITE,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.DIVIDER_COLOR ?? '#eee',
              ...(Platform.OS === 'ios' && {
                paddingTop: theme.sizes.HEIGHT * 0.02,
              }),
            }}
          >
            <Text
              style={{
                ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
                fontSize: theme.sizes.FONTSIZE_LESS_HIGH,
                color: theme.colors.PRIMARY_TEXT,
              }}
              numberOfLines={1}
            >
              {welcomeTitle}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowWelcomeWebView(false);
                setWelcomeHtml('');
              }}
              style={{ padding: 8 }}
            >
              <Text
                style={{
                  ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                  color: theme.colors.PRIMARY,
                }}
              >
                {getString('COMP_CLOSE')}
              </Text>
            </TouchableOpacity>
          </View>

          {loadingWelcome ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
            </View>
          ) : welcomeHtml ? (
            <WebView
              source={{ html: welcomeHtml }}
              style={{ flex: 1 }}
              originWhitelist={['*']}
              scrollEnabled={true}
              onError={() => {
                notify.error(getString('AU_ERROR_OCCURRED'));
              }}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

export default NotificationsScreen;
