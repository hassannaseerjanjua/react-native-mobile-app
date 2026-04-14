import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ActivityIndicator,
  DeviceEventEmitter,
  RefreshControl,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import WebView from 'react-native-webview';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import useStyles from './style.ts';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import NotificationItem from '../../../components/global/NotificationItem.tsx';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import ShadowLayout from '../../../components/app/ShadowLayout';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Notification,
  NotificationsApiResponse,
} from '../../../types/index.ts';
import { formatRelativeTime } from '../inbox-outbox/actions.ts';
import { useListingApi } from '../../../hooks/useListingApi.ts';
import { useAuthStore } from '../../../store/reducer/auth.ts';
import useGetApi from '../../../hooks/useGetApi.ts';
import notify from '../../../utils/notify.ts';
import { scaleWithMax } from '../../../utils';

const NotificationsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { user, isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();

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
  const [loadingWelcome, setLoadingWelcome] = useState(false);
  const [welcomeWebViewLoading, setWelcomeWebViewLoading] = useState(false);

  const welcomeSheetTranslateY = useSharedValue(0);

  const closeWelcomeModal = useCallback(() => {
    welcomeSheetTranslateY.value = 0;
    setShowWelcomeWebView(false);
    setWelcomeHtml('');
    setWelcomeWebViewLoading(false);
  }, [welcomeSheetTranslateY]);

  useEffect(() => {
    if (showWelcomeWebView) {
      welcomeSheetTranslateY.value = 0;
    }
  }, [showWelcomeWebView, welcomeSheetTranslateY]);

  useEffect(() => {
    if (welcomeHtml) {
      setWelcomeWebViewLoading(true);
    } else {
      setWelcomeWebViewLoading(false);
    }
  }, [welcomeHtml]);

  const welcomeSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: welcomeSheetTranslateY.value }],
  }));

  const welcomePanGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(Platform.OS === 'android')
        .activeOffsetY(10)
        .failOffsetX([-32, 32])
        .onUpdate(e => {
          if (e.translationY > 0) {
            welcomeSheetTranslateY.value = e.translationY;
          }
        })
        .onEnd(e => {
          const shouldClose =
            welcomeSheetTranslateY.value > 120 || e.velocityY > 900;
          if (shouldClose) {
            welcomeSheetTranslateY.value = 0;
            runOnJS(closeWelcomeModal)();
          } else {
            welcomeSheetTranslateY.value = withSpring(0, {
              damping: 22,
              stiffness: 220,
            });
          }
        }),
    [closeWelcomeModal, welcomeSheetTranslateY],
  );

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
    }, []), // eslint-disable-line react-hooks/exhaustive-deps -- recall on focus only
  );

  const handleNotificationPress = async (item: Notification) => {
    const type = item.NotificationType;

    // WelcomeNotification = 12: open WebView modal
    if (type === 12) {
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
      return;
    }

    // GiftReceived = 3, GiftRejected = 11 → Inbox
    if (type === 3 || type === 11) {
      navigation.navigate('InboxOutbox', {
        title: getString('HOME_INBOX'),
        isInbox: true,
      });
      return;
    }

    // GiftRedeem = 4 → Outbox
    if (type === 4) {
      navigation.navigate('InboxOutbox', {
        title: getString('HOME_OUTBOX'),
        isInbox: false,
      });
      return;
    }

    // SpecialPriceMenu = 5 → Send a gift
    if (type === 5) {
      navigation.navigate('SendAGift', { routeTo: 'SelectStore' });
      return;
    }

    // Catch = 7 → Catch screen
    if (type === 7) {
      navigation.navigate('CatchScreen', { type: 'catch' });
      return;
    }

    // G1G1 = 8 → Gift one get one
    if (type === 8) {
      // Match Home flow: start Send-a-Gift journey (select friend first)
      if (user?.isMerchant === 1) {
        notify.error(getString('MERCHANT_NOT_ALLOWED'));
        return;
      }
      navigation.navigate('SendAGift', { routeTo: 'GiftOneGetOne' });
      return;
    }

    // Rest (1, 2, 6, 9, 10) → Home
    navigation.navigate('BottomTabs');
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
          jsonData.OccasionName ||
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
        onPress={() => {
          void handleNotificationPress(item);
        }}
        NotificationItemStyles={styles.NotificationItem}
        isGroupImage={item.Image}
        time={
          item.NotificationType !== 12
            ? formatRelativeTime(item.CreatedOn, getString)
            : null
        }
        boldText={boldText}
        isSeen={item.IsSeen}
      />
    );
  };

  const isMerchant = user?.isMerchant;
  console.log('isMerchant', isMerchant);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ShadowLayout
        preset="towardsBottom"
        overlayOnly
        overlayStyle={{ position: 'absolute', top: 0, zIndex: 0 }}
      />
      <StatusBar
        translucent
        backgroundColor="transparent"
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
          data={
            user?.isMerchant
              ? notificationsApi.data.filter(
                  item => item.NotificationType !== 13,
                )
              : notificationsApi.data
          }
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
          ListEmptyComponent={() => {
            if (!notificationsApi.isInitialLoad) return null;
            return (
              <View style={{ height: theme.sizes.HEIGHT * 0.77 }}>
                <PlaceholderLogoText
                  text={getString('SEARCH_NO_RESULTS_FOUND')}
                />
              </View>
            );
          }}
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
        onRequestClose={closeWelcomeModal}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: theme.colors.WHITE,
                paddingBottom: theme.sizes.HEIGHT * 0.01,
              },
              welcomeSheetAnimatedStyle,
            ]}
          >
            <View style={{ flex: 1 }}>
              {welcomeHtml ? (
                <>
                  <WebView
                    source={{ html: welcomeHtml }}
                    style={{ flex: 1 }}
                    originWhitelist={['*']}
                    scrollEnabled={true}
                    onLoadStart={() => setWelcomeWebViewLoading(true)}
                    onLoadEnd={() => setWelcomeWebViewLoading(false)}
                    onError={() => {
                      setWelcomeWebViewLoading(false);
                      notify.error(getString('AU_ERROR_OCCURRED'));
                    }}
                  />
                  {welcomeWebViewLoading ? (
                    <View
                      style={[
                        StyleSheet.absoluteFillObject,
                        {
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: theme.colors.WHITE,
                          zIndex: 5,
                        },
                      ]}
                    >
                      <ActivityIndicator
                        size="large"
                        color={theme.colors.PRIMARY}
                      />
                    </View>
                  ) : null}
                </>
              ) : loadingWelcome ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.PRIMARY}
                  />
                </View>
              ) : null}

              <GestureDetector gesture={welcomePanGesture}>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    paddingTop: 5,
                    paddingBottom: 18,
                    alignItems: 'center',
                    zIndex: 10,
                  }}
                >
                  <View
                    style={{
                      width: scaleWithMax(32, 36),
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: theme.colors.SECONDARY_GRAY,
                    }}
                  />
                </View>
              </GestureDetector>
            </View>
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

export default NotificationsScreen;
