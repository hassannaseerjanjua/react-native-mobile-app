import { useState, useMemo, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ImageSourcePropType, Share, Platform } from 'react-native';
import useGetApi from '../../../hooks/useGetApi';
import { useListingApi } from '../../../hooks/useListingApi';
import apiEndpoints from '../../../constants/api-endpoints';
import { InboxOrder, InboxOrderItem, GiftFilter } from '../../../types/index';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useAuthStore } from '../../../store/reducer/auth';
import api from '../../../utils/api';
import notify from '../../../utils/notify';

const defaultProfileImage = require('../../../assets/images/user.png');
const defaultItemImage = require('../../../assets/images/img-placeholder.png');

export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 0) {
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  }
  if (diffInMonths > 0) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  if (diffInWeeks > 0) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  return 'Just now';
};

export const getProfileImage = (
  order: InboxOrder,
  isInbox: boolean,
): ImageSourcePropType => {
  if (isInbox) {
    return order.users?.ProfileUrl
      ? { uri: order.users.ProfileUrl }
      : defaultProfileImage;
  } else {
    return order.FriendImageUrl
      ? { uri: order.FriendImageUrl }
      : defaultProfileImage;
  }
};

export const getUserName = (order: InboxOrder, isInbox: boolean): string => {
  if (isInbox) {
    return order.users?.FullName || '';
  } else {
    return order.FriendName || order.users?.FullName || '';
  }
};

export const getStoreName = (order: InboxOrder, isRtl: boolean): string => {
  if (isRtl) {
    if (order.stores?.NameAr) {
      return order.stores.NameAr;
    }
    return order.stores?.NameEn || '';
  }
  if (order.stores?.NameEn) {
    return order.stores.NameEn;
  }
  return order.stores?.NameAr || '';
};

export const getMainImage = (order: InboxOrderItem): ImageSourcePropType => {
  const firstItem = order;
  if (firstItem.ThumbnailUrl && firstItem.ThumbnailUrl.trim()) {
    return { uri: firstItem.ThumbnailUrl };
  }
  if (firstItem.Images && firstItem.Images.length > 0) {
    const imageUrl =
      firstItem.Images[0].ImageUrls || firstItem.Images[0].ImageUrl;
    if (imageUrl && imageUrl.trim()) {
      return { uri: imageUrl };
    }
  }
  return defaultItemImage;
};

export const getItemName = (order: InboxOrder): string => {
  if (order.Items && order.Items.length > 0) {
    return order.Items[0].ItemName || '';
  }
  return '';
};

export const useInboxOutboxActions = (isInbox: boolean = true) => {
  const navigation = useNavigation();
  const { isRtl, getString } = useLocaleStore();
  const { user } = useAuthStore();
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<InboxOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<InboxOrderItem | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  // Track multiple selected items with their quantities: { OrderItemId: quantity }
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(
    new Map(),
  );
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
  const videoViewerRef = useRef<{ preload: (url: string) => void } | null>(
    null,
  );

  const getInboxOutboxDetails = useListingApi<InboxOrder>(
    apiEndpoints.GET_INBOX_OUTBOX_DETAILS,
    '',
    {
      transformData: (data: any) => {
        return {
          data: data.Data?.Items || [],
          totalCount: data.Data?.TotalCount || 0,
        };
      },
      extraParams: { inbox: isInbox },
      idExtractor: (item: InboxOrder) => item.OrderId,
    },
  );

  const filtersApi = useGetApi<GiftFilter[]>(apiEndpoints.GET_ALL_FILTERS, {
    transformData: (data: any) => data.Data?.Items || data.Data || [],
  });

  const filterMap = useMemo(() => {
    const map = new Map<number, string>();
    if (filtersApi.data) {
      filtersApi.data.forEach(filter => {
        map.set(filter.FilterId, filter.ImageUrl);
      });
    }
    return map;
  }, [filtersApi.data]);

  const refetch = () => getInboxOutboxDetails.recall();
  const orders = getInboxOutboxDetails.data || [];
  const isLoading = getInboxOutboxDetails.loading;

  const handleItemPress = (orderId: number, itemId: InboxOrderItem) => {
    if (itemId.Status === 10) {
      notify.error(getString('INBOX_ITEM_ALREADY_REDEEMED'));
      return;
    }

    setOrderId(orderId);
    const selectedOrder = orders.find(o => o.OrderId === orderId) as any;

    // Initialize selected items map with all available items from the order
    const itemsMap = new Map<number, number>();
    const filteredAvailableItems =
      selectedOrder?.Items?.filter(
        (item: InboxOrderItem) =>
          item.Status !== 10 && item.Quantity - item.UsedQuantity > 0,
      ) || [];
    const hasMultipleItems = filteredAvailableItems.length > 1;

    if (selectedOrder?.Items) {
      selectedOrder.Items.forEach((item: InboxOrderItem) => {
        if (item.Status !== 10) {
          const availableQty = item.Quantity - item.UsedQuantity;
          if (availableQty > 0) {
            // If only one item, auto-select it. Otherwise, pre-select the clicked item
            if (!hasMultipleItems) {
              itemsMap.set(item.OrderItemId, availableQty);
            } else {
              itemsMap.set(
                item.OrderItemId,
                item.OrderItemId === itemId.OrderItemId ? availableQty : 0,
              );
            }
          }
        }
      });
    }

    setSelectedItems(itemsMap);
    setSelectedOrder(selectedOrder);
    setSelectedItem(itemId); // Keep for backward compatibility

    // If there are multiple items, always show bottom sheet
    if (hasMultipleItems) {
      setOpenBottomSheet(true);
      return;
    }

    // Single item logic
    const availableQuantity = itemId.Quantity - itemId.UsedQuantity;
    setSelectedQuantity(availableQuantity);

    // If quantity is 1 and delivery is not enabled, directly call pickup
    if (availableQuantity === 1 && !selectedOrder?.stores?.IsDeliveryEnabled) {
      handlePickUpPress();
      return;
    }

    // Show bottom sheet for single item with quantity > 1 or delivery enabled
    setOpenBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setOpenBottomSheet(false);
    setSelectedItems(new Map());
  };

  const handleQuantityChange = (
    itemId: number,
    type: 'increment' | 'decrement',
    maxQuantity: number,
  ) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const currentQty = newMap.get(itemId) || 0;

      if (type === 'increment') {
        if (currentQty < maxQuantity) {
          newMap.set(itemId, currentQty + 1);
        }
      } else {
        if (currentQty > 0) {
          newMap.set(itemId, currentQty - 1);
        }
      }

      return newMap;
    });
  };

  const handleItemToggle = (itemId: number, maxQuantity: number) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const currentQty = newMap.get(itemId) || 0;

      if (currentQty > 0) {
        // Unselect
        newMap.set(itemId, 0);
      } else {
        // Select with max available quantity
        newMap.set(itemId, maxQuantity);
      }

      return newMap;
    });
  };

  const handlePickUpPress = async () => {
    if (!selectedOrder || !orderId) return;

    // Build items array from selected items map
    const items: Array<{ OrderItemId: number; Quantity: number }> = [];
    let totalRedeemQuantity = 0;

    selectedItems.forEach((quantity, orderItemId) => {
      if (quantity > 0) {
        items.push({
          OrderItemId: orderItemId,
          Quantity: quantity,
        });
        totalRedeemQuantity += quantity;
      }
    });

    if (items.length === 0) {
      notify.error('Please select at least one item');
      return;
    }

    try {
      const payload = {
        orderid: orderId,
        orderPaymentType: 1,
        IsRedeem: true,
        RedeemQuantity: totalRedeemQuantity,
        Items: items,
      };

      const response = await api.post<any>(apiEndpoints.INIT_ORDER_v2, payload);
      const responseData = (response.data as any) || {};

      if (response.success && responseData.Data) {
        const data = responseData.Data;
        const responseOrderId = data.OrderId;
        const uniqueCode = data.UniqueCode;

        if (responseOrderId && uniqueCode) {
          // Get first selected item for navigation display
          const firstSelectedItemId = Array.from(selectedItems.keys()).find(
            id => selectedItems.get(id)! > 0,
          );
          const firstSelectedItem = selectedOrder?.Items?.find(
            item => item.OrderItemId === firstSelectedItemId,
          );

          const productImage = firstSelectedItem
            ? getMainImage(firstSelectedItem)
            : getMainImage(selectedOrder?.Items?.[0] || ({} as InboxOrderItem));
          const storeName = getStoreName(selectedOrder, isRtl);

          (navigation as any).navigate('ScanQr', {
            OrderId: responseOrderId,
            UniqueCode: uniqueCode,
            productImage,
            storeName,
            quantity: totalRedeemQuantity,
            productName: selectedOrder?.Items?.[0]?.ItemName,
          });
          setOpenBottomSheet(false);
        } else {
          notify.error(
            data.Message ||
              responseData.ResponseMessage ||
              getString('INBOX_FAILED_TO_GENERATE_QR'),
          );
        }
      } else {
        const errorMessage =
          responseData.Data?.Message ||
          responseData.ResponseMessage ||
          response.error ||
          getString('INBOX_FAILED_TO_REDEEM');
        notify.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error redeeming item:', error);
      notify.error(error?.message || getString('INBOX_ERROR_REDEEMING'));
    }
  };

  const handleDeliveryPress = () => {
    navigation.navigate('LocationSelection' as never);
    setOpenBottomSheet(false);
  };

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

  const handleShareGiftLink = async (giftId: number) => {
    const response = await api.get<any>(
      apiEndpoints.GET_SHARE_GIFT_LINK(giftId),
    );
    const responseData = (response.data as any) || {};
    if (response.success && responseData.Data) {
      const data = responseData.Data;
      const giftLink = data.GiftLink;

      const senderName = user?.FullNameEn || user?.FullNameAr || 'Someone';
      const shareMessage = `💝 You have received a gift from ${senderName}. Click on the link below to redeem the gift.\n\n${giftLink}`;

      const shareOptions = Platform.select({
        ios: {
          message: shareMessage,
        },
        android: {
          message: shareMessage,
          title: getString('P_GIFT_ME_ON_GIFTEE'),
        },
      }) || {
        message: shareMessage,
        title: getString('P_GIFT_ME_ON_GIFTEE'),
      };

      await Share.share(shareOptions);
    }
  };

  return {
    orders,
    isLoading,
    isRtl,
    refetch,
    openBottomSheet,
    orderId,
    selectedOrder,
    selectedItem,
    selectedQuantity,
    selectedItems,
    videoViewerData,
    videoViewerRef,
    filterMap,
    search: getInboxOutboxDetails.search,
    setSearch: getInboxOutboxDetails.setSearch,
    loadMore: getInboxOutboxDetails.loadMore,
    loadingMore: getInboxOutboxDetails.loadingMore,
    hasMore: getInboxOutboxDetails.hasMore,
    handleItemPress,
    handleCloseBottomSheet,
    handleQuantityChange,
    handleItemToggle,
    handlePickUpPress,
    handleDeliveryPress,
    handleVideoPress,
    handleCloseVideoViewer,
    handleShareGiftLink,
  };
};
