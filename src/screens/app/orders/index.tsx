import React from 'react';
import { View, StatusBar, ScrollView, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { SvgRiyalIcon } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { useLocaleStore } from '../../../store/reducer/locale';
import useGetApi from '../../../hooks/useGetApi';
import apiEndpoints from '../../../constants/api-endpoints';
import { Order, OrdersApiResponse } from '../../../types/index';

const getStatusText = (
  status: number,
  getString: (key: 'O_PENDING') => string,
): string => {
  const statusMap: { [key: number]: string } = {
    1: getString('O_PENDING'),
    2: 'Approved',
    3: 'Declined',
    4: 'Redeemed',
  };
  return statusMap[status] ?? getString('O_PENDING');
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${day}-${month} at ${formattedHours}:${formattedMinutes}${ampm}`;
};

const OrdersScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();

  const orderHistory = useGetApi<OrdersApiResponse['Data']>(
    apiEndpoints.GET_ORDER_HISTORY,
    {
      transformData: (data: any) => data?.Data,
      withAuth: true,
    },
  );

  const orders = orderHistory.data?.Items ?? [];
  const isLoading = orderHistory.loading;

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
      />

      {isLoading ? (
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
  const itemName = firstItem?.ItemName || getString('O_FLOWER_BOUQUET');
  const storeName = order.FriendName || getString('O_COFFEEMATICS');
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
          <Text style={styles.detailValue}>{formatDate(orderDate)}</Text>
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
                <View style={styles.priceContainer}>
                  <SvgRiyalIcon
                    width={scaleWithMax(12, 14)}
                    height={scaleWithMax(12, 14)}
                  />
                  <Text style={styles.itemPrice}>{itemTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{getString('O_TOTAL_AMOUNT')}</Text>
          <View style={styles.priceContainer}>
            <SvgRiyalIcon
              width={scaleWithMax(12, 14)}
              height={scaleWithMax(12, 14)}
            />
            <Text style={styles.totalValue}>
              {order.TotalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default OrdersScreen;
