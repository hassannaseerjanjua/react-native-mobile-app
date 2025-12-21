import {
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Text } from '../../../utils/elements';
import React, { useState, useRef, useMemo } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import VideoStoryViewer from '../../../components/global/VideoStoryViewer';
import useStyles from './style';
import {
  DecrementIcon,
  GiftIcon,
  IncrementIcon,
  RoundedBackIcon,
  SmsTrackingIcon,
  SvgOutboxShareIcon,
  PlusIcon,
  MinusIcon,
} from '../../../assets/icons';
import { LinearGradient } from 'react-native-linear-gradient';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import CustomButton from '../../../components/global/Custombutton';
import { InboxOrder, GiftFilter, InboxOrderItem } from '../../../types/index';
import SkeletonLoader from '../../../components/SkeletonLoader';
import {
  useInboxOutboxActions,
  formatRelativeTime,
  getProfileImage,
  getUserName,
  getStoreName,
  getMainImage,
  getItemName,
} from './actions';
import { rtlFlexDirection, scaleWithMax } from '../../../utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import useGetApi from '../../../hooks/useGetApi';
import apiEndpoints from '../../../constants/api-endpoints';
import useDebounceClick from '../../../hooks/useDebounceClick';
import api from '../../../utils/api';
import notify from '../../../utils/notify';

const InboxOutbox: React.FC = () => {
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openBottomSheet2, setOpenBottomSheet2] = useState(false);
  const [videoViewerData, setVideoViewerData] = useState<{
    visible: boolean;
    videoUrl: string;
    profileImage: any;
    userName: string;
    timeAgo: string;
    filterImageUrl?: string | null;
    messageText?: string | null;
  }>({
    visible: false,
    videoUrl: '',
    profileImage: null,
    userName: '',
    timeAgo: '',
    filterImageUrl: null,
    messageText: null,
  });
  const { getString } = useLocaleStore();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as
    | {
        title?: string;
        isInbox?: boolean;
      }
    | undefined;
  const isInbox = params?.isInbox ?? true;
  const title = params?.title ?? (isInbox ? 'Inbox' : 'Outbox');
  const { styles, theme } = useStyles();
  const { orders, isLoading, isRtl, refetch } = useInboxOutboxActions(isInbox);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<InboxOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<InboxOrderItem | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  // Fetch all filters to get filter image URLs
  const filtersApi = useGetApi<GiftFilter[]>(apiEndpoints.GET_ALL_FILTERS, {
    transformData: (data: any) => data.Data?.Items || data.Data || [],
  });

  // Create a map of filter ID to image URL for quick lookup
  const filterMap = useMemo(() => {
    const map = new Map<number, string>();
    if (filtersApi.data) {
      filtersApi.data.forEach(filter => {
        map.set(filter.FilterId, filter.ImageUrl);
      });
    }
    return map;
  }, [filtersApi.data]);

  const { createDebouceClick } = useDebounceClick();

  const handleItemPress = (orderId: number, itemId: InboxOrderItem) => {
    setOrderId(orderId);
    const selectedOrder = orders.find(o => o.OrderId === orderId) as any;

    setSelectedItem(itemId);
    setSelectedOrder(selectedOrder);
    setSelectedQuantity(itemId.Quantity - itemId.UsedQuantity); // Initialize with item's quantity

    setOpenBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setOpenBottomSheet(false);
  };

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (!selectedItem) return;

    if (type === 'increment') {
      if (
        selectedQuantity <
        selectedItem.Quantity - selectedItem.UsedQuantity
      ) {
        setSelectedQuantity(prevQuantity => prevQuantity + 1);
      }
    } else {
      if (selectedQuantity > 1) {
        setSelectedQuantity(prevQuantity => prevQuantity - 1);
      }
    }
  };

  const handlePickUpPress = async () => {
    if (!selectedItem || !selectedOrder || !orderId) return;

    try {
      const payload = {
        orderid: orderId,
        orderPaymentType: 1, // Hardcoded
        IsRedeem: true,
        RedeemQuantity: selectedQuantity,
        Items: [
          {
            OrderItemId: selectedItem.OrderItemId,
            Quantity: selectedQuantity,
          },
        ],
      };

      const response = await api.post<any>(apiEndpoints.INIT_ORDER_v2, payload);
      const responseData = (response.data as any) || {};

      if (response.success && responseData.Data) {
        const data = responseData.Data;
        const responseOrderId = data.OrderId;
        const uniqueCode = data.UniqueCode;

        if (responseOrderId && uniqueCode) {
          const productImage = getMainImage(selectedItem);
          const storeName = getStoreName(selectedOrder, isRtl);

          (navigation as any).navigate('ScanQr', {
            OrderId: responseOrderId,
            UniqueCode: uniqueCode,
            productImage,
            storeName,
            quantity: selectedQuantity,
            productName: selectedOrder?.Items?.[0]?.ItemName,
          });
          setOpenBottomSheet(false);
        } else {
          notify.error(
            data.Message ||
              responseData.ResponseMessage ||
              'Failed to generate QR code',
          );
        }
      } else {
        const errorMessage =
          responseData.Data?.Message ||
          responseData.ResponseMessage ||
          response.error ||
          'Failed to redeem item';
        notify.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error redeeming item:', error);
      notify.error(error?.message || 'An error occurred while redeeming item');
    }
  };

  const handleDeliveryPress = () => {
    navigation.navigate('LocationSelection' as never);
    setOpenBottomSheet(false);
  };

  const videoViewerRef = useRef<{ preload: (url: string) => void } | null>(
    null,
  );

  const handleVideoPress = (order: InboxOrder) => {
    const profileImage = getProfileImage(order, isInbox);
    const userName = getUserName(order, isInbox);
    const timeAgo = formatRelativeTime(order.OrderTime);

    const filterImageUrl =
      order.OrderFilterId && filterMap.has(order.OrderFilterId)
        ? filterMap.get(order.OrderFilterId) || null
        : null;

    const messageText = order.OrderMessage || null;

    const hasVideo = order.orderImages && order.orderImages.length > 0;
    const videoUrl = hasVideo ? order.orderImages[0].ImageUrl : '';

    if (hasVideo && videoUrl) {
      videoViewerRef.current?.preload(videoUrl);
    }

    setVideoViewerData({
      visible: false,
      videoUrl,
      profileImage,
      userName,
      timeAgo,
      filterImageUrl,
      messageText,
    });

    setTimeout(() => {
      setVideoViewerData(prev => ({
        ...prev,
        visible: true,
      }));
    }, 300);
  };

  const handleCloseVideoViewer = () => {
    setVideoViewerData(prev => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <ParentView>
      {isInbox && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: theme.sizes.HEIGHT * 0.35,
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={['#FEECDC', '#FFFFFF']}
            locations={[0.0005, 0.8847]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              flex: 1,
              width: '100%',
            }}
          />
        </View>
      )}
      <View style={{ zIndex: 1, backgroundColor: 'transparent' }}>
        <HomeHeader
          showBackButton
          title={title}
          showSearchBar
          customContainerStyle={
            isInbox ? { backgroundColor: 'transparent' } : undefined
          }
        />
      </View>
      {isLoading ? (
        <SkeletonLoader screenType="inbox" />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={orders}
          renderItem={({ item, index }) => (
            <InboxItem
              isLast={index === orders.length - 1}
              isInbox={isInbox}
              order={item}
              isRtl={isRtl}
              onClick={
                isInbox
                  ? orderItem => {
                      createDebouceClick('item-press', () =>
                        handleItemPress(item.OrderId, orderItem),
                      );
                    }
                  : undefined
              }
              onVideoPress={() => handleVideoPress(item)}
            />
          )}
          keyExtractor={item => item.OrderId.toString()}
          ListEmptyComponent={() => (
            <View style={{ padding: theme.sizes.PADDING }}>
              <Text
                style={{
                  textAlign: 'center',
                  paddingVertical: theme.sizes.HEIGHT * 0.35,
                  color: theme.colors.SECONDARY_TEXT,
                }}
              >
                {getString('O_NO_ORDER_FOUND')}
              </Text>
            </View>
          )}
          contentContainerStyle={orders.length === 0 ? { flex: 1 } : undefined}
        />
      )}
      <AppBottomSheet
        blurAmount={100}
        isOpen={openBottomSheet}
        height={
          selectedItem?.Quantity && selectedItem?.Quantity > 1
            ? theme.sizes.HEIGHT * 0.45
            : theme.sizes.HEIGHT * 0.3
        }
        snapPoints={
          selectedItem?.Quantity && selectedItem?.Quantity > 1
            ? ['28%']
            : ['20%']
        }
        onClose={handleCloseBottomSheet}
      >
        <View style={styles.bottomSheet}>
          {selectedItem && selectedItem.Quantity > 1 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  onPress={() => handleQuantityChange('decrement')}
                  disabled={selectedQuantity <= 1}
                  style={[
                    styles.quantityButton,
                    selectedQuantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                >
                  <MinusIcon
                    width={scaleWithMax(20, 22)}
                    height={scaleWithMax(20, 22)}
                    fill={selectedQuantity <= 1 ? '#ccc' : theme.colors.PRIMARY}
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{selectedQuantity}</Text>
                <TouchableOpacity
                  onPress={() => handleQuantityChange('increment')}
                  disabled={selectedQuantity >= selectedItem.Quantity}
                  style={[
                    styles.quantityButton,
                    selectedQuantity >= selectedItem.Quantity &&
                      styles.quantityButtonDisabled,
                  ]}
                >
                  <PlusIcon
                    width={scaleWithMax(20, 22)}
                    height={scaleWithMax(20, 22)}
                    fill={
                      selectedQuantity >= selectedItem.Quantity
                        ? '#ccc'
                        : theme.colors.PRIMARY
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <CustomButton title="Pick Up" onPress={handlePickUpPress} />
          <CustomButton
            title="Delivery"
            type="secondary"
            onPress={handleDeliveryPress}
            buttonStyle={{ backgroundColor: theme.colors.WHITE }}
          />
        </View>
      </AppBottomSheet>

      <VideoStoryViewer
        ref={videoViewerRef}
        visible={videoViewerData.visible}
        videoUrl={videoViewerData.videoUrl}
        profileImage={videoViewerData.profileImage}
        userName={videoViewerData.userName}
        timeAgo={videoViewerData.timeAgo}
        filterImageUrl={videoViewerData.filterImageUrl}
        messageText={videoViewerData.messageText}
        onClose={handleCloseVideoViewer}
      />
    </ParentView>
  );
};

interface InboxItemProps {
  order: InboxOrder;
  isLast: boolean;
  isRtl: boolean;
  isInbox: boolean;
  onClick?: (item: InboxOrderItem) => void;
  onVideoPress?: () => void;
}

const InboxItem: React.FC<InboxItemProps> = ({
  order,
  isLast,
  isRtl,
  onClick,
  isInbox,
  onVideoPress,
}) => {
  const { styles, theme } = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const profileImage = getProfileImage(order, isInbox);
  const userName = getUserName(order, isInbox);
  const storeName = getStoreName(order, isRtl);
  const timeAgo = formatRelativeTime(order.OrderTime);

  const { createDebouceClick } = useDebounceClick();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const itemWidth = theme.sizes.WIDTH * 0.78 + theme.sizes.PADDING * 0.8;
    const index = Math.round(scrollPosition / itemWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const itemWidth = theme.sizes.WIDTH * 0.78 + theme.sizes.PADDING * 0.8;
    scrollViewRef.current?.scrollTo({
      x: index * itemWidth,
      animated: true,
    });
  };

  return (
    <View>
      <View
        style={{
          ...styles.inboxTop,
          borderBottomWidth: isLast ? 0 : 0.7,
          borderBottomColor: theme.colors.BORDER_COLOR,
        }}
      >
        <View
          style={{
            ...styles.row,
            alignItems: 'flex-start',
          }}
        >
          <Image
            style={styles.inboxProfile}
            source={
              order.SendType === 2
                ? require('../../../assets/images/link.png')
                : profileImage
            }
          />
          <View style={{ flex: 1 }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingVertical: theme.sizes.PADDING * 0.2,
                rowGap: theme.sizes.PADDING * 0.24,
              }}
            >
              <View
                style={{
                  flex: 1,
                  ...styles.row,
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.userNameText}>
                  {order.SendType === 2 ? 'Gift Link' : userName}
                </Text>
                <Text style={styles.timeText}>{timeAgo}</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  ...styles.row,
                  justifyContent: 'space-between',
                }}
              >
                <View style={styles.storeNameRow}>
                  <View style={styles.giftIconWrapper}>
                    <GiftIcon
                      height={theme.sizes.FONTSIZE}
                      width={theme.sizes.FONTSIZE}
                    />
                  </View>
                  <Text style={styles.storeNameText}>{storeName}</Text>
                  <View style={styles.backIconContainer}>
                    <RoundedBackIcon
                      height={scaleWithMax(8, 8)}
                      width={scaleWithMax(8, 8)}
                    />
                  </View>
                </View>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  {((order.orderImages &&
                    Array.isArray(order.orderImages) &&
                    order.orderImages.length > 0) ||
                    order.OrderMessage) && (
                    <TouchableOpacity
                      onPress={e => {
                        e.stopPropagation?.();
                        onVideoPress?.();
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <SmsTrackingIcon
                        height={scaleWithMax(20, 20)}
                        width={scaleWithMax(20, 20)}
                      />
                    </TouchableOpacity>
                  )}
                  {order.SendType === 2 && (
                    <SvgOutboxShareIcon
                      height={scaleWithMax(20, 20)}
                      width={scaleWithMax(20, 20)}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Slider with ScrollView */}
            <View
              style={{
                paddingVertical: theme.sizes.PADDING * 0.45,
              }}
            >
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                overScrollMode="never"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                scrollEnabled={order.Items && order.Items.length > 1}
                decelerationRate="fast"
                snapToInterval={
                  theme.sizes.WIDTH * 0.78 + theme.sizes.PADDING * 0.8
                }
                snapToAlignment="start"
                contentContainerStyle={{
                  paddingVertical: theme.sizes.PADDING * 0.4,
                  gap: theme.sizes.PADDING * 0.8,
                }}
                style={{
                  overflow: 'visible',
                }}
              >
                {order.Items?.map((item, index) => {
                  const itemImage = getMainImage(item);

                  return (
                    <TouchableOpacity
                      key={`item-${order.OrderId}-${index}`}
                      onPress={() => onClick && onClick(item)}
                      activeOpacity={isInbox ? 0.8 : 1}
                      style={styles.imageContainer}
                      disabled={item.Status === 10}
                    >
                      {item.Status === 10 && (
                        <View style={styles.redeemedBox}>
                          <Text
                            style={{
                              color: theme.colors.WHITE,
                              fontSize: theme.sizes.FONTSIZE_MEDIUM,
                            }}
                          >
                            Redeemed
                          </Text>
                        </View>
                      )}
                      <Image source={itemImage} style={styles.inboxImage} />
                      <View style={styles.inboxImageBottom}>
                        <Text
                          style={styles.itemNameText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.ItemName}
                        </Text>
                        {item.Quantity > 0 && (
                          <View style={styles.numCircle}>
                            <Text style={styles.numText}>
                              {item.Quantity - item.UsedQuantity}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Pagination Dots */}
              {order.Items && order.Items.length > 1 && (
                <View style={styles.paginationContainer}>
                  {order.Items.map((_, index) => (
                    <TouchableOpacity
                      key={`dot-${order.OrderId}-${index}`}
                      onPress={() => {
                        createDebouceClick('scroll-to-index', () =>
                          scrollToIndex(index),
                        );
                      }}
                      activeOpacity={0.8}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <View
                        style={[
                          styles.paginationDot,
                          index === currentIndex && styles.paginationDotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InboxOutbox;
