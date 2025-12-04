import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ImageSourcePropType } from 'react-native';
import useGetApi from '../../../hooks/useGetApi';
import apiEndpoints from '../../../constants/api-endpoints';
import { InboxOrder, InboxApiResponseData } from '../../../types/index';
import { useLocaleStore } from '../../../store/reducer/locale';

const defaultProfileImage = require('../../../assets/images/user.png');
const defaultItemImage = require('../../../assets/images/dummy1.png');

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
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

export const getProfileImage = (order: InboxOrder): ImageSourcePropType => {
  return order.FriendImageUrl
    ? { uri: order.FriendImageUrl }
    : defaultProfileImage;
};

export const getUserName = (order: InboxOrder): string => {
  if (order.FriendName) {
    return order.FriendName;
  }
  return order.users?.FullName || '';
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

export const getMainImage = (order: InboxOrder): ImageSourcePropType => {
  if (order.Items && order.Items.length > 0) {
    const firstItem = order.Items[0];
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
  }

  return defaultItemImage;
};

export const getItemCount = (order: InboxOrder): number => {
  if (order.orderImages && order.orderImages.length > 0) {
    return order.orderImages.length;
  }
  if (order.Items && order.Items.length > 0) {
    return order.Items.length;
  }
  return 0;
};

export const getItemName = (order: InboxOrder): string => {
  if (order.Items && order.Items.length > 0) {
    return order.Items[0].ItemName || '';
  }
  return '';
};

export const useInboxOutboxActions = (isInbox: boolean = true) => {
  const navigation = useNavigation();
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const { isRtl } = useLocaleStore();

  const getInboxOutboxDetails = useGetApi<InboxApiResponseData['Data']>(
    apiEndpoints.GET_INBOX_OUTBOX_DETAILS(isInbox),
    {
      transformData: (data: any) => data?.Data,
      withAuth: true,
    },
  );

  const orders = getInboxOutboxDetails.data?.Items || [];
  const isLoading = getInboxOutboxDetails.loading;

  return {
    orders,
    isLoading,
    isRtl,
  };
};
