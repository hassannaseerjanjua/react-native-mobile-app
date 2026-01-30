import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ImageSourcePropType, Share, Platform, Image } from 'react-native';
import useGetApi from '../../../hooks/useGetApi';
import { useListingApi } from '../../../hooks/useListingApi';
import apiEndpoints from '../../../constants/api-endpoints';
import { InboxOrder, InboxOrderItem, GiftFilter } from '../../../types/index';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useAuthStore } from '../../../store/reducer/auth';
import api from '../../../utils/api';
import notify from '../../../utils/notify';
import {
  queueVideosForPreload,
  extractVideoUrls,
  isVideoPreloaded,
} from '../../../utils/videoPreloader';

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
    return order.users?.FullName || order.FriendName || '';
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
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<InboxOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<InboxOrderItem | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
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

  const isMerchantBool = useAuthStore().user?.isMerchant;
console.log('isMerchant', isMerchantBool);
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
      pageSize: 5,
      extraParams: { inbox: isInbox, isMerchant: !!isMerchantBool },
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

  // Preload videos when orders are loaded
  useEffect(() => {
    if (orders.length > 0) {
      const videoUrls = extractVideoUrls(orders);
      if (videoUrls.length > 0) {
        console.log(
          `[InboxOutbox] Queueing ${videoUrls.length} videos for preload`,
        );
        queueVideosForPreload(videoUrls);
      }
    }
  }, [orders]);

  const handleItemPress = (orderId: number, itemId: InboxOrderItem) => {
    setOrderId(orderId);
    const selectedOrder = orders.find(o => o.OrderId === orderId) as any;

    const allItemsRedeemed =
      selectedOrder?.Items &&
      selectedOrder.Items.every((item: InboxOrderItem) => item.Status === 10);

    if (allItemsRedeemed) {
      notify.error(getString('INBOX_ITEM_ALREADY_REDEEMED'));
      return;
    }
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
    setSelectedItem(itemId);

    if (hasMultipleItems) {
      setOpenBottomSheet(true);
      return;
    }

    const availableQuantity = itemId.Quantity - itemId.UsedQuantity;
    setSelectedQuantity(availableQuantity);

    if (availableQuantity === 1 && !selectedOrder?.stores?.IsDeliveryEnabled) {
      const itemsArray = [
        {
          OrderItemId: itemId.OrderItemId,
          Quantity: availableQuantity,
        },
      ];
      handlePickUpPress(itemsArray, orderId, selectedOrder);
      return;
    }

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

  const handlePickUpPress = async (
    overrideItems?: Array<{ OrderItemId: number; Quantity: number }>,
    overrideOrderId?: number,
    overrideSelectedOrder?: InboxOrder | null,
  ) => {
    // Use override values if provided, otherwise use state
    const currentOrderId = overrideOrderId ?? orderId;
    const currentSelectedOrder = overrideSelectedOrder ?? selectedOrder;

    if (!currentSelectedOrder || !currentOrderId) {
      notify.error('Order information is missing');
      return;
    }

    const allItemsRedeemed =
      currentSelectedOrder?.Items &&
      currentSelectedOrder.Items.every(
        (item: InboxOrderItem) => item.Status === 10,
      );

    if (allItemsRedeemed) {
      notify.error(getString('INBOX_ITEM_ALREADY_REDEEMED'));
      return;
    }

    const items: Array<{ OrderItemId: number; Quantity: number }> = [];
    let totalRedeemQuantity = 0;

    const isEventObject =
      overrideItems &&
      typeof overrideItems === 'object' &&
      'nativeEvent' in overrideItems;

    if (overrideItems && !isEventObject && Array.isArray(overrideItems)) {
      items.push(...overrideItems);
      totalRedeemQuantity = overrideItems.reduce(
        (sum, item) => sum + item.Quantity,
        0,
      );
    } else {
      // Build from selectedItems state
      selectedItems.forEach((quantity, orderItemId) => {
        if (quantity > 0) {
          items.push({
            OrderItemId: orderItemId,
            Quantity: quantity,
          });
          totalRedeemQuantity += quantity;
        }
      });

      if (items.length === 0 && currentSelectedOrder?.Items) {
        const availableItems = currentSelectedOrder.Items.filter(
          (item: InboxOrderItem) =>
            item.Status !== 10 && item.Quantity - item.UsedQuantity > 0,
        );
        if (availableItems.length > 0) {
          if (availableItems.length === 1) {
            const item = availableItems[0];
            const availableQty = item.Quantity - item.UsedQuantity;
            items.push({
              OrderItemId: item.OrderItemId,
              Quantity: availableQty,
            });
            totalRedeemQuantity = availableQty;
          }
        }
      }
    }

    if (items.length === 0) {
      notify.error('Please select at least one item');
      return;
    }

    try {
      const payload = {
        orderid: currentOrderId,
        orderPaymentType: 1,
        IsRedeem: true,
        RedeemQuantity: totalRedeemQuantity,
        Items: items,
      };

      const response = await api.post<any>(apiEndpoints.INIT_ORDER_v2, payload);
      const responseData = (response.data as any) || {};

      console.log('selectedOrder', currentSelectedOrder);
      

      if (response.success && responseData.Data) {
        const data = responseData.Data;
        const responseOrderId = data.OrderId;
        const uniqueCode = data.UniqueCode;   
        const giftLink = data.GiftLink || '';

        if (giftLink) {

          notify.success('Gift token found');

          let giftToken: string | null = null;
          const gifttokenIndex = giftLink.indexOf('gifttoken=');
  
          if (gifttokenIndex !== -1) {
            const tokenStart = gifttokenIndex + 'gifttoken='.length;
            const remainingUrl = giftLink.substring(tokenStart);
            const tokenEnd = remainingUrl.indexOf('&');
            giftToken =
              tokenEnd !== -1
                ? remainingUrl.substring(0, tokenEnd)
                : remainingUrl;
          }
  
          if (!giftToken) {
            console.log('No gifttoken parameter found in URL');
            return;
          }
  
          console.log('Extracted gifttoken:', giftToken);


          const response = await api.get(
            apiEndpoints.GET_GIFT_DETAILS(giftToken),
          );
          if (response.success && response.data) {
            const responseData = response.data as any;
            const giftData = responseData?.Data?.data;
  
            if (!giftData) {
              console.log('No gift data found in response');
              return;
            }
  
            // Map API response to ScanQr screen params
            const defaultItemImage = require('../../../assets/images/img-placeholder.png');
            const selectedItems =
              giftData.Items?.map((item: any) => ({
                OrderItemId: item.OrderItemId,
                ItemName: item.ItemName,
                ItemImage: item.ItemImage
                  ? { uri: item.ItemImage }
                  : defaultItemImage,
                Quantity: item.Quantity,
              })) || [];
  
            // Navigate to ScanQr screen
            (navigation as any).navigate('ScanQr', {
                  OrderId: giftData.OrderId,
                  UniqueCode: giftData.QRUniqueCode,
                  storeName: giftData.StoreName,
                  selectedItems: selectedItems,
                  // For single item fallback
                  productImage: selectedItems[0]?.ItemImage,
                  productName: selectedItems[0]?.ItemName,
                  quantity: selectedItems[0]?.Quantity || 1,
                })
              
            
          }
          console.log('responseData', responseData);
          return;
        }

        if (responseOrderId && uniqueCode) {
          const firstSelectedItemId = overrideItems
            ? overrideItems[0]?.OrderItemId
            : Array.from(selectedItems.keys()).find(
                id => selectedItems.get(id)! > 0,
              ) || items[0]?.OrderItemId;
          const firstSelectedItem = currentSelectedOrder?.Items?.find(
            item => item.OrderItemId === firstSelectedItemId,
          );

          const productImage = firstSelectedItem
            ? getMainImage(firstSelectedItem)
            : getMainImage(
                currentSelectedOrder?.Items?.[0] || ({} as InboxOrderItem),
              );
          const storeName = getStoreName(currentSelectedOrder, isRtl);

          // Build selected items array for navigation
          const selectedItemsForNav = items.map(item => {
            const orderItem = currentSelectedOrder?.Items?.find(
              oi => oi.OrderItemId === item.OrderItemId,
            );
            return {
              OrderItemId: item.OrderItemId,
              ItemName: orderItem?.ItemName || '',
              ItemImage: orderItem ? getMainImage(orderItem) : productImage,
              Quantity: item.Quantity,
            };
          });

         
          
          
          (navigation as any).navigate('ScanQr', {
            OrderId: responseOrderId,
            UniqueCode: uniqueCode,
            productImage,
            storeName,
            quantity: totalRedeemQuantity,
            productName: currentSelectedOrder?.Items?.[0]?.ItemName,
            selectedItems: selectedItemsForNav,

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

    // Check if video is already preloaded for faster playback
    const videoIsPreloaded = videoUrl ? isVideoPreloaded(videoUrl) : false;

    if (hasVideo && videoUrl && !videoIsPreloaded) {
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

    // Determine delay based on what needs to be loaded
    // If video is preloaded, we can show faster
    const showDelay = videoIsPreloaded ? 50 : 150;

    // Preload filter image if it exists before showing viewer
    if (filterImageUrl) {
      Image.prefetch(filterImageUrl)
        .then(() => {
          // Filter image loaded, now show the viewer
          setTimeout(() => {
            setVideoViewerData(prev => ({
              ...prev,
              visible: true,
            }));
          }, showDelay);
        })
        .catch(() => {
          // Even if prefetch fails, show the viewer (image will load on display)
          setTimeout(() => {
            setVideoViewerData(prev => ({
              ...prev,
              visible: true,
            }));
          }, showDelay);
        });
    } else {
      // No filter image, show quickly
      setTimeout(() => {
        setVideoViewerData(prev => ({
          ...prev,
          visible: true,
        }));
      }, showDelay);
    }
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

      const shareMessage = `💝 You have received a gift. Click on the link below to redeem the gift.\n\n${giftLink}`;

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
