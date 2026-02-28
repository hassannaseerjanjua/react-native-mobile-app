import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text, Image } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { SvgGiftClaimIcon, SvgRiyalIcon } from '../../../assets/icons';
import PriceWithIcon from '../../../components/global/Price';
import { scaleWithMax } from '../../../utils';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useListingApi } from '../../../hooks/useListingApi';
import { useAuthStore } from '../../../store/reducer/auth';
import apiEndpoints from '../../../constants/api-endpoints';
import { Order, OrdersApiResponse } from '../../../types/index';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';

const getStatusText = (
  status: number,
  getString: (key: 'O_PENDING' | 'O_REDEEMED') => string,
): string => {
  const statusMap: { [key: number]: string } = {
    1: getString('O_PENDING'),
    // 5: 'Added to Cart',
    6: getString('O_PENDING'),
    // 7: 'QR Generated',
    // 8: 'Approved',
    // 9: 'Declined',
    10: getString('O_REDEEMED'),
    // 10: 'Redeemed',
  };

  return statusMap[status] ?? getString('O_PENDING');
};
const formatDate = (
  dateString: string,
  getString: (
    key:
      | 'ORDERS_MONTH_JANUARY'
      | 'ORDERS_MONTH_FEBRUARY'
      | 'ORDERS_MONTH_MARCH'
      | 'ORDERS_MONTH_APRIL'
      | 'ORDERS_MONTH_MAY'
      | 'ORDERS_MONTH_JUNE'
      | 'ORDERS_MONTH_JULY'
      | 'ORDERS_MONTH_AUGUST'
      | 'ORDERS_MONTH_SEPTEMBER'
      | 'ORDERS_MONTH_OCTOBER'
      | 'ORDERS_MONTH_NOVEMBER'
      | 'ORDERS_MONTH_DECEMBER'
      | 'ORDERS_TIME_AM'
      | 'ORDERS_TIME_PM'
      | 'ORDERS_DATE_AT',
  ) => string,
): string => {
  const date = new Date(dateString);
  const months = [
    getString('ORDERS_MONTH_JANUARY'),
    getString('ORDERS_MONTH_FEBRUARY'),
    getString('ORDERS_MONTH_MARCH'),
    getString('ORDERS_MONTH_APRIL'),
    getString('ORDERS_MONTH_MAY'),
    getString('ORDERS_MONTH_JUNE'),
    getString('ORDERS_MONTH_JULY'),
    getString('ORDERS_MONTH_AUGUST'),
    getString('ORDERS_MONTH_SEPTEMBER'),
    getString('ORDERS_MONTH_OCTOBER'),
    getString('ORDERS_MONTH_NOVEMBER'),
    getString('ORDERS_MONTH_DECEMBER'),
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm =
    hours >= 12 ? getString('ORDERS_TIME_PM') : getString('ORDERS_TIME_AM');
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${day}-${month} ${getString(
    'ORDERS_DATE_AT',
  )} ${formattedHours}:${formattedMinutes}${ampm}`;
};

const OrdersScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();
  const { token } = useAuthStore();

  const ordersListing = useListingApi<Order>(
    apiEndpoints.GET_ORDER_HISTORY,
    token,
    {
      idExtractor: (item: Order) => item.OrderId,
      transformData: (data: OrdersApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
    },
  );

  const orders = ordersListing.data ?? [];
  const isLoading = ordersListing.loading;
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isRefreshing && !isLoading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, isLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    ordersListing.recall();
  };

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={getString('O_ORDERS')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showSearchBar={true}
        searchPlaceholder={getString('O_SEARCH_ORDER')}
        searchValue={ordersListing.search}
        onSearchChange={ordersListing.setSearch}
      />

      {isLoading && !isRefreshing ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <SkeletonLoader screenType="orderListing" />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.OrderId.toString()}
          contentContainerStyle={[
            styles.scrollContent,
            styles.contentContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.PRIMARY}
              colors={[theme.colors.PRIMARY]}
            />
          }
          onEndReached={() => {
            if (ordersListing.hasMore && !ordersListing.loadingMore) {
              ordersListing.loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() => (
            <View
              style={{
                height: theme.sizes.HEIGHT * 0.68,
              }}
            >
              <PlaceholderLogoText text={getString('O_NO_ORDER_FOUND')} />
            </View>
          )}
          ListFooterComponent={() => {
            if (ordersListing.loadingMore) {
              return (
                <View style={{ padding: theme.sizes.PADDING }}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.PRIMARY}
                  />
                </View>
              );
            }
            return null;
          }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: theme.sizes.PADDING * 0.8 }}>
              <OrderCard order={item} />
            </View>
          )}
        />
      )}
    </ParentView>
  );
};

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { styles } = useStyles();
  const { getString, isRtl } = useLocaleStore();

  const firstItem = order.Items?.[0];
  const thumbnailUrl = order?.Items?.[0]?.ThumbnailUrl;
  const itemImage =
    thumbnailUrl && thumbnailUrl.trim()
      ? { uri: thumbnailUrl }
      : require('../../../assets/images/img-placeholder.png');
  const itemName = firstItem?.ItemName;
  const storeName = order.FriendName;
  const phoneNumber = order.stores?.PhoneNo || 'nahi mila';
  const orderDate = order.OrderTime || new Date().toISOString();

  return (
    <View style={styles.orderCard}>
      <View style={styles.rowContainer}>
        <View style={styles.leftSection}>
          <View style={styles.imageContainer}>
            <Image source={itemImage} style={styles.orderCardImage} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.orderCardTitle}>{itemName}</Text>
            <Text style={styles.orderCardSubtitle}>{storeName}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.statusBadge}>
            <Text style={styles.orderCardStatus}>
              {getStatusText(order.Status, getString)}
            </Text>
          </View>
          <View style={styles.orderNumberBadge}>
            <Text style={styles.orderCardNumber}>
              {getString('O_ORDER_NUMBER')} {order.OrderId}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderDetailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{getString('O_PHONE_NUMBER')}</Text>
          <Text style={styles.detailValue}>{phoneNumber}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{getString('O_ORDER_TIME')}:</Text>
          <Text style={styles.detailValue}>
            {formatDate(orderDate, getString)}
          </Text>
        </View>

        {order.Items?.map(item => {
          const itemTotal = item.OrderAmount ?? item.UnitPrice * item.Quantity;
          const variantName = isRtl
            ? item.Variant?.NameAr ?? item.Variant?.NameEn
            : item.Variant?.NameEn ?? item.Variant?.NameAr;
          return (
            <View key={item.OrderItemId} style={styles.itemRow}>
              <Text style={styles.detailLabel}>
                {item.Quantity}x {item.ItemName}
              </Text>
              <View style={styles.itemDetails}>
                {!!variantName && (
                  <Text
                    style={styles.itemSize}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {variantName}
                  </Text>
                )}
                <PriceWithIcon
                  amount={itemTotal.toFixed(2)}
                  textStyle={styles.itemPrice}
                  containerStyle={styles.priceContainer}
                  icon={
                    <SvgRiyalIcon
                      width={scaleWithMax(12, 14)}
                      height={scaleWithMax(12, 14)}
                    />
                  }
                />
              </View>
            </View>
          );
        })}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{getString('O_TOTAL_AMOUNT')}</Text>
          <View style={styles.priceContainer}>
            {order.TotalAmount > 0 ? (
              <PriceWithIcon
                amount={order.TotalAmount.toFixed(2)}
                textStyle={styles.totalValue}
                containerStyle={styles.priceContainer}
                icon={
                  <SvgRiyalIcon
                    width={scaleWithMax(12, 14)}
                    height={scaleWithMax(12, 14)}
                  />
                }
              />
            ) : (
              <SvgGiftClaimIcon />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default OrdersScreen;
