import {
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { Text, Image } from '../../../utils/elements';
import React, { useState, useRef, useEffect } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import VideoStoryViewer from '../../../components/global/VideoStoryViewer';
import VideoPreloaderManager from '../../../components/global/VideoPreloaderManager';
import useStyles from './style';
import {
  GiftIcon,
  RoundedBackIcon,
  SmsTrackingIcon,
  SvgOutboxShareIcon,
  PlusIcon,
  MinusIcon,
  SvgGiftLink,
  SvgCheckoutGiftLinkIcon,
  SvgEhsanIcon,
  SvgProfileFriends,
  ArrowDownIcon,
  SvgVerifiedIcon,
} from '../../../assets/icons';
import { LinearGradient } from 'react-native-linear-gradient';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import CustomButton from '../../../components/global/Custombutton';
import CheckBox from '../../../components/global/CheckBox';
import { InboxOrder, InboxOrderItem } from '../../../types/index';
import SkeletonLoader from '../../../components/SkeletonLoader';
import {
  useInboxOutboxActions,
  formatRelativeTime,
  getProfileImage,
  getUserName,
  getStoreName,
  getMainImage,
} from './actions';
import { scaleWithMax, rtlMargin, rtlTransform } from '../../../utils';
import { useRoute } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import useDebounceClick from '../../../hooks/useDebounceClick';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
import SearchUserItem from '../../../components/app/SearchUserItem';
import { useAuthStore } from '../../../store/reducer/auth';
import notify from '../../../utils/notify';

const InboxOutbox: React.FC = () => {
  const { getString } = useLocaleStore();
  const route = useRoute();
  const params = route.params as
    | {
        title?: string;
        isInbox?: boolean;
      }
    | undefined;
  const isInbox = params?.isInbox ?? true;
  const title =
    params?.title ??
    (isInbox ? getString('INBOX_TITLE') : getString('OUTBOX_TITLE'));
  const { styles, theme } = useStyles();
  const {
    orders,
    isLoading,
    isRtl,
    openBottomSheet,
    selectedOrder,
    selectedItem,
    selectedQuantity,
    selectedItems,
    videoViewerData,
    videoViewerRef,
    search,
    setSearch,
    loadMore,
    loadingMore,
    hasMore,
    handleItemPress,
    handleCloseBottomSheet,
    handleQuantityChange,
    handleItemToggle,
    handlePickUpPress,
    handleDeliveryPress,
    handleVideoPress,
    handleCloseVideoViewer,
    handleShareGiftLink,
    refetch,
  } = useInboxOutboxActions(isInbox);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { createDebouceClick } = useDebounceClick();

  useEffect(() => {
    if (isRefreshing && !isLoading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, isLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch();
  };

  return (
    <ParentView>
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
          colors={['#FFDDE3', '#FFFFFF']}
          locations={[0.0005, 0.8847]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            flex: 1,
            width: '100%',
          }}
        />
      </View>

      <View style={{ zIndex: 1, backgroundColor: 'transparent' }}>
        <HomeHeader
          showBackButton
          title={title}
          showSearchBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={getString('HOME_SEARCH')}
          customContainerStyle={{
            backgroundColor: 'transparent',
          }}
        />
      </View>
      {isLoading && !isRefreshing ? (
        <SkeletonLoader screenType="inbox" />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={orders}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.PRIMARY}
              colors={[theme.colors.PRIMARY]}
            />
          }
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
              onShareGiftLink={handleShareGiftLink}
            />
          )}
          keyExtractor={item => item.OrderId.toString()}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() => (
            <View
              style={{
                height: theme.sizes.HEIGHT * 0.74,
              }}
            >
              <PlaceholderLogoText text={getString('O_NO_ORDER_FOUND')} />
            </View>
          )}
          ListFooterComponent={
            loadingMore ? (
              <View
                style={{
                  paddingVertical: theme.sizes.HEIGHT * 0.02,
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="small" color={theme.colors.PRIMARY} />
              </View>
            ) : null
          }
          contentContainerStyle={orders.length === 0 ? { flex: 1 } : undefined}
        />
      )}
      <AppBottomSheet
        blurAmount={100}
        isOpen={openBottomSheet}
        height={(() => {
          const availableItems =
            selectedOrder?.Items?.filter(
              item =>
                item.Status !== 10 && item.Quantity - item.UsedQuantity > 0,
            ) || [];
          const availableCount = availableItems.length;

          if (availableCount > 1) {
            return Math.min(
              theme.sizes.HEIGHT * 0.7,
              100 + availableCount * 100,
            );
          }

          // Check if single item has multiple quantity (needs quantity selector)
          if (availableCount === 1) {
            const singleItem = availableItems[0];
            const availableQuantity =
              singleItem.Quantity - singleItem.UsedQuantity;
            if (availableQuantity > 1) {
              // Increase height for quantity selector
              return theme.sizes.HEIGHT * 0.22;
            }
          }

          return theme.sizes.HEIGHT * 0.35;
        })()}
        snapPoints={(() => {
          const availableItems =
            selectedOrder?.Items?.filter(
              item =>
                item.Status !== 10 && item.Quantity - item.UsedQuantity > 0,
            ) || [];
          const availableCount = availableItems.length;

          if (availableCount > 1) {
            return ['75%'];
          }

          // Check if single item has multiple quantity
          if (availableCount === 1) {
            const singleItem = availableItems[0];
            const availableQuantity =
              singleItem.Quantity - singleItem.UsedQuantity;
            if (availableQuantity > 1) {
              return ['45%'];
            }
          }

          return ['35%'];
        })()}
        onClose={handleCloseBottomSheet}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: theme.sizes.PADDING * 2,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bottomSheet}>
            {selectedOrder?.Items &&
              (() => {
                const availableItems = selectedOrder.Items.filter(
                  item =>
                    item.Status !== 10 && item.Quantity - item.UsedQuantity > 0,
                );
                const hasMultipleItems = availableItems.length > 1;

                return availableItems.map((item, index) => {
                  const availableQuantity = item.Quantity - item.UsedQuantity;
                  const selectedQty = selectedItems.get(item.OrderItemId) || 0;
                  const isSelected = selectedQty > 0;
                  const hasMultipleQuantity = availableQuantity > 1;

                  return (
                    <>
                      <View key={item.OrderItemId} style={[styles.itemRow]}>
                        <TouchableOpacity
                          style={styles.itemCheckboxRow}
                          onPress={() =>
                            hasMultipleItems &&
                            handleItemToggle(
                              item.OrderItemId,
                              availableQuantity,
                            )
                          }
                          disabled={!hasMultipleItems}
                        >
                          {hasMultipleItems && (
                            <CheckBox
                              Selected={isSelected}
                              onSelectionPress={() =>
                                handleItemToggle(
                                  item.OrderItemId,
                                  availableQuantity,
                                )
                              }
                            />
                          )}
                          <Image
                            source={getMainImage(item)}
                            style={{
                              width: scaleWithMax(65, 70),
                              height: scaleWithMax(65, 70),
                              borderRadius: theme.sizes.BORDER_RADIUS,
                              marginLeft: hasMultipleItems
                                ? theme.sizes.WIDTH * 0.025
                                : 0,
                            }}
                          />
                          <View
                            style={{
                              flex: 1,
                              marginLeft: theme.sizes.WIDTH * 0.025,
                              // gap: scaleWithMax(10, 12),
                            }}
                          >
                            <Text
                              style={[styles.itemNameText]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {item.ItemName}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <View
                          style={{
                            flexDirection: 'row',
                            position: 'relative',
                          }}
                        >
                          {isSelected && (
                            <View style={styles.quantitySelector}>
                              <TouchableOpacity
                                onPress={() =>
                                  handleQuantityChange(
                                    item.OrderItemId,
                                    'decrement',
                                    availableQuantity,
                                  )
                                }
                                disabled={selectedQty <= 1}
                                style={[
                                  styles.quantityButton,
                                  selectedQty <= 1 &&
                                    styles.quantityButtonDisabled,
                                ]}
                                hitSlop={{
                                  top: 10,
                                  bottom: 10,
                                  left: 10,
                                  right: 10,
                                }}
                              >
                                <MinusIcon
                                  width={scaleWithMax(14, 16)}
                                  height={scaleWithMax(14, 16)}
                                  fill={
                                    selectedQty <= 1
                                      ? '#ccc'
                                      : theme.colors.PRIMARY
                                  }
                                />
                              </TouchableOpacity>
                              <Text style={styles.quantityText}>
                                {selectedQty}
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  handleQuantityChange(
                                    item.OrderItemId,
                                    'increment',
                                    availableQuantity,
                                  )
                                }
                                disabled={selectedQty >= availableQuantity}
                                style={[
                                  styles.quantityButton,
                                  selectedQty >= availableQuantity &&
                                    styles.quantityButtonDisabled,
                                ]}
                                hitSlop={{
                                  top: 10,
                                  bottom: 10,
                                  left: 10,
                                  right: 10,
                                }}
                              >
                                <PlusIcon
                                  width={scaleWithMax(14, 16)}
                                  height={scaleWithMax(14, 16)}
                                  fill={
                                    selectedQty >= availableQuantity
                                      ? '#ccc'
                                      : theme.colors.PRIMARY
                                  }
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                      {index !== availableItems.length - 1 && (
                        <View style={styles.itemSeparator} />
                      )}
                    </>
                  );
                });
              })()}
            <CustomButton
              title={getString('INBOX_CONTINUE')}
              onPress={() => handlePickUpPress()}
              buttonStyle={{
                backgroundColor: !Array.from(selectedItems.values()).some(
                  qty => qty > 0,
                )
                  ? '#FFA5A5'
                  : theme.colors.PRIMARY,
                borderColor: !Array.from(selectedItems.values()).some(
                  qty => qty > 0,
                )
                  ? '#FFA5A5'
                  : theme.colors.PRIMARY,
              }}
              disabled={
                !Array.from(selectedItems.values()).some(qty => qty > 0)
              }
            />
            {selectedOrder?.stores?.IsDeliveryEnabled && (
              <CustomButton
                title={getString('INBOX_DELIVERY')}
                type="secondary"
                onPress={handleDeliveryPress}
                buttonStyle={{ backgroundColor: theme.colors.WHITE }}
              />
            )}
          </View>
        </ScrollView>
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

      {/* Background video preloader for instant playback */}
      <VideoPreloaderManager />
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
  onShareGiftLink?: (giftId: number) => void;
}

const openMap = (
  lat: number,
  lng: number,
  label: string,
  getString: (key: any) => string,
) => {
  if (!lat || !lng) {
    notify.error(getString('INBOX_STORE_LOCATION_NOT_AVAILABLE'));
    return;
  }
  const scheme = Platform.select({
    ios: 'maps://0,0?q=',
    android: 'geo:0,0?q=',
  });

  const latLng = `${lat},${lng}`;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });

  Linking.openURL(url as string).catch(err =>
    console.error('Error opening map', err),
  );
};

const InboxItem: React.FC<InboxItemProps> = ({
  order,
  isLast,
  isRtl,
  onClick,
  isInbox,
  onVideoPress,
  onShareGiftLink,
}) => {
  const { getString } = useLocaleStore();
  const { styles, theme } = useStyles();
  const { user } = useAuthStore();
  const isMerchant = user?.isMerchant === 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEmployeesBottomSheet, setShowEmployeesBottomSheet] =
    useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const profileImage = getProfileImage(order, isInbox);
  const userName = getUserName(order, isInbox);
  const storeName = getStoreName(order, isRtl);
  const isRedeemed =
    order.Items && order.Items.every(item => item.Status === 10);
  const showGiftLinkGeneric = !isInbox && order.SendType === 2 && !isRedeemed;
  const timeAgo = formatRelativeTime(order.OrderTime, getString);
  const { createDebouceClick } = useDebounceClick();

  const hasMultiUsers =
    isMerchant && order.MultiUsers && order.MultiUsers.length > 0;

  const itemGap = theme.sizes.PADDING * 1.2;
  const getItemWidth = () => {
    const profileWidth = scaleWithMax(50, 55);
    const spacing = theme.sizes.WIDTH * 0.012;
    const extraMargin = theme.sizes.PADDING * 0.5;
    return (
      theme.sizes.WIDTH -
      theme.sizes.PADDING * 2 -
      profileWidth -
      spacing -
      extraMargin +
      itemGap
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const itemWidth = getItemWidth();
    const index = Math.round(scrollPosition / itemWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const itemWidth = getItemWidth();
    scrollViewRef.current?.scrollTo({
      x: index * itemWidth,
      animated: true,
    });
  };

  return (
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
        {showGiftLinkGeneric ? (
          <View
            style={[
              styles.inboxProfile,
              {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.PRIMARY,
              },
            ]}
          >
            <SvgCheckoutGiftLinkIcon
              height={scaleWithMax(23, 28)}
              width={scaleWithMax(23, 28)}
            />
          </View>
        ) : (
          <Image
            style={styles.inboxProfile}
            source={
              order.CampaginType === 1
                ? { uri: order.stores.ImageLogo }
                : profileImage
            }
          />
        )}
        <View
          style={{
            flex: 1,
            ...rtlMargin(isRtl, theme.sizes.WIDTH * 0.012, scaleWithMax(6, 8)),
          }}
        >
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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  style={styles.userNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {showGiftLinkGeneric
                    ? getString('INBOX_GIFT_LINK_LABEL')
                    : order.CampaginType === 1
                    ? order.stores.NameEn
                    : userName}
                </Text>
                {!showGiftLinkGeneric &&
                  (!isMerchant
                    ? order?.users?.isVerified
                    : order?.MultiUsers?.[0]?.isVerified) && (
                    <SvgVerifiedIcon />
                  )}
              </View>

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
                <TouchableOpacity
                  style={styles.backIconContainer}
                  hitSlop={8}
                  onPress={() => {
                    openMap(
                      order.stores.Lat,
                      order.stores.Long,
                      storeName,
                      getString,
                    );
                  }}
                >
                  <RoundedBackIcon
                    height={scaleWithMax(8, 8)}
                    width={scaleWithMax(8, 8)}
                    style={{ transform: rtlTransform(isRtl) }}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  ...rtlMargin(isRtl, scaleWithMax(8, 10), 0),
                }}
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
                {order.SendType === 2 && !isInbox && onShareGiftLink && (
                  <TouchableOpacity
                    onPress={() => {
                      if (order.Status === 10) {
                        notify.error(getString('INBOX_GIFT_ALREADY_REDEEMED'));
                        return;
                      }
                      createDebouceClick('share-gift', () =>
                        onShareGiftLink(order.OrderId),
                      );
                    }}
                  >
                    <SvgOutboxShareIcon
                      height={scaleWithMax(20, 20)}
                      width={scaleWithMax(20, 20)}
                      style={{ transform: rtlTransform(isRtl) }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          {order.EhsaanAmount > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                marginTop: scaleWithMax(3, 4),
              }}
            >
              <Text
                style={{
                  ...theme.globalStyles.TEXT_STYLE,
                  fontSize: theme.sizes.FONTSIZE_MEDIUM,
                  color: theme.colors.PRIMARY_TEXT,
                }}
              >
                {getString('INBOX_GOOD_DEED_MESSAGE')}
              </Text>
              <SvgEhsanIcon style={{ position: 'absolute', end: -3 }} />
            </View>
          )}

          {/* Slider with ScrollView */}
          <View
            style={{
              paddingBottom: theme.sizes.PADDING * 0.3,
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
              snapToInterval={getItemWidth()}
              snapToAlignment="start"
              contentContainerStyle={{
                paddingVertical: theme.sizes.HEIGHT * 0.014,
                gap: itemGap,
              }}
              style={{
                overflow: 'visible',
              }}
            >
              {order.Items?.map((item, index) => {
                const itemImage = getMainImage(item);
                const allItemsRedeemed =
                  order.Items && order.Items.every(item => item.Status === 10);

                return (
                  <TouchableOpacity
                    key={`item-${order.OrderId}-${index}`}
                    onPress={() => onClick && onClick(item)}
                    activeOpacity={isInbox ? 0.8 : 1}
                    style={styles.imageContainer}
                  >
                    {item.Status === 10 && (
                      <View style={styles.redeemedBox}>
                        <Text
                          style={{
                            // color: theme.colors.WHITE,
                            ...theme.globalStyles.TEXT_STYLE,
                            color: theme.colors.WHITE,
                            fontSize: theme.sizes.FONTSIZE_MEDIUM,
                          }}
                        >
                          {getString('INBOX_REDEEMED')}
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

                      {item.Quantity - item.UsedQuantity > 0 && (
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

      {/* Employees Bottom Sheet */}
      {hasMultiUsers && (
        <AppBottomSheet
          isOpen={showEmployeesBottomSheet}
          onClose={() => setShowEmployeesBottomSheet(false)}
          height={Math.min(
            theme.sizes.HEIGHT * 0.7,
            100 + (order.MultiUsers?.length || 0) * 60,
          )}
          snapPoints={['70%']}
        >
          <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
            <Text
              style={{
                ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
                fontSize: theme.sizes.FONTSIZE_MED_HIGH,
                paddingTop: theme.sizes.HEIGHT * 0.014,
                paddingBottom: theme.sizes.HEIGHT * 0.008,
              }}
            >
              {getString('INBOX_MY_EMPLOYEES')}
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.WHITE,
                borderRadius: 16,
                ...theme.globalStyles.SHADOW_STYLE,
                marginTop: theme.sizes.HEIGHT * 0.01,
                marginBottom: theme.sizes.HEIGHT * 0.024,
              }}
            >
              <FlatList
                data={order.MultiUsers || []}
                keyExtractor={item => item.UserId.toString()}
                renderItem={({ item, index }) => (
                  <SearchUserItem
                    item={{
                      UserId: item.UserId,
                      FullName: item.FullName || '',
                      Email: undefined,
                      PhoneNo: item.PhoneNo || '',
                      ProfileUrl: item.ProfileUrl || null,
                      RelationStatus: 1,
                      CityId: item.CityId || undefined,
                      IsVerified: item.isVerified === true,
                    }}
                    index={index}
                    isLast={index === (order.MultiUsers?.length || 0) - 1}
                    showAddButton={false}
                    showSelection={false}
                    isGeneralSearchScreen={false}
                    onPress={() => {}}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 0,
                }}
              />
            </View>
          </View>
        </AppBottomSheet>
      )}
    </View>
  );
};

export default InboxOutbox;
