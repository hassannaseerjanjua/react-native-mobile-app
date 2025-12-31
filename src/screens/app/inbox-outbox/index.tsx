import {
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../../../utils/elements';
import React, { useState, useRef } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import VideoStoryViewer from '../../../components/global/VideoStoryViewer';
import useStyles from './style';
import {
  GiftIcon,
  RoundedBackIcon,
  SmsTrackingIcon,
  SvgOutboxShareIcon,
  PlusIcon,
  MinusIcon,
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
import { scaleWithMax } from '../../../utils';
import { useRoute } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import useDebounceClick from '../../../hooks/useDebounceClick';

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
  const title = params?.title ?? (isInbox ? 'Inbox' : 'Outbox');
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
  } = useInboxOutboxActions(isInbox);

  const { createDebouceClick } = useDebounceClick();

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
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={getString('HOME_SEARCH')}
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
              onShareGiftLink={handleShareGiftLink}
            />
          )}
          keyExtractor={item => item.OrderId.toString()}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
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
          return theme.sizes.HEIGHT * 0.35;
        })()}
        snapPoints={(() => {
          const availableItems =
            selectedOrder?.Items?.filter(
              item =>
                item.Status !== 10 && item.Quantity - item.UsedQuantity > 0,
            ) || [];
          return availableItems.length > 1 ? ['70%'] : ['35%'];
        })()}
        onClose={handleCloseBottomSheet}
      >
        <ScrollView
          style={{ maxHeight: theme.sizes.HEIGHT * 0.6 }}
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

                return availableItems.map(item => {
                  const availableQuantity = item.Quantity - item.UsedQuantity;
                  const selectedQty = selectedItems.get(item.OrderItemId) || 0;
                  const isSelected = selectedQty > 0;
                  const hasMultipleQuantity = availableQuantity > 1;

                  return (
                    <View
                      key={item.OrderItemId}
                      style={[
                        styles.itemRow,
                        { marginBottom: theme.sizes.PADDING * 0.5 },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.itemCheckboxRow}
                        onPress={() =>
                          hasMultipleItems &&
                          handleItemToggle(item.OrderItemId, availableQuantity)
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
                            width: scaleWithMax(60, 65),
                            height: scaleWithMax(60, 65),
                            borderRadius: theme.sizes.BORDER_RADIUS,
                            marginLeft: hasMultipleItems
                              ? theme.sizes.PADDING * 0.7
                              : 0,
                          }}
                        />
                        <View
                          style={{
                            flex: 1,
                            marginLeft: theme.sizes.PADDING * 0.7,
                            gap: scaleWithMax(18, 20),
                          }}
                        >
                          <Text
                            style={[styles.itemNameText]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.ItemName}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              position: 'relative',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: scaleWithMax(11, 12),
                                color: theme.colors.SECONDARY_TEXT,
                              }}
                            >
                              Available: {availableQuantity}
                            </Text>
                            {isSelected && hasMultipleQuantity && (
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
                      </TouchableOpacity>
                    </View>
                  );
                });
              })()}
            <CustomButton
              title={'Pick Up'}
              onPress={handlePickUpPress}
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
                title="Delivery"
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

const InboxItem: React.FC<InboxItemProps> = ({
  order,
  isLast,
  isRtl,
  onClick,
  isInbox,
  onVideoPress,
  onShareGiftLink,
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
                <Text
                  style={styles.userNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
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
                  {order.SendType === 2 && onShareGiftLink && (
                    <TouchableOpacity
                      onPress={() =>
                        createDebouceClick('share-gift', () =>
                          onShareGiftLink(order.OrderId),
                        )
                      }
                    >
                      <SvgOutboxShareIcon
                        height={scaleWithMax(20, 20)}
                        width={scaleWithMax(20, 20)}
                      />
                    </TouchableOpacity>
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
                      // disabled={item.Status === 10}
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
      </View>
    </View>
  );
};

export default InboxOutbox;
