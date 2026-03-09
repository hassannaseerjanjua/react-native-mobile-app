import {
  Platform,
  ScrollView,
  Share,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Keyboard,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import WebView from 'react-native-webview';
import React, { useState, useEffect, useMemo } from 'react';
import { Image } from '../../../utils/elements';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import {
  ArrowDownIcon,
  DecrementIcon,
  GiftIcon,
  IncrementIcon,
  PlusIcon,
  SvgApplePayIcon,
  SvgApplePayText,
  SvgEhsanIcon,
  SvgGifteeWalletIcon,
  SvgGiftLink,
  SvgGiftSentIcon,
  SvgLinkShareIcon,
  SvgRiyalIcon,
  SvgRiyalIconPrimary,
  SvgRiyalPink,
  SvgRiyalIconWhite,
  SvgSelectedCheck,
  VisaIcon,
  SvgProfileFriends,
  SvgDeleteIcon,
  MasterCardIcon,
  NoonIcon,
} from '../../../assets/icons';
import {
  scaleWithMax,
  rtlTransform,
  rtlPosition,
  rtlMargin,
  isIOS,
} from '../../../utils';
import CheckBox from '../../../components/global/CheckBox';
import PriceWithIcon from '../../../components/global/Price';
import CustomButton from '../../../components/global/Custombutton';
import { StackActions, useNavigation } from '@react-navigation/native';
import CustomFooter from '../../../components/global/CustomFooter';
import { Text } from '../../../utils/elements';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import { AppStackScreen, UserCard } from '../../../types/navigation.types';
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
import TabItem from '../../../components/global/TabItem';
import SearchUserItem from '../../../components/app/SearchUserItem';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import { FlatList } from 'react-native';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
import { useApplePay } from '../../../hooks/useApplePay';
import ShadowView from '../../../components/global/ShadowView';

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
  console.log('submitting', submitting);
  const [waitingForVideoUpload, setWaitingForVideoUpload] = useState(false);
  const [updatingQuantities, setUpdatingQuantities] = useState<
    Record<number, 'increment' | 'decrement' | null>
  >({});
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<
    (CartItem & { originalOrderItemIds?: number[] }) | null
  >(null);
  const [giftLink, setGiftLink] = useState<string | null>(null);
  const [activeDomationAmount, setActiveDomationAmount] = useState<number>();
  const [originalEhsaanAmount, setOriginalEhsaanAmount] = useState<number>(0);
  const [hasInitializedEhsaan, setHasInitializedEhsaan] = useState(false);
  const [showCustomDonationInput, setShowCustomDonationInput] = useState(false);
  const [customDonationAmount, setCustomDonationAmount] = useState<string>('');
  const [showEmployeesBottomSheet, setShowEmployeesBottomSheet] =
    useState(false);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [selectedCardFromParams, setSelectedCardFromParams] =
    useState<UserCard | null>(null);
  const isMerchant = user?.isMerchant === 1;
  const { isApplePayAvailable, requestApplePayPayment } = useApplePay();
  const cartItemsApi = useGetApi<CartResponse>(apiEndpoints.GET_CART_ITEMS, {
    transformData: (data: any) => {
      setCartData(data?.Data);
      return (data?.Data || data) as CartResponse;
    },
  });

  const walletBalance = useGetApi<any>(apiEndpoints.GET_WALLET_BALANCE, {
    transformData: data => data.Data,
  });

  console.log('isApplePayAvailable', isApplePayAvailable);

  const [cartData, setCartData] = useState<CartResponse | null>(
    cartItemsApi.data,
  );
  const loading = cartItemsApi.loading;

  // Sync cartData when loaded from cache (transformData only runs on fresh API response)
  useEffect(() => {
    if (cartItemsApi.data && !cartData) {
      setCartData(cartItemsApi.data);
    }
  }, [cartItemsApi.data, cartData]);

  useEffect(() => {
    if (cartData && !hasInitializedEhsaan) {
      const amount = cartData.EhsaanAmount || 0;
      console.log('[Ehsan Init] Setting originalEhsaanAmount to:', amount);
      setOriginalEhsaanAmount(amount);
      if (amount > 0) {
        console.log('[Ehsan Init] Prefilling activeDomationAmount to:', amount);
        setActiveDomationAmount(amount);
        const presetValues = [3, 5, 10];
        if (!presetValues.includes(amount)) {
          setShowCustomDonationInput(true);
          setCustomDonationAmount(amount.toString());
        }
        setCartData({
          ...cartData,
          TotalAmount: cartData.TotalAmount - amount,
        });
      } else {
        setActiveDomationAmount(1);
      }
      setHasInitializedEhsaan(true);
    }
  }, [cartData, hasInitializedEhsaan]);

  useEffect(() => {
    if (isApplePayAvailable && selectedPaymentMethod === null) {
      setSelectedPaymentMethod('applePay');
    }
  }, [isApplePayAvailable, selectedPaymentMethod]);

  useEffect(() => {
    if (!checkoutCompleted) return;

    navigation.setOptions({ gestureEnabled: false });

    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
        e.preventDefault();
      }
    });

    return unsubscribe;
  }, [checkoutCompleted, navigation]);

  // Merge items with the same ItemId and ItemVariantId
  const mergedCartItems = useMemo(() => {
    if (!cartData?.Items) return [];

    const itemsMap = new Map<
      string,
      CartItem & { originalOrderItemIds: number[] }
    >();

    cartData.Items.forEach(item => {
      // Create a unique key combining ItemId and ItemVariantId
      // Items with different variants should be kept separate
      const itemVariantId = item.Variant?.ItemVariantId || null;
      const uniqueKey = `${item.ItemId}_${itemVariantId ?? 'no-variant'}`;

      const existingItem = itemsMap.get(uniqueKey);

      if (existingItem) {
        // Merge quantities and amounts only if ItemId AND ItemVariantId match
        existingItem.Quantity += item.Quantity;
        existingItem.TotalAmount += item.TotalAmount;
        existingItem.OrderAmount += item.OrderAmount;
        existingItem.DiscountAmount += item.DiscountAmount;
        existingItem.originalOrderItemIds.push(item.OrderItemId);
      } else {
        // First occurrence of this ItemId+ItemVariantId combination
        itemsMap.set(uniqueKey, {
          ...item,
          originalOrderItemIds: [item.OrderItemId],
        });
      }
    });

    return Array.from(itemsMap.values());
  }, [cartData?.Items]);

  const userCardsApi = useGetApi<UserCard[]>(apiEndpoints.GET_CARDS, {
    transformData: data => data.Data || [],
  });

  useEffect(() => {
    if (userCardsApi.data) {
      setUserCards(userCardsApi.data);
    }
  }, [userCardsApi.data]);

  useEffect(() => {
    if (route.params?.selectedCard) {
      setSelectedCardFromParams(route.params.selectedCard as UserCard);
      setSelectedPaymentMethod('savedCard');
    }
  }, [route.params?.selectedCard]);

  // useEffect(() => {
  //   if (cartItemsApi.data) {
  //     setCartData(cartItemsApi.data);
  //   }
  // }, [cartItemsApi.data]);

  const removeCartItem = async (
    item: CartItem & { originalOrderItemIds?: number[] },
    skipStateUpdate = false,
  ): Promise<boolean> => {
    const originalCartData = cartData
      ? JSON.parse(JSON.stringify(cartData))
      : null;

    // Check if this is a merged item (has multiple OrderItemIds)
    const isMergedItem =
      item.originalOrderItemIds && item.originalOrderItemIds.length > 1;
    const orderItemIdsToRemove = isMergedItem
      ? item.originalOrderItemIds!
      : [item.OrderItemId];

    if (cartData && !skipStateUpdate) {
      // Remove all items that are part of the merged item
      const updatedItems = cartData.Items.filter(
        cartItem => !orderItemIdsToRemove.includes(cartItem.OrderItemId),
      );

      const newOrderAmount = updatedItems.reduce(
        (sum, cartItem) => sum + cartItem.OrderAmount,
        0,
      );
      const newTotalDiscount = updatedItems.reduce(
        (sum, cartItem) => sum + (cartItem.DiscountAmount || 0),
        0,
      );
      const newTotalVat = updatedItems.reduce(
        (sum, cartItem) => sum + (cartItem.VatAmount || 0),
        0,
      );
      const newDeliveryCharges = cartData.DeliveryCharges;
      const newTotalAmount =
        newOrderAmount - newTotalDiscount + newTotalVat + newDeliveryCharges;

      setCartData({
        ...cartData,
        Items: updatedItems,
        OrderAmount: newOrderAmount,
        TotalDiscount: newTotalDiscount,
        TotalVat: newTotalVat,
        TotalAmount: newTotalAmount,
      });
    }

    try {
      // Set updating state for all items being removed
      setUpdatingQuantities(prev => {
        const newState = { ...prev };
        orderItemIdsToRemove.forEach(orderItemId => {
          newState[orderItemId] = 'decrement';
        });
        return newState;
      });

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
      // Clear updating state for all removed items
      setUpdatingQuantities(prev => {
        const newState = { ...prev };
        orderItemIdsToRemove.forEach(orderItemId => {
          delete newState[orderItemId];
        });
        return newState;
      });
    }
  };

  const handleQuantityChange = async (
    item: CartItem & { originalOrderItemIds?: number[] },
    type: 'increment' | 'decrement',
  ) => {
    const newQuantity =
      type === 'increment' ? item.Quantity + 1 : item.Quantity - 1;

    // Check if this is a merged item (has multiple OrderItemIds)
    const isMergedItem =
      item.originalOrderItemIds && item.originalOrderItemIds.length > 1;
    const itemIdsToUpdate = isMergedItem
      ? item.originalOrderItemIds!
      : [item.OrderItemId];
    const primaryOrderItemId = item.OrderItemId;

    if (updatingQuantities[primaryOrderItemId]) {
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
      // If merged item, calculate quantity per item
      let quantityPerItem = newQuantity;
      let remainder = 0;
      if (isMergedItem && item.originalOrderItemIds) {
        quantityPerItem = Math.floor(
          newQuantity / item.originalOrderItemIds.length,
        );
        remainder = newQuantity % item.originalOrderItemIds.length;
      }

      const updatedItems = cartData.Items.map(cartItem => {
        if (
          isMergedItem &&
          item.originalOrderItemIds?.includes(cartItem.OrderItemId)
        ) {
          // For merged items, distribute quantity evenly with remainder in first item
          const isFirstItem =
            cartItem.OrderItemId === item.originalOrderItemIds[0];
          const itemQuantity = quantityPerItem + (isFirstItem ? remainder : 0);
          const newOrderAmount = cartItem.UnitPrice * itemQuantity;
          // Recalculate discount proportionally based on quantity change
          const discountPerUnit =
            cartItem.Quantity > 0
              ? cartItem.DiscountAmount / cartItem.Quantity
              : 0;
          const newDiscountAmount = discountPerUnit * itemQuantity;
          // Recalculate VAT proportionally based on quantity change
          const vatPerUnit =
            cartItem.Quantity > 0
              ? (cartItem.VatAmount || 0) / cartItem.Quantity
              : 0;
          const newVatAmount = vatPerUnit * itemQuantity;
          const newTotalAmount =
            newOrderAmount - newDiscountAmount + newVatAmount;
          return {
            ...cartItem,
            Quantity: itemQuantity,
            OrderAmount: newOrderAmount,
            DiscountAmount: newDiscountAmount,
            VatAmount: newVatAmount,
            TotalAmount: newTotalAmount,
          };
        } else if (cartItem.OrderItemId === item.OrderItemId) {
          // Single item update
          const newOrderAmount = cartItem.UnitPrice * newQuantity;
          // Recalculate discount proportionally based on quantity change
          const discountPerUnit =
            cartItem.Quantity > 0
              ? cartItem.DiscountAmount / cartItem.Quantity
              : 0;
          const newDiscountAmount = discountPerUnit * newQuantity;
          // Recalculate VAT proportionally based on quantity change
          const vatPerUnit =
            cartItem.Quantity > 0
              ? (cartItem.VatAmount || 0) / cartItem.Quantity
              : 0;
          const newVatAmount = vatPerUnit * newQuantity;
          const newTotalAmount =
            newOrderAmount - newDiscountAmount + newVatAmount;
          return {
            ...cartItem,
            Quantity: newQuantity,
            OrderAmount: newOrderAmount,
            DiscountAmount: newDiscountAmount,
            VatAmount: newVatAmount,
            TotalAmount: newTotalAmount,
          };
        }
        return cartItem;
      });

      const newOrderAmount = updatedItems.reduce(
        (sum, cartItem) => sum + cartItem.OrderAmount,
        0,
      );
      const newTotalDiscount = updatedItems.reduce(
        (sum, cartItem) => sum + (cartItem.DiscountAmount || 0),
        0,
      );
      const newTotalVat = updatedItems.reduce(
        (sum, cartItem) => sum + (cartItem.VatAmount || 0),
        0,
      );
      const newDeliveryCharges = cartData.DeliveryCharges;
      const newTotalAmount =
        newOrderAmount - newTotalDiscount + newTotalVat + newDeliveryCharges;

      setCartData({
        ...cartData,
        Items: updatedItems,
        OrderAmount: newOrderAmount,
        TotalDiscount: newTotalDiscount,
        TotalVat: newTotalVat,
        TotalAmount: newTotalAmount,
      });
    }

    try {
      setUpdatingQuantities(prev => ({
        ...prev,
        [primaryOrderItemId]: type,
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
        delete newState[primaryOrderItemId];
        return newState;
      });
    }
  };

  const handleClearCart = async () => {
    setShowRemoveConfirmation(false);
    const response = await api.put(apiEndpoints.CLEAR_CART, {});
    if (response.success) {
      // Navigate to home after clearing cart
      navigation.reset({
        index: 0,
        routes: [{ name: 'BottomTabs' as never }],
      });
    } else {
      notify.error(response.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  const handleRemoveItem = async (
    itemParam?: CartItem & { originalOrderItemIds?: number[] },
  ) => {
    const item = itemParam || itemToRemove;
    if (!item) return;

    // Check if this is a merged item (has multiple OrderItemIds)
    const isMergedItem =
      item.originalOrderItemIds && item.originalOrderItemIds.length > 1;
    const orderItemIdsToRemove = isMergedItem
      ? item.originalOrderItemIds!
      : [item.OrderItemId];

    // Check if removing these items would leave the cart empty
    const remainingItemsCount =
      (cartData?.Items?.length || 0) - orderItemIdsToRemove.length;
    const isLastItem = remainingItemsCount <= 0;

    if (!itemParam) {
      setTimeout(() => setItemToRemove(null), 300);
    }

    // If it's the last item(s), use clear cart API instead of remove item API
    if (isLastItem) {
      await handleClearCart();
    } else {
      await removeCartItem(item);
    }
  };

  const renderCartItem = (
    item: CartItem & { originalOrderItemIds?: number[] },
  ) => {
    const itemImage = item.Images?.[0]?.ImageUrls || item.ThumbnailUrl;
    const imageSource = itemImage
      ? { uri: itemImage }
      : require('../../../assets/images/img-placeholder.png');

    return (
      <ShadowView preset="default">
        <View style={[styles.CartContainer]}>
          <Image source={imageSource} style={styles.CartProductImage} />
          <View style={{ flex: 1, gap: theme.sizes.HEIGHT * 0.02 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: theme.sizes.WIDTH * 0.02,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.cartTitle}>
                  {langCode === 'ar' ? item.ItemName : item.ItemName}
                </Text>
                {item.Variant?.NameEn && (
                  <Text style={styles.TextMedium}>
                    {langCode === 'ar'
                      ? item.Variant.NameAr
                      : item.Variant.NameEn}
                  </Text>
                )}
              </View>
              {isMerchant &&
                cartData?.MultiUsers &&
                cartData.MultiUsers.length > 0 && (
                  <Text style={styles.cartItemCountBadge}>
                    {getString('COMP_QTY')} {item.Quantity}
                  </Text>
                )}
            </View>
            {isMerchant || cartData?.CampaginType === 3 ? (
              <View
                style={{
                  ...styles.row,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {item.DiscountAmount > 0 ? (
                  <View style={[styles.row, { gap: theme.sizes.WIDTH * 0.01 }]}>
                    <PriceWithIcon
                      amount={item.TotalAmount}
                      variant="discounted"
                      icon={
                        <SvgRiyalPink
                          width={scaleWithMax(16, 16)}
                          height={scaleWithMax(16, 16)}
                        />
                      }
                      textStyle={styles.discountedPrice}
                    />
                    <PriceWithIcon
                      amount={item.OrderAmount || 'N/A'}
                      variant="cut"
                      icon={
                        <SvgRiyalIcon
                          width={scaleWithMax(11, 11)}
                          height={scaleWithMax(11, 11)}
                        />
                      }
                      iconOpacity={0.32}
                      textStyle={styles.cutPrice}
                    />
                  </View>
                ) : (
                  <PriceWithIcon
                    amount={item.TotalAmount}
                    textStyle={{ fontSize: theme.sizes.FONTSIZE_LESS_HIGH }}
                  />
                )}
                <TouchableOpacity onPress={() => setItemToRemove(item)}>
                  {cartData?.CampaginType !== 3 && <SvgDeleteIcon />}
                </TouchableOpacity>
              </View>
            ) : isMerchant && cartData?.SendType === 3 ? (
              item.DiscountAmount > 0 ? (
                <View style={[styles.row, { gap: theme.sizes.WIDTH * 0.01 }]}>
                  <PriceWithIcon
                    amount={item.TotalAmount}
                    variant="discounted"
                    icon={
                      <SvgRiyalPink
                        width={scaleWithMax(16, 16)}
                        height={scaleWithMax(16, 16)}
                      />
                    }
                    textStyle={styles.discountedPrice}
                  />
                  <PriceWithIcon
                    amount={item.OrderAmount || 'N/A'}
                    variant="cut"
                    icon={
                      <SvgRiyalIcon
                        width={scaleWithMax(11, 11)}
                        height={scaleWithMax(11, 11)}
                      />
                    }
                    iconOpacity={0.32}
                    textStyle={styles.cutPrice}
                  />
                </View>
              ) : (
                <PriceWithIcon
                  amount={item.TotalAmount}
                  textStyle={{ fontSize: theme.sizes.FONTSIZE_LESS_HIGH }}
                />
              )
            ) : (
              <View
                style={{
                  ...styles.row,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {item.DiscountAmount > 0 ? (
                  <View style={[styles.row, { gap: theme.sizes.WIDTH * 0.01 }]}>
                    <PriceWithIcon
                      amount={item.TotalAmount}
                      variant="discounted"
                      icon={
                        <SvgRiyalPink
                          width={scaleWithMax(16, 16)}
                          height={scaleWithMax(16, 16)}
                        />
                      }
                      textStyle={styles.discountedPrice}
                    />
                    <PriceWithIcon
                      amount={item.OrderAmount || 'N/A'}
                      variant="cut"
                      icon={
                        <SvgRiyalIcon
                          width={scaleWithMax(11, 11)}
                          height={scaleWithMax(11, 11)}
                        />
                      }
                      iconOpacity={0.32}
                      textStyle={styles.cutPrice}
                    />
                  </View>
                ) : (
                  <PriceWithIcon
                    amount={item.TotalAmount}
                    textStyle={{ fontSize: theme.sizes.FONTSIZE_LESS_HIGH }}
                  />
                )}

                <View style={[styles.quantityControls]}>
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
            )}
          </View>
        </View>
      </ShadowView>
    );
  };
  const handleShareGiftLink = async (giftLink: string) => {
    try {
      // const shareMessage = `💝 You have received a gift. Click on the link below to redeem the gift.\n\n${giftLink}`;
      const shareMessage = `${getString('GIFT_VIA_LINK')}.\n\n${giftLink}`;
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

      // Apple Pay: present native sheet first, get token before API call
      let applePayToken: string | null = null;
      if (selectedPaymentMethod === 'applePay') {
        const totalAmount =
          (cartData.TotalAmount || 0) + (activeDomationAmount || 0);
        if (totalAmount <= 0) {
          notify.error(getString('AU_ERROR_OCCURRED'));
          setSubmitting(false);
          return;
        }
        try {
          applePayToken = await requestApplePayPayment(totalAmount, {
            currencyCode: 'SAR',
            label: 'Giftee Order',
          });
          if (applePayToken === null) {
            setSubmitting(false);
            return;
          }
        } catch (error: any) {
          console.error('[ApplePay] Error:', error);
          notify.error(error?.message || getString('AU_ERROR_OCCURRED'));
          setSubmitting(false);
          return;
        }
      }

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

      const payload: any = {
        orderid: cartData.OrderId,
        orderPaymentType:
          selectedPaymentMethod === 'wallet'
            ? 1
            : selectedPaymentMethod === 'applePay'
            ? 3
            : 2,
        IsRedeem: false,
      };

      const currentEhsaanAmount = activeDomationAmount || 0;
      console.log(
        '[Checkout] Current:',
        currentEhsaanAmount,
        'Original:',
        originalEhsaanAmount,
      );
      if (currentEhsaanAmount !== originalEhsaanAmount) {
        console.log('[Checkout] Sending EhsaanAmount:', currentEhsaanAmount);
        payload.EhsaanAmount = currentEhsaanAmount;
      }

      if (selectedPaymentMethod === 'savedCard') {
        const cardToken = selectedCardFromParams?.Token || userCards[0]?.Token;
        if (cardToken) {
          payload.CardToken = cardToken;
        }
      }

      if (selectedPaymentMethod === 'applePay' && applePayToken !== null) {
        payload.CardToken = applePayToken;
      }

      if (cartData.FriendIds && cartData.FriendIds.length > 0) {
        payload.FriendIds = cartData.FriendIds;
      }

      const response = await api.post<{
        Data: {
          GiftLink: string;
          Message: string;
          OrderId: number;
          QrCode: string | null;
          Success: boolean;
          UniqueCode: string | null;
          isPaymentRequired: boolean;
          PaymentUrl: string;
        };
      }>(apiEndpoints.INITIATE_CHECKOUT, payload);

      if (response.success) {
        // Update originalEhsaanAmount after successful API call to prevent duplicate additions on retry
        if (currentEhsaanAmount !== originalEhsaanAmount) {
          console.log(
            '[Checkout] Updating originalEhsaanAmount from',
            originalEhsaanAmount,
            'to',
            currentEhsaanAmount,
          );
          setOriginalEhsaanAmount(currentEhsaanAmount);
        }

        // Store the gift link if available (it might be available even before payment)
        if (response.data?.Data?.GiftLink) {
          setGiftLink(response.data?.Data?.GiftLink);
        }

        if (response.data?.Data?.PaymentUrl) {
          // Open payment URL in in-app webview
          setPaymentUrl(response.data?.Data?.PaymentUrl);
          setShowPaymentWebView(true);
        } else {
          // No payment required, proceed to success
          setCheckoutCompleted(true);
          // Only auto-share if not send type 2
          if (response.data?.Data?.GiftLink && cartData?.SendType !== 2) {
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

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Check if we've reached the callback URL
    if (url.includes('/callback/processResultNew')) {
      // The success/failure status is in the body content
      // We'll handle it in the onMessage handler via injected JavaScript
      console.log('Payment callback URL detected:', url);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = event.nativeEvent.data;
      console.log('WebView message received:', message);

      if (!message) return;

      // Check if the body content indicates success
      const isSuccess =
        message.includes('SUCCESS') || message.includes('Order:True');
      const isFailure =
        message.includes('Payment Failed') || message.includes('FAILED');
      const isCancel =
        message.includes('Payment Cancelled') ||
        message.includes('CANCELLED') ||
        message.includes('Payment Cancelled') ||
        message.includes('cancelled') ||
        message.includes('Cancelled');

      if (isSuccess) {
        // Payment successful - close webview and show success screen
        setShowPaymentWebView(false);
        setPaymentUrl(null);
        setCheckoutCompleted(true);

        // Auto-share gift link if available and not send type 2
        if (giftLink && cartData?.SendType !== 2) {
          handleShareGiftLink(giftLink);
        }
      } else if (isFailure || isCancel) {
        // Payment failed - close webview and show error
        setShowPaymentWebView(false);
        setPaymentUrl(null);
        //  notify.error(getString('PAYMENT_FAILED') || 'Payment failed. Pleas
        // Don't show toast if payment was cancelled
        if (isCancel) {
          console.log('canecl');
          return;
        }
        let errorToShow =
          getString('PAYMENT_FAILED') || 'Payment failed. Please try again.';

        try {
          // Attempt to extract structured error from the message
          const jsonMatch = message.match(/\{.*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            errorToShow =
              data.Message ||
              data.message ||
              data.Error ||
              data.error ||
              errorToShow;
          } else {
            // Try to extract message after keywords like FAILED: or Error:
            const patterns = [
              /FAILED\s*[:|-]\s*(.*)/i,
              /Payment Failed\s*[:|-]\s*(.*)/i,
              /Error\s*[:|-]\s*(.*)/i,
            ];
            for (const pattern of patterns) {
              const match = message.match(pattern);
              if (match && match[1] && match[1].trim()) {
                const captured = match[1].trim();
                if (captured.length < 250 && !captured.includes('<html')) {
                  errorToShow = captured;
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.error('Error parsing WebView failure message:', e);
        }

        notify.error(errorToShow);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  // JavaScript to inject into the WebView to read body content
  const injectedJavaScript = `
    (function() {
      // Function to send body content to React Native
      function sendBodyContent() {
        const bodyContent = document.body.innerText || document.body.textContent || '';
        window.ReactNativeWebView.postMessage(bodyContent);
      }

      // Check if page is already loaded
      if (document.readyState === 'complete') {
        sendBodyContent();
      } else {
        // Wait for page to load
        window.addEventListener('load', sendBodyContent);
      }

      // Also observe for any changes in the body content
      const observer = new MutationObserver(function(mutations) {
        sendBodyContent();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    })();
    true;
  `;

  if (checkoutCompleted) {
    const isSendType2 = cartData?.SendType === 2;
    const isCampaign = cartData?.CampaginType === 3;

    return (
      <>
        <SuccessMessage
          subTitle={
            isSendType2
              ? getString('INBOX_GIFT_LINK_OUTBOX_MESSAGE')
              : isCampaign
              ? getString('INBOX_GIFT_FOUND_MESSAGE')
              : ''
          }
          SuccessLogo={
            isSendType2 ? (
              <SvgLinkShareIcon />
            ) : isCampaign ? (
              <Image
                source={require('../../../assets/images/giftOneGetOne.png')}
              />
            ) : (
              <SvgGiftSentIcon />
            )
          }
          SuccessMessage={
            isSendType2
              ? getString('CHECKOUT_GIFT_LINK_CREATED')
              : isCampaign
              ? getString('HOME_GIFT_ONE_GET_ONE_STATUS')
              : getString('CHECKOUT_GIFT_DELIVERED')
          }
          SuccessSubMessage={
            !isSendType2 && !isCampaign
              ? getString('CHECKOUT_YOUR_SURPRISE_HAS_BEEN_SENT')
              : ''
          }
          primaryButtonTitle={
            isSendType2
              ? getString('CHECKOUT_SHARE_LINK')
              : getString('CHECKOUT_HOME')
          }
          onSecondaryPress={() => {
            // Navigate to home after gift is sent
            navigation.reset({
              index: 0,
              routes: [{ name: 'BottomTabs' as never }],
            });
          }}
          secondaryButtonTitle={isSendType2 ? getString('CHECKOUT_HOME') : ''}
          onPrimaryPress={() => {
            if (isSendType2 && giftLink) {
              handleShareGiftLink(giftLink);
            } else {
              // Navigate to home after gift is sent
              navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabs' as never }],
              });
            }
          }}
        />
      </>
    );
  }

  if (loading || (!cartData && !cartItemsApi.error)) {
    return (
      <ParentView>
        <HomeHeader title={getString('CHECKOUT_TITLE')} showBackButton={true} />
        <SkeletonLoader screenType="checkout" />
      </ParentView>
    );
  }
  // if (!cartData || !cartData.Items || cartData.Items.length === 0) {
  //   return (
  //     <ParentView>
  //       <HomeHeader title={getString('CHECKOUT_TITLE')} showBackButton={true} />
  //       <View style={styles.container}>
  //         <PlaceholderLogoText text={getString('EMPTY_NO_PRODUCTS_FOUND') || getString('CHECKOUT_YOUR_CART_IS_EMPTY')} />
  //       </View>
  //     </ParentView>
  //   );
  // }

  const giftImageSource =
    cartData?.CampaginType === 3
      ? cartData?.users?.ProfileUrl
        ? { uri: cartData?.users.ProfileUrl }
        : require('../../../assets/images/img-placeholder.png')
      : cartData?.FriendImageUrl
      ? { uri: cartData?.FriendImageUrl }
      : require('../../../assets/images/img-placeholder.png');

  const DomationAmounts = [
    { value: '1', title: '1' },
    { value: '3', title: '3' },
    { value: '5', title: '5' },
    { value: '10', title: '10' },
    { value: 'Custom', title: getString('CHECKOUT_CUSTOM') },
  ];
  const orderInfoRows = [
    {
      key: 'orderAmount',
      label: getString('CHECKOUT_ORDER_AMOUNT'),
      amount: cartData?.TotalAmount || 0,
    },
    ...((cartData?.TotalVat || 0) > 0
      ? [
          {
            key: 'vat',
            label: getString('CHECKOUT_VAT'),
            amount: cartData?.TotalVat || 0,
          },
        ]
      : []),
    ...((cartData?.DeliveryCharges || 0) > 0
      ? [
          {
            key: 'deliveryCharges',
            label: getString('CHECKOUT_DELIVERY_CHARGES'),
            amount: cartData?.DeliveryCharges || 0,
          },
        ]
      : []),
    ...(activeDomationAmount
      ? [
          {
            key: 'ehsan',
            label: getString('CHECKOUT_EHSAN'),
            amount: activeDomationAmount,
          },
        ]
      : []),
    {
      key: 'totalAmount',
      label: getString('CHECKOUT_TOTAL_AMOUNT'),
      amount: (cartData?.TotalAmount || 0) + (activeDomationAmount || 0),
    },
  ];

  return (
    <ParentView>
      <HomeHeader title={getString('CHECKOUT_TITLE')} showBackButton={true} />
      {cartData ? (
        <>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            behavior="padding"
            // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent]}
              keyboardShouldPersistTaps="handled"
              // keyboardDismissMode="on-drag"
            >
              <View style={styles.section}>
                <View style={[styles.sectionHeaderRow]}>
                  <Text style={styles.heading}>
                    {getString('CHECKOUT_ORDER_DETAILS')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowRemoveConfirmation(true)}
                  >
                    {/* <Text
                      style={[
                        styles.TextMedium,
                        {
                          color: theme.colors.PRIMARY,
                          textDecorationLine: 'underline',
                        },
                      ]}
                    >
                      {getString('CHECKOUT_REMOVE')}
                    </Text> */}
                    <Text style={styles.addCardAction}>
                      {getString('CHECKOUT_REMOVE')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {mergedCartItems.map((item, index) => (
                  <View key={item.ItemId}>
                    {renderCartItem(item)}
                    {index < mergedCartItems.length - 1 && (
                      <View style={{ height: theme.sizes.HEIGHT * 0.01 }} />
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.heading}>
                  {getString('CHECKOUT_SEND_A_GIFT')}
                </Text>
                <View style={[styles.tabContainer]}>
                  <TabItem
                    activeOpacity={0}
                    TabItemStyles={{
                      paddingHorizontal: scaleWithMax(10, 12),
                    }}
                    disabled={
                      !(
                        isMerchant &&
                        cartData?.MultiUsers &&
                        cartData.MultiUsers.length > 1
                      )
                    }
                    isGroupImage={
                      cartData?.SendType === 2
                        ? null
                        : isMerchant &&
                          cartData?.MultiUsers &&
                          cartData?.MultiUsers.length === 1
                        ? cartData?.MultiUsers[0].ProfileUrl ||
                          require('../../../assets/images/img-placeholder.png')
                        : isMerchant &&
                          cartData?.MultiUsers &&
                          cartData?.MultiUsers.length > 1
                        ? null
                        : cartData?.CampaginType === 3
                        ? cartData?.users.ProfileUrl ||
                          require('../../../assets/images/img-placeholder.png')
                        : cartData?.FriendImageUrl ||
                          require('../../../assets/images/img-placeholder.png')
                    }
                    title={
                      isMerchant &&
                      cartData?.MultiUsers &&
                      cartData?.MultiUsers.length > 1
                        ? getString('CHECKOUT_MY_EMPLOYEES')
                        : cartData?.MultiUsers &&
                          cartData?.MultiUsers.length === 1
                        ? cartData?.MultiUsers[0].FullName
                        : cartData?.CampaginType === 3
                        ? cartData?.users.FullName
                        : cartData?.FriendName ||
                          getString('SG_SEND_THROUGH_LINK')
                    }
                    TabTextStyles={{
                      ...styles.TextMedium,
                      maxWidth: '90%',
                    }}
                    onPress={() => {
                      if (
                        isMerchant &&
                        cartData?.MultiUsers &&
                        cartData?.MultiUsers.length > 1
                      ) {
                        setShowEmployeesBottomSheet(true);
                      }
                    }}
                    isLink={cartData?.SendType === 2}
                    hideRightIcon={true}
                    rightSideView={
                      <View
                        style={[
                          styles.row,
                          {
                            gap: theme.sizes.WIDTH * 0.036,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          hitSlop={15}
                          onPress={() => {
                            // If GiftMessage is in stack (came from it), goBack to edit; else replace to open
                            const state = navigation.getState();
                            const hasGiftMessageInStack =
                              state?.routes?.some(
                                r => r.name === 'GiftMessage',
                              ) ?? false;
                            if (hasGiftMessageInStack) {
                              navigation.goBack();
                            } else {
                              (navigation as any).replace('GiftMessage', {
                                friendUserId: cartData?.FriendId,
                                storeBranchId: cartData?.StoreBranchId,
                                orderId: cartData?.OrderId,
                              });
                            }
                          }}
                        >
                          <GiftIcon />
                        </TouchableOpacity>
                        {isMerchant &&
                          cartData?.MultiUsers &&
                          cartData?.MultiUsers.length > 1 && (
                            <TouchableOpacity
                              hitSlop={15}
                              onPress={() => setShowEmployeesBottomSheet(true)}
                            >
                              <ArrowDownIcon
                                style={{ transform: rtlTransform(isRtl) }}
                              />
                            </TouchableOpacity>
                          )}
                      </View>
                    }
                    icon={
                      isMerchant &&
                      cartData?.MultiUsers &&
                      cartData?.MultiUsers.length > 1 ? (
                        <View
                          style={{
                            width: scaleWithMax(40, 45),
                            height: scaleWithMax(40, 45),
                            borderRadius: scaleWithMax(20, 22.5),
                            backgroundColor: theme.colors.WHITE,
                            borderWidth: 1,
                            borderColor: theme.colors.DIVIDER_COLOR,
                            justifyContent: 'center',
                            alignItems: 'center',
                            ...rtlMargin(isRtl, 0, theme.sizes.WIDTH * 0.025),
                          }}
                        >
                          <SvgProfileFriends
                            height={scaleWithMax(23, 28)}
                            width={scaleWithMax(23, 28)}
                          />
                        </View>
                      ) : undefined
                    }
                  />
                </View>

                {/* Employees Bottom Sheet */}
                {isMerchant &&
                  cartData?.MultiUsers &&
                  cartData.MultiUsers.length > 0 && (
                    <AppBottomSheet
                      isOpen={showEmployeesBottomSheet}
                      onClose={() => setShowEmployeesBottomSheet(false)}
                      height={Math.min(
                        theme.sizes.HEIGHT * 0.7,
                        100 + (cartData.MultiUsers?.length || 0) * 60,
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
                          {getString('CHECKOUT_MY_EMPLOYEES')}
                        </Text>
                        <ShadowView
                          preset="default"
                          containerStyle={{
                            marginTop: theme.sizes.HEIGHT * 0.01,
                            marginBottom: theme.sizes.HEIGHT * 0.024,
                          }}
                          style={{
                            backgroundColor: theme.colors.WHITE,
                            borderRadius: 16,
                          }}
                        >
                          <FlatList
                            data={cartData.MultiUsers || []}
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
                                isLast={
                                  index ===
                                  (cartData.MultiUsers?.length || 0) - 1
                                }
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
                        </ShadowView>
                      </View>
                    </AppBottomSheet>
                  )}
              </View>

              <View style={styles.section}>
                <View style={[styles.sectionHeaderRow]}>
                  <Text style={styles.heading}>
                    {getString('CHECKOUT_PAYMENT_MANAGEMENT')}
                  </Text>
                  {userCards.length > 0 && (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddCard' as never)}
                    >
                      <View style={[styles.row]}>
                        {/* <PlusIcon
                          height={scaleWithMax(15, 18)}
                          width={scaleWithMax(15, 18)}
                        /> */}
                        <Text style={styles.addCardAction}>
                          {getString('CHECKOUT_CHANGE_CARD')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
                {isApplePayAvailable && (
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedPaymentMethod(
                        selectedPaymentMethod === 'applePay'
                          ? null
                          : 'applePay',
                      )
                    }
                  >
                    <ShadowView
                      preset="default"
                      containerStyle={{
                        marginBottom: theme.sizes.HEIGHT * 0.005,
                      }}
                    >
                      <View style={styles.GiftContainer}>
                        <View
                          style={{
                            ...styles.row,
                            flex: 1,
                            gap: theme.sizes.WIDTH * 0.025,
                          }}
                        >
                          <CheckBox
                            Selected={selectedPaymentMethod === 'applePay'}
                            onSelectionPress={() =>
                              setSelectedPaymentMethod(
                                selectedPaymentMethod === 'applePay'
                                  ? null
                                  : 'applePay',
                              )
                            }
                          />
                          <SvgApplePayIcon
                            height={scaleWithMax(32, 35)}
                            width={scaleWithMax(32, 35)}
                          />
                          <View>
                            <Text style={styles.TextMedium}>
                              {getString('CHECKOUT_APPLE_PAY')}
                            </Text>
                          </View>
                        </View>
                        <SvgSelectedCheck
                          width={scaleWithMax(16, 18)}
                          height={scaleWithMax(16, 18)}
                          style={{
                            opacity:
                              selectedPaymentMethod === 'applePay' ? 1 : 0,
                          }}
                        />
                      </View>
                    </ShadowView>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() =>
                    setSelectedPaymentMethod(
                      selectedPaymentMethod === 'creditCard'
                        ? null
                        : 'creditCard',
                    )
                  }
                >
                  <ShadowView
                    preset="default"
                    containerStyle={{
                      marginBottom: theme.sizes.HEIGHT * 0.005,
                    }}
                  >
                    <View style={styles.GiftContainer}>
                      <View
                        style={{
                          ...styles.row,
                          flex: 1,
                          gap: theme.sizes.WIDTH * 0.025,
                        }}
                      >
                        <CheckBox
                          Selected={selectedPaymentMethod === 'creditCard'}
                          onSelectionPress={() =>
                            setSelectedPaymentMethod(
                              selectedPaymentMethod === 'creditCard'
                                ? null
                                : 'creditCard',
                            )
                          }
                        />
                        <NoonIcon
                          height={scaleWithMax(32, 35)}
                          width={scaleWithMax(32, 35)}
                        />
                        <View>
                          <Text style={styles.TextMedium}>
                            {getString('CHECKOUT_CREDIT_DEBIT_CARD')}
                          </Text>
                        </View>
                      </View>
                      <SvgSelectedCheck
                        width={scaleWithMax(16, 18)}
                        height={scaleWithMax(16, 18)}
                        style={{
                          opacity:
                            selectedPaymentMethod === 'creditCard' ? 1 : 0,
                        }}
                      />
                    </View>
                  </ShadowView>
                </TouchableOpacity>

                {(selectedCardFromParams || userCards.length > 0) && (
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedPaymentMethod(
                        selectedPaymentMethod === 'savedCard'
                          ? null
                          : 'savedCard',
                      )
                    }
                  >
                    <ShadowView
                      preset="default"
                      containerStyle={{
                        marginBottom: theme.sizes.HEIGHT * 0.005,
                      }}
                    >
                      <View style={styles.GiftContainer}>
                        <View
                          style={{
                            ...styles.row,
                            flex: 1,
                            gap: theme.sizes.WIDTH * 0.025,
                          }}
                        >
                          <CheckBox
                            Selected={selectedPaymentMethod === 'savedCard'}
                            onSelectionPress={() =>
                              setSelectedPaymentMethod(
                                selectedPaymentMethod === 'savedCard'
                                  ? null
                                  : 'savedCard',
                              )
                            }
                          />

                          {(
                            selectedCardFromParams?.Brand || userCards[0]?.Brand
                          )
                            ?.toLowerCase()
                            .includes('master') ? (
                            <MasterCardIcon
                              height={scaleWithMax(32, 35)}
                              width={scaleWithMax(32, 35)}
                            />
                          ) : (
                              selectedCardFromParams?.Brand ||
                              userCards[0]?.Brand
                            )
                              ?.toLowerCase()
                              .includes('noon') ? (
                            <NoonIcon
                              height={scaleWithMax(32, 35)}
                              width={scaleWithMax(32, 35)}
                            />
                          ) : (
                            <VisaIcon
                              height={scaleWithMax(32, 35)}
                              width={scaleWithMax(32, 35)}
                            />
                          )}
                          <View>
                            <Text style={styles.TextMedium}>
                              {selectedCardFromParams?.CardNumber ||
                                userCards[0]?.CardNumber}
                            </Text>
                            <Text style={styles.TextMedium}>
                              {selectedCardFromParams?.Brand ||
                                userCards[0]?.Brand}
                            </Text>
                          </View>
                        </View>
                        <SvgSelectedCheck
                          width={scaleWithMax(16, 18)}
                          height={scaleWithMax(16, 18)}
                          style={{
                            opacity:
                              selectedPaymentMethod === 'savedCard' ? 1 : 0,
                          }}
                        />
                      </View>
                    </ShadowView>
                  </TouchableOpacity>
                )}
                {walletBalance?.data &&
                  walletBalance?.data?.WalletBalance > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedPaymentMethod(
                          selectedPaymentMethod === 'wallet' ? null : 'wallet',
                        )
                      }
                    >
                      <ShadowView preset="default">
                        <View style={styles.GiftContainer}>
                          <View
                            style={{
                              ...styles.row,
                              flex: 1,
                              gap: theme.sizes.WIDTH * 0.025,
                            }}
                          >
                            <CheckBox
                              Selected={selectedPaymentMethod === 'wallet'}
                              onSelectionPress={() =>
                                setSelectedPaymentMethod(
                                  selectedPaymentMethod === 'wallet'
                                    ? null
                                    : 'wallet',
                                )
                              }
                            />
                            <SvgGifteeWalletIcon
                              height={scaleWithMax(32, 35)}
                              width={scaleWithMax(32, 35)}
                            />
                            <View>
                              <Text style={styles.TextMedium}>
                                {getString('W_GIFTEE_WALLET')}
                              </Text>
                              <PriceWithIcon
                                amount={
                                  walletBalance?.data?.WalletBalance
                                    ? Number(
                                        walletBalance.data.WalletBalance,
                                      ).toFixed(2)
                                    : '0.00'
                                }
                                textStyle={styles.TextMedium}
                                icon={
                                  <SvgRiyalIcon
                                    width={scaleWithMax(12, 14)}
                                    height={scaleWithMax(12, 14)}
                                  />
                                }
                              />
                            </View>
                          </View>
                          <SvgSelectedCheck
                            width={scaleWithMax(16, 18)}
                            height={scaleWithMax(16, 18)}
                            style={{
                              opacity:
                                selectedPaymentMethod === 'wallet' ? 1 : 0,
                            }}
                          />
                        </View>
                      </ShadowView>
                    </TouchableOpacity>
                  )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text
                    style={{
                      ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
                      fontSize: theme.sizes.FONTSIZE_SMALL_HEADING,
                      color: theme.colors.BLACK,
                    }}
                  >
                    {getString('CHECKOUT_SEND_GIFT_WITH_EHSAN')}
                  </Text>
                  <SvgEhsanIcon
                    width={scaleWithMax(26, 28)}
                    height={scaleWithMax(26, 28)}
                  />
                </View>
                <Text
                  style={{
                    ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                    color: '#1B917B',
                    fontSize: scaleWithMax(10, 11),
                    marginTop: theme.sizes.HEIGHT * -0.008,
                  }}
                >
                  {getString('CHECKOUT_EHSAN_MESSAGE')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.row, { gap: 10 }]}
                >
                  {DomationAmounts.map(amount => {
                    // Check if custom value matches this preset value
                    const customMatchesPreset =
                      showCustomDonationInput &&
                      customDonationAmount &&
                      Number(customDonationAmount) === Number(amount.value);

                    const isActive =
                      amount.value === 'Custom'
                        ? showCustomDonationInput
                        : activeDomationAmount === Number(amount.value) &&
                          !customMatchesPreset;

                    return (
                      <TouchableOpacity
                        key={amount.value}
                        style={[
                          styles.row,
                          {
                            justifyContent: 'center',
                            gap: theme.sizes.WIDTH * 0.025,
                            paddingHorizontal: theme.sizes.WIDTH * 0.03,
                            paddingVertical: scaleWithMax(8, 10),
                            borderRadius: 10,
                            backgroundColor: isActive
                              ? theme.colors.SECONDARY
                              : theme.colors.LIGHT_GRAY,
                            // minHeight: scaleWithMax(36, 38),
                          },
                        ]}
                        onPress={() => {
                          if (amount.value === 'Custom') {
                            // Toggle custom input
                            if (showCustomDonationInput) {
                              setShowCustomDonationInput(false);
                              setCustomDonationAmount('');
                              setActiveDomationAmount(undefined);
                            } else {
                              setShowCustomDonationInput(true);
                              setActiveDomationAmount(undefined);
                              setCustomDonationAmount('');
                            }
                          } else {
                            // Toggle preset amount
                            if (activeDomationAmount === Number(amount.value)) {
                              // Already selected, deselect it
                              setActiveDomationAmount(undefined);
                            } else {
                              // Select this preset
                              setShowCustomDonationInput(false);
                              setCustomDonationAmount('');
                              setActiveDomationAmount(Number(amount.value));
                            }
                          }
                        }}
                      >
                        {amount.value === 'Custom' ? (
                          <Text
                            style={[
                              styles.TextMedium,
                              isActive && {
                                ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
                                color: theme.colors.PRIMARY,
                              },
                            ]}
                          >
                            {amount.title}
                          </Text>
                        ) : (
                          <PriceWithIcon
                            amount={amount.title}
                            variant={isActive ? 'discounted' : 'default'}
                            icon={
                              isActive ? (
                                <SvgRiyalPink
                                  width={scaleWithMax(12, 14)}
                                  height={scaleWithMax(12, 14)}
                                />
                              ) : (
                                <SvgRiyalIcon
                                  width={scaleWithMax(12, 14)}
                                  height={scaleWithMax(12, 14)}
                                />
                              )
                            }
                            textStyle={
                              isActive
                                ? {
                                    ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
                                    color: theme.colors.PRIMARY,
                                  }
                                : styles.TextMedium
                            }
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {showCustomDonationInput && (
                  <View style={{ marginTop: theme.sizes.HEIGHT * 0.01 }}>
                    <InputField
                      icon={
                        <SvgEhsanIcon
                          width={scaleWithMax(26, 28)}
                          height={scaleWithMax(26, 28)}
                        />
                      }
                      fieldProps={{
                        placeholder: getString('CHECKOUT_ENTER_AMOUNT'),
                        value: customDonationAmount,
                        onChangeText: (text: string) => {
                          // Only allow numbers
                          const numericValue = text.replace(/[^0-9]/g, '');
                          setCustomDonationAmount(numericValue);
                          if (numericValue) {
                            // Set activeDomationAmount but presets won't highlight if custom matches them
                            setActiveDomationAmount(Number(numericValue));
                          } else {
                            setActiveDomationAmount(undefined);
                          }
                        },
                        maxLength: 4,
                        returnKeyType: 'done',
                        onSubmitEditing: () => {
                          Keyboard.dismiss();
                        },
                        keyboardType: 'numeric',
                        autoFocus: true,
                      }}
                    />
                  </View>
                )}
                <Text
                  style={[
                    styles.heading,
                    {
                      marginTop: theme.sizes.HEIGHT * 0.01,
                    },
                  ]}
                >
                  {getString('CHECKOUT_ORDER_INFO')}
                </Text>
                {orderInfoRows.map((row, index) => (
                  <React.Fragment key={row.key}>
                    <View style={styles.Prices}>
                      <Text style={styles.TextMedium}>{row.label}</Text>
                      <PriceWithIcon amount={row.amount} />
                    </View>
                    {index < orderInfoRows.length - 1 && (
                      <View style={styles.priceSeparator} />
                    )}
                  </React.Fragment>
                ))}

                <Text style={styles.vatNote}>
                  {getString('CHECKOUT_VAT_NOTE')}
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View
            style={{
              height: theme.sizes.HEIGHT * 0.11,
              backgroundColor: theme.colors.WHITE,
            }}
          >
            <View style={styles.footerContainer}>
              <View style={{ position: 'relative' }}>
                <CustomButton
                  title={
                    selectedPaymentMethod === 'applePay'
                      ? ''
                      : getString('CHECKOUT_PROCEED_TO_CHECKOUT')
                  }
                  onPress={handleProceedToCheckout}
                  icon={
                    selectedPaymentMethod === 'applePay' ? (
                      <SvgApplePayText />
                    ) : undefined
                  }
                  buttonStyle={{
                    backgroundColor: !selectedPaymentMethod
                      ? '#FFA5A5'
                      : selectedPaymentMethod === 'applePay'
                      ? '#000000'
                      : theme.colors.PRIMARY,
                    borderColor: !selectedPaymentMethod
                      ? '#FFA5A5'
                      : selectedPaymentMethod === 'applePay'
                      ? '#000000'
                      : theme.colors.PRIMARY,
                  }}
                  labelStyle={{
                    color: theme.colors.WHITE,
                  }}
                  disabled={
                    submitting ||
                    waitingForVideoUpload ||
                    !selectedPaymentMethod
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
                    amount={
                      (cartData?.TotalAmount || 0) + (activeDomationAmount || 0)
                    }
                    textStyle={{
                      color: theme.colors.WHITE,
                    }}
                    icon={
                      <SvgRiyalIconWhite
                        width={scaleWithMax(12, 14)}
                        height={scaleWithMax(12, 14)}
                      />
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={{ height: theme.sizes.HEIGHT * 0.8 }}>
          <PlaceholderLogoText
            text={getString('CHECKOUT_YOUR_CART_IS_EMPTY')}
          />
        </View>
      )}

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
        message={getString('CHECKOUT_REMOVE_ITEM_CONFIRM').replace(
          '{value}',
          itemToRemove?.ItemName || '',
        )}
        confirmText={getString('CHECKOUT_REMOVE')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={() => handleRemoveItem()}
        onCancel={() => setTimeout(() => setItemToRemove(null), 300)}
      />

      {/* Payment WebView Modal */}
      <Modal
        visible={showPaymentWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowPaymentWebView(false);
          setPaymentUrl(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.WHITE }}>
          {/* Header with close button */}
          <View
            style={[
              styles.sectionHeaderRow,
              {
                paddingHorizontal: theme.sizes.PADDING,
                paddingVertical: theme.sizes.HEIGHT * 0.01,
                backgroundColor: theme.colors.WHITE,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.DIVIDER_COLOR,
                ...Platform.select({
                  ios: {
                    paddingTop: theme.sizes.HEIGHT * 0.02,
                  },
                }),
              },
            ]}
          >
            <Text style={styles.heading}>
              {getString('CHECKOUT_PAYMENT_MANAGEMENT')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowPaymentWebView(false);
                setPaymentUrl(null);
              }}
              style={{
                padding: 8,
              }}
            >
              <Text
                style={{ ...styles.TextMedium, color: theme.colors.PRIMARY }}
              >
                {getString('NG_CANCEL')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* WebView */}
          {paymentUrl && (
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              onMessage={handleWebViewMessage}
              injectedJavaScript={injectedJavaScript}
              onLoadStart={() => setWebViewLoading(true)}
              onLoadEnd={() => setWebViewLoading(false)}
              onError={syntheticEvent => {
                const { nativeEvent } = syntheticEvent;
                console.error('WebView error: ', nativeEvent);
                notify.error(getString('AU_ERROR_OCCURRED'));
              }}
              style={{ flex: 1 }}
              startInLoadingState={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              renderLoading={() => (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.WHITE,
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.PRIMARY}
                  />
                </View>
              )}
            />
          )}

          {/* Loading indicator */}
          {/* {webViewLoading && (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -25 }, { translateY: -25 }],
              }}
            >
              <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
            </View>
          )} */}
        </View>
      </Modal>
    </ParentView>
  );
};

export default CheckOut;
