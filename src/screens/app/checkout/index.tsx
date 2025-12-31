import {
  Image,
  Platform,
  ScrollView,
  Share,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import {
  ArrowDownIcon,
  DecrementIcon,
  GiftIcon,
  IncrementIcon,
  PlusIcon,
  SvgEhsanIcon,
  SvgGifteeWalletIcon,
  SvgGiftLink,
  SvgGiftSentIcon,
  SvgLinkShareIcon,
  SvgRiyalIcon,
  SvgRiyalIconWhite,
  SvgSelectedCheck,
  VisaIcon,
} from '../../../assets/icons';
import {
  scaleWithMax,
  rtlTransform,
  rtlFlexDirection,
  rtlPosition,
} from '../../../utils';
import CheckBox from '../../../components/global/CheckBox';
import PriceWithIcon from '../../../components/global/Price';
import CustomButton from '../../../components/global/Custombutton';
import { StackActions, useNavigation } from '@react-navigation/native';
import CustomFooter from '../../../components/global/CustomFooter';
import { Text } from '../../../utils/elements';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import { AppStackScreen } from '../../../types/navigation.types';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import { useLocaleStore } from '../../../store/reducer/locale';
import { CartResponse, CartItem } from '../../../types';
import SkeletonLoader from '../../../components/SkeletonLoader';
import notify from '../../../utils/notify';
import useGetApi from '../../../hooks/useGetApi';
import InputField from '../../../components/global/InputField';
import { getVideoUploadPromise } from '../../../utils/videoUploadState';
import { useAuthStore } from '../../../store/reducer/auth';
import SuccessMessage from '../../../components/global/SuccessComponent';

const CheckOut: React.FC<AppStackScreen<'CheckOut'>> = ({ route }) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, langCode } = useLocaleStore();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const { isVideoUploading } = (route.params as any) || {};

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waitingForVideoUpload, setWaitingForVideoUpload] = useState(false);
  const [updatingQuantities, setUpdatingQuantities] = useState<
    Record<number, 'increment' | 'decrement' | null>
  >({});
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [giftLink, setGiftLink] = useState<string | null>(null);

  const cartItemsApi = useGetApi<CartResponse>(apiEndpoints.GET_CART_ITEMS, {
    transformData: (data: any) => {
      setCartData(data?.Data);
      return (data?.Data || data) as CartResponse;
    },
  });

  const walletBalance = useGetApi<any>(apiEndpoints.GET_WALLET_BALANCE, {
    transformData: data => data.Data,
  });

  const [cartData, setCartData] = useState<CartResponse | null>(
    cartItemsApi.data,
  );
  const loading = cartItemsApi.loading;

  // useEffect(() => {
  //   if (cartItemsApi.data) {
  //     setCartData(cartItemsApi.data);
  //   }
  // }, [cartItemsApi.data]);

  const removeCartItem = async (
    item: CartItem,
    skipStateUpdate = false,
  ): Promise<boolean> => {
    const originalCartData = cartData
      ? JSON.parse(JSON.stringify(cartData))
      : null;

    if (cartData && !skipStateUpdate) {
      const updatedItems = cartData.Items.filter(
        cartItem => cartItem.OrderItemId !== item.OrderItemId,
      );

      const newOrderAmount = updatedItems.reduce(
        (sum, cartItem) => sum + cartItem.OrderAmount,
        0,
      );
      const newTotalDiscount = cartData.TotalDiscount;
      const newTotalVat = cartData.TotalVat;
      const newDeliveryCharges = cartData.DeliveryCharges;
      const newTotalAmount =
        newOrderAmount - newTotalDiscount + newTotalVat + newDeliveryCharges;

      setCartData({
        ...cartData,
        Items: updatedItems,
        OrderAmount: newOrderAmount,
        TotalAmount: newTotalAmount,
      });
    }

    try {
      setUpdatingQuantities(prev => ({
        ...prev,
        [item.OrderItemId]: 'decrement',
      }));

      const payload = {
        ItemId: item.ItemId,
        ItemVariantId: item.Variant?.ItemVariantId,
      };

      const response = await api.post(apiEndpoints.REMOVE_CART_BY_ID, payload);
      if (!response.success) {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        if (originalCartData && !skipStateUpdate) {
          setCartData(originalCartData);
        }
        return false;
      }
      return true;
    } catch (error: any) {
      console.error('Error removing cart item:', error);
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      if (originalCartData && !skipStateUpdate) {
        setCartData(originalCartData);
      }
      return false;
    } finally {
      setUpdatingQuantities(prev => {
        const newState = { ...prev };
        delete newState[item.OrderItemId];
        return newState;
      });
    }
  };

  const handleQuantityChange = async (
    item: CartItem,
    type: 'increment' | 'decrement',
  ) => {
    const newQuantity =
      type === 'increment' ? item.Quantity + 1 : item.Quantity - 1;

    if (updatingQuantities[item.OrderItemId]) {
      return;
    }

    // Show confirmation if trying to remove item (quantity is 1 and decrementing)
    if (item.Quantity === 1 && type === 'decrement') {
      setItemToRemove(item);
      return;
    }

    const originalCartData = cartData
      ? JSON.parse(JSON.stringify(cartData))
      : null;

    if (newQuantity < 1) {
      await removeCartItem(item);
      return;
    }

    if (cartData) {
      const updatedItems = cartData.Items.map(cartItem => {
        if (cartItem.OrderItemId === item.OrderItemId) {
          const newTotalAmount = cartItem.UnitPrice * newQuantity;
          return {
            ...cartItem,
            Quantity: newQuantity,
            TotalAmount: newTotalAmount,
            OrderAmount: newTotalAmount,
          };
        }
        return cartItem;
      });

      const newOrderAmount = updatedItems.reduce(
        (sum, cartItem) => sum + cartItem.OrderAmount,
        0,
      );
      const newTotalDiscount = cartData.TotalDiscount;
      const newTotalVat = cartData.TotalVat;
      const newDeliveryCharges = cartData.DeliveryCharges;
      const newTotalAmount =
        newOrderAmount - newTotalDiscount + newTotalVat + newDeliveryCharges;

      setCartData({
        ...cartData,
        Items: updatedItems,
        OrderAmount: newOrderAmount,
        TotalAmount: newTotalAmount,
      });
    }

    try {
      setUpdatingQuantities(prev => ({
        ...prev,
        [item.OrderItemId]: type,
      }));

      const payload = {
        ItemId: item.ItemId,
        ItemVariantId: item.Variant?.ItemVariantId,
        Quantity: newQuantity,
      };

      const response = await api.put(
        apiEndpoints.UPDATE_CART_ITEM_QUANTITY,
        payload,
      );
      if (!response.success) {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        if (originalCartData) {
          setCartData(originalCartData);
        }
      }
    } catch (error: any) {
      console.error('Error updating cart item quantity:', error);
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      if (originalCartData) {
        setCartData(originalCartData);
      }
    } finally {
      setUpdatingQuantities(prev => {
        const newState = { ...prev };
        delete newState[item.OrderItemId];
        return newState;
      });
    }
  };

  const handleClearCart = async () => {
    setShowRemoveConfirmation(false);
    const response = await api.put(apiEndpoints.CLEAR_CART, {});
    if (response.success) {
      navigation.dispatch(StackActions.popToTop());
    } else {
      notify.error(response.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  const handleRemoveItem = async () => {
    if (!itemToRemove) return;

    const item = itemToRemove;
    const isLastItem = cartData?.Items?.length === 1;
    setItemToRemove(null);

    // If it's the last item, use clear cart API instead of remove item API
    if (isLastItem) {
      await handleClearCart();
    } else {
      await removeCartItem(item);
    }
  };

  const renderCartItem = (item: CartItem) => {
    const itemImage = item.Images?.[0]?.ImageUrls || item.ThumbnailUrl;
    const imageSource = itemImage
      ? { uri: itemImage }
      : require('../../../assets/images/img-placeholder.png');

    return (
      <View
        style={[
          styles.CartContainer,
          { flexDirection: rtlFlexDirection(isRtl) },
        ]}
      >
        <Image source={imageSource} style={styles.CartProductImage} />
        <View style={{ flex: 1, gap: theme.sizes.HEIGHT * 0.02 }}>
          <View>
            <Text style={styles.cartTitle}>{item.ItemName}</Text>
            {item.Variant?.NameEn && (
              <Text style={styles.TextMedium}>{item.Variant.NameEn}</Text>
            )}
          </View>
          <View
            style={{
              ...styles.row,
              flexDirection: rtlFlexDirection(isRtl),
              justifyContent: 'space-between',
            }}
          >
            <PriceWithIcon
              Price={item.TotalAmount}
              style={{ fontSize: theme.sizes.FONTSIZE_LESS_HIGH }}
            />
            <View
              style={[
                styles.quantityControls,
                { flexDirection: rtlFlexDirection(isRtl) },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleQuantityChange(item, 'decrement')}
                disabled={!!updatingQuantities[item.OrderItemId]}
                style={{
                  opacity:
                    updatingQuantities[item.OrderItemId] === 'decrement'
                      ? 0.5
                      : 1,
                }}
              >
                <DecrementIcon />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>
                {`${item.Quantity < 10 ? '0' : ''}${item.Quantity}`}
              </Text>
              <TouchableOpacity
                onPress={() => handleQuantityChange(item, 'increment')}
                disabled={!!updatingQuantities[item.OrderItemId]}
                style={{
                  opacity:
                    updatingQuantities[item.OrderItemId] === 'increment'
                      ? 0.5
                      : 1,
                }}
              >
                <IncrementIcon />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  const handleShareGiftLink = async (giftLink: string) => {
    try {
      const senderName =
        (langCode === 'ar' ? user?.FullNameAr : user?.FullNameEn) ||
        user?.FullNameEn ||
        user?.FullNameAr ||
        'Someone';
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

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {}
  };
  const handleProceedToCheckout = async () => {
    if (!cartData || submitting || waitingForVideoUpload) return;

    try {
      setSubmitting(true);

      // Wait for video upload if it's in progress
      if (isVideoUploading) {
        setWaitingForVideoUpload(true);
        const uploadPromise = getVideoUploadPromise();
        if (uploadPromise) {
          try {
            const result = await uploadPromise;
            console.log(
              '[CheckOut] Video upload completed, proceeding with checkout',
              result,
            );
            if (result && !result.success) {
              // Upload failed, but we'll still proceed with checkout
              console.warn(
                '[CheckOut] Video upload had errors, but proceeding with checkout',
              );
            }
          } catch (error) {
            console.error('[CheckOut] Error waiting for video upload:', error);
            // Continue with checkout even if upload failed
          }
        }
        setWaitingForVideoUpload(false);
      }

      const payload = {
        orderid: cartData.OrderId,
        orderPaymentType: 1,
        IsRedeem: false,
      };

      const response = await api.post<{
        Data: {
          GiftLink: string;
          Message: string;
          OrderId: number;
          QrCode: string | null;
          Success: boolean;
          UniqueCode: string | null;
        };
      }>(apiEndpoints.INITIATE_CHECKOUT, payload);

      if (response.success) {
        setCheckoutCompleted(true);
        if (response.data?.Data?.GiftLink) {
          setGiftLink(response.data?.Data?.GiftLink);
          // Only auto-share if not send type 2
          if (cartData?.SendType !== 2) {
            handleShareGiftLink(response.data?.Data?.GiftLink);
          }
        }
      } else {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    } finally {
      setSubmitting(false);
      setWaitingForVideoUpload(false);
    }
  };

  if (checkoutCompleted) {
    const isSendType2 = cartData?.SendType === 2;

    return (
      <>
        <SuccessMessage
          SuccessLogo={isSendType2 ? <SvgLinkShareIcon /> : <SvgGiftSentIcon />}
          SuccessMessage={isSendType2 ? 'Gift Link Created' : 'Gift Delivered'}
          SuccessSubMessage={!isSendType2 ? 'Your Surprise Has Been Sent' : ''}
          primaryButtonTitle={
            isSendType2 ? 'Share Link' : getString('CHECKOUT_HOME')
          }
          onSecondaryPress={() => navigation.dispatch(StackActions.popToTop())}
          secondaryButtonTitle={isSendType2 ? getString('CHECKOUT_HOME') : ''}
          onPrimaryPress={() =>
            isSendType2 && giftLink
              ? handleShareGiftLink(giftLink)
              : navigation.dispatch(StackActions.popToTop())
          }
        />
      </>
    );
  }

  if (loading) {
    return (
      <ParentView>
        <HomeHeader title={getString('CHECKOUT_TITLE')} showBackButton={true} />
        <SkeletonLoader screenType="checkout" />
      </ParentView>
    );
  }
  if (!cartData || !cartData.Items || cartData.Items.length === 0) {
    return (
      <ParentView>
        <HomeHeader title={getString('CHECKOUT_TITLE')} showBackButton={true} />
        <View style={styles.container}>
          <Text
            style={[
              styles.TextMedium,
              { textAlign: 'center', marginTop: theme.sizes.HEIGHT * 0.3 },
            ]}
          >
            {getString('EMPTY_NO_PRODUCTS_FOUND') || 'Your cart is empty'}
          </Text>
        </View>
      </ParentView>
    );
  }

  const giftImageSource =
    cartData.CampaginType === 3
      ? cartData.users?.ProfileUrl
        ? { uri: cartData.users.ProfileUrl }
        : require('../../../assets/images/img-placeholder.png')
      : cartData.FriendImageUrl
      ? { uri: cartData.FriendImageUrl }
      : require('../../../assets/images/img-placeholder.png');

  console.log('Image Source', giftImageSource);
  return (
    <ParentView>
      <HomeHeader title={getString('CHECKOUT_TITLE')} showBackButton={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.section}>
          <View
            style={[
              styles.sectionHeaderRow,
              { flexDirection: rtlFlexDirection(isRtl) },
            ]}
          >
            <Text style={styles.heading}>
              {getString('CHECKOUT_ORDER_DETAILS')}
            </Text>
            <TouchableOpacity onPress={() => setShowRemoveConfirmation(true)}>
              <Text
                style={[
                  styles.TextMedium,
                  {
                    color: theme.colors.PRIMARY,
                    textDecorationLine: 'underline',
                  },
                ]}
              >
                Remove
              </Text>
            </TouchableOpacity>
          </View>

          {cartData.Items.map((item, index) => (
            <View key={item.OrderItemId}>
              {renderCartItem(item)}
              {index < cartData.Items.length - 1 && (
                <View style={{ height: theme.sizes.HEIGHT * 0.01 }} />
              )}
            </View>
          ))}
        </View>

        {/* {cartData.FriendId && ( */}
        <View style={styles.section}>
          <Text style={styles.heading}>
            {getString('CHECKOUT_SEND_A_GIFT')}
          </Text>
          <View style={styles.GiftContainer}>
            <View
              style={{
                ...styles.row,
                flex: 1,
                gap: theme.sizes.WIDTH * 0.025,
                flexDirection: rtlFlexDirection(isRtl),
              }}
            >
              {cartData.SendType === 2 ? (
                <SvgGiftLink
                  height={scaleWithMax(20, 25)}
                  width={scaleWithMax(20, 25)}
                  style={{ paddingVertical: theme.sizes.HEIGHT * 0.02 }}
                />
              ) : (
                <Image
                  source={giftImageSource}
                  style={
                    cartData.SendType === 2
                      ? styles.LinkImage
                      : styles.GiftContainerImage
                  }
                />
              )}
              <Text
                style={[styles.TextMedium, { width: '90%' }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {cartData.CampaginType === 3
                  ? cartData.users.FullName
                  : cartData.FriendName || 'Sending through link'}
              </Text>
            </View>
            <View
              style={[
                styles.row,
                {
                  gap: theme.sizes.WIDTH * 0.025,
                  flexDirection: rtlFlexDirection(isRtl),
                },
              ]}
            >
              <GiftIcon />
              <TouchableOpacity
                onPress={() => {
                  (navigation as any).navigate('GiftMessage', {
                    friendUserId: cartData.FriendId,
                    storeBranchId: cartData.StoreBranchId,
                    orderId: cartData.OrderId,
                  });
                }}
              >
                <ArrowDownIcon style={{ transform: rtlTransform(isRtl) }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* )} */}

        <View style={styles.section}>
          <View
            style={[
              styles.sectionHeaderRow,
              { flexDirection: rtlFlexDirection(isRtl) },
            ]}
          >
            <Text style={styles.heading}>
              {getString('CHECKOUT_PAYMENT_MANAGEMENT')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddCard' as never)}
            >
              <View
                style={[styles.row, { flexDirection: rtlFlexDirection(isRtl) }]}
              >
                <PlusIcon
                  height={scaleWithMax(15, 18)}
                  width={scaleWithMax(15, 18)}
                />
                <Text style={styles.addCardAction}>
                  {getString('CHECKOUT_ADD_CARD')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            disabled
            onPress={() =>
              setSelectedPaymentMethod(
                selectedPaymentMethod === 'visa' ? null : 'visa',
              )
            }
          >
            <View
              style={[
                styles.GiftContainer,
                { flexDirection: rtlFlexDirection(isRtl) },
              ]}
            >
              <View
                style={{
                  ...styles.row,
                  flex: 1,
                  gap: theme.sizes.WIDTH * 0.03,
                  flexDirection: rtlFlexDirection(isRtl),
                }}
              >
                <CheckBox
                  Selected={selectedPaymentMethod === 'visa'}
                  // onSelectionPress={() =>
                  //   setSelectedPaymentMethod(
                  //     selectedPaymentMethod === 'visa' ? null : 'visa',
                  //   )
                  // }
                />
                <VisaIcon
                  height={scaleWithMax(32, 35)}
                  width={scaleWithMax(32, 35)}
                />
                <View>
                  <Text style={styles.TextMedium}>424242XXXXXX4242</Text>
                  <Text style={styles.TextMedium}>Visa</Text>
                </View>
              </View>
              <SvgSelectedCheck
                width={scaleWithMax(16, 18)}
                height={scaleWithMax(16, 18)}
                style={{ opacity: selectedPaymentMethod === 'visa' ? 1 : 0 }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setSelectedPaymentMethod(
                selectedPaymentMethod === 'wallet' ? null : 'wallet',
              )
            }
          >
            <View
              style={[
                styles.GiftContainer,
                {
                  flexDirection: rtlFlexDirection(isRtl),
                  marginTop: theme.sizes.HEIGHT * 0.005,
                },
              ]}
            >
              <View
                style={{
                  ...styles.row,
                  flex: 1,
                  gap: theme.sizes.WIDTH * 0.03,
                  flexDirection: rtlFlexDirection(isRtl),
                }}
              >
                <CheckBox
                  Selected={selectedPaymentMethod === 'wallet'}
                  onSelectionPress={() =>
                    setSelectedPaymentMethod(
                      selectedPaymentMethod === 'wallet' ? null : 'wallet',
                    )
                  }
                />
                <SvgGifteeWalletIcon
                  height={scaleWithMax(32, 35)}
                  width={scaleWithMax(32, 35)}
                />
                <View>
                  <Text style={styles.TextMedium}>Giftee Wallet</Text>
                  <View style={styles.row}>
                    <SvgRiyalIcon
                      width={scaleWithMax(12, 14)}
                      height={scaleWithMax(12, 14)}
                    />
                    <Text style={styles.TextMedium}>
                      {walletBalance?.data?.WalletBalance
                        ? Number(walletBalance.data.WalletBalance).toFixed(2)
                        : '0.00'}
                    </Text>
                  </View>
                </View>
              </View>
              <SvgSelectedCheck
                width={scaleWithMax(16, 18)}
                height={scaleWithMax(16, 18)}
                style={{ opacity: selectedPaymentMethod === 'wallet' ? 1 : 0 }}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>{getString('CHECKOUT_ORDER_INFO')}</Text>
          <View
            style={[styles.Prices, { flexDirection: rtlFlexDirection(isRtl) }]}
          >
            <Text style={styles.TextMedium}>
              {getString('CHECKOUT_TOTAL_AMOUNT')}
            </Text>
            <PriceWithIcon Price={cartData.TotalAmount} />
          </View>
          {cartData.TotalDiscount > 0 && (
            <View
              style={[
                styles.Prices,
                { flexDirection: rtlFlexDirection(isRtl) },
              ]}
            >
              <Text style={styles.TextMedium}>Discount</Text>
              <PriceWithIcon Price={cartData.TotalDiscount} />
            </View>
          )}
          {cartData.TotalVat > 0 && (
            <View
              style={[
                styles.Prices,
                { flexDirection: rtlFlexDirection(isRtl) },
              ]}
            >
              <Text style={styles.TextMedium}>VAT</Text>
              <PriceWithIcon Price={cartData.TotalVat} />
            </View>
          )}
          {cartData.DeliveryCharges > 0 && (
            <View
              style={[
                styles.Prices,
                { flexDirection: rtlFlexDirection(isRtl) },
              ]}
            >
              <Text style={styles.TextMedium}>Delivery Charges</Text>
              <PriceWithIcon Price={cartData.DeliveryCharges} />
            </View>
          )}
          <View style={{ marginTop: theme.sizes.HEIGHT * 0.004 }}>
            <Text style={styles.TextMedium}>Send gift with Ehsan</Text>
            <InputField
              style={{
                marginTop: theme.sizes.HEIGHT * 0.005,
              }}
              icon={<SvgEhsanIcon />}
              fieldProps={{
                placeholder: getString('CHECKOUT_ENTER_AMOUNT'),
                keyboardType: 'numeric',
                maxLength: 10,
              }}
            />
          </View>
          <Text style={styles.vatNote}>{getString('CHECKOUT_VAT_NOTE')}</Text>
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <View style={{ position: 'relative' }}>
          <CustomButton
            title={getString('CHECKOUT_PROCEED_TO_CHECKOUT')}
            onPress={handleProceedToCheckout}
            buttonStyle={{
              backgroundColor: !selectedPaymentMethod
                ? '#FFA5A5'
                : theme.colors.PRIMARY,
              borderColor: !selectedPaymentMethod
                ? '#FFA5A5'
                : theme.colors.PRIMARY,
            }}
            labelStyle={{
              color: theme.colors.WHITE,
            }}
            disabled={
              submitting || waitingForVideoUpload || !selectedPaymentMethod
            }
            loading={submitting || waitingForVideoUpload}
          />
          <View
            style={[
              styles.footerPriceWrapper,
              rtlPosition(isRtl, undefined, theme.sizes.WIDTH * 0.03),
            ]}
          >
            <PriceWithIcon
              Price={cartData.TotalAmount}
              style={{
                color: theme.colors.WHITE,
              }}
              Icon={
                <SvgRiyalIconWhite
                  width={scaleWithMax(12, 14)}
                  height={scaleWithMax(12, 14)}
                />
              }
            />
          </View>
        </View>
      </View>
      <ConfirmationPopup
        visible={showRemoveConfirmation}
        title={getString('CHECKOUT_REMOVE_ITEMS')}
        message={getString('CHECKOUT_REMOVE_ALL_ITEMS_CONFIRM')}
        confirmText={getString('CHECKOUT_REMOVE')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={handleClearCart}
        onCancel={() => setShowRemoveConfirmation(false)}
      />
      <ConfirmationPopup
        visible={!!itemToRemove}
        title={getString('CHECKOUT_REMOVE_ITEM')}
        message={`${getString('CHECKOUT_REMOVE_ITEM_CONFIRM')} "${
          itemToRemove?.ItemName
        }" ${getString('CHECKOUT_FROM_CART')}`}
        confirmText={getString('CHECKOUT_REMOVE')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={handleRemoveItem}
        onCancel={() => setItemToRemove(null)}
      />
    </ParentView>
  );
};

export default CheckOut;
