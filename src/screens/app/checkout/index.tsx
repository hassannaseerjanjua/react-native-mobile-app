import {
  Image,
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
  SvgRiyalIconWhite,
  SvgSelectedCheck,
  VisaIcon,
  SvgProfileFriends,
  SvgDeleteIcon,
} from '../../../assets/icons';
import {
  scaleWithMax,
  rtlTransform,
  rtlFlexDirection,
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
import TabItem from '../../../components/global/TabItem';
import GroupTabs from '../../../components/global/GroupTabs';
import SearchUserItem from '../../../components/app/SearchUserItem';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import { FlatList } from 'react-native';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';

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
  const [itemToRemove, setItemToRemove] = useState<(CartItem & { originalOrderItemIds?: number[] }) | null>(null);
  const [giftLink, setGiftLink] = useState<string | null>(null);
  const [activeDomationAmount, setActiveDomationAmount] = useState<number>();
  const [showCustomDonationInput, setShowCustomDonationInput] = useState(false);
  const [customDonationAmount, setCustomDonationAmount] = useState<string>('');
  const [showEmployeesBottomSheet, setShowEmployeesBottomSheet] = useState(false);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const isMerchant = user?.isMerchant === 1;
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

  // Merge items with the same ItemId
  const mergedCartItems = useMemo(() => {
    if (!cartData?.Items) return [];

    const itemsMap = new Map<number, CartItem & { originalOrderItemIds: number[] }>();

    cartData.Items.forEach(item => {
      const existingItem = itemsMap.get(item.ItemId);

      if (existingItem) {
        // Merge quantities and amounts
        existingItem.Quantity += item.Quantity;
        existingItem.TotalAmount += item.TotalAmount;
        existingItem.OrderAmount += item.OrderAmount;
        existingItem.DiscountAmount += item.DiscountAmount;
        existingItem.originalOrderItemIds.push(item.OrderItemId);
      } else {
        // First occurrence of this ItemId - use this as the primary OrderItemId
        itemsMap.set(item.ItemId, {
          ...item,
          originalOrderItemIds: [item.OrderItemId],
        });
      }
    });

    return Array.from(itemsMap.values());
  }, [cartData?.Items]);

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
    const isMergedItem = item.originalOrderItemIds && item.originalOrderItemIds.length > 1;
    const orderItemIdsToRemove = isMergedItem ? item.originalOrderItemIds! : [item.OrderItemId];

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
    const isMergedItem = item.originalOrderItemIds && item.originalOrderItemIds.length > 1;
    const itemIdsToUpdate = isMergedItem ? item.originalOrderItemIds! : [item.OrderItemId];
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
        quantityPerItem = Math.floor(newQuantity / item.originalOrderItemIds.length);
        remainder = newQuantity % item.originalOrderItemIds.length;
      }

      const updatedItems = cartData.Items.map(cartItem => {
        if (isMergedItem && item.originalOrderItemIds?.includes(cartItem.OrderItemId)) {
          // For merged items, distribute quantity evenly with remainder in first item
          const isFirstItem = cartItem.OrderItemId === item.originalOrderItemIds[0];
          const itemQuantity = quantityPerItem + (isFirstItem ? remainder : 0);
          const newOrderAmount = cartItem.UnitPrice * itemQuantity;
          // Recalculate discount proportionally based on quantity change
          const discountPerUnit = cartItem.Quantity > 0 ? cartItem.DiscountAmount / cartItem.Quantity : 0;
          const newDiscountAmount = discountPerUnit * itemQuantity;
          // Recalculate VAT proportionally based on quantity change
          const vatPerUnit = cartItem.Quantity > 0 ? (cartItem.VatAmount || 0) / cartItem.Quantity : 0;
          const newVatAmount = vatPerUnit * itemQuantity;
          const newTotalAmount = newOrderAmount - newDiscountAmount + newVatAmount;
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
          const discountPerUnit = cartItem.Quantity > 0 ? cartItem.DiscountAmount / cartItem.Quantity : 0;
          const newDiscountAmount = discountPerUnit * newQuantity;
          // Recalculate VAT proportionally based on quantity change
          const vatPerUnit = cartItem.Quantity > 0 ? (cartItem.VatAmount || 0) / cartItem.Quantity : 0;
          const newVatAmount = vatPerUnit * newQuantity;
          const newTotalAmount = newOrderAmount - newDiscountAmount + newVatAmount;
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

  const handleRemoveItem = async (itemParam?: CartItem & { originalOrderItemIds?: number[] }) => {
    const item = itemParam || itemToRemove;
    if (!item) return;

    // Check if this is a merged item (has multiple OrderItemIds)
    const isMergedItem = item.originalOrderItemIds && item.originalOrderItemIds.length > 1;
    const orderItemIdsToRemove = isMergedItem ? item.originalOrderItemIds! : [item.OrderItemId];

    // Check if removing these items would leave the cart empty
    const remainingItemsCount = (cartData?.Items?.length || 0) - orderItemIdsToRemove.length;
    const isLastItem = remainingItemsCount <= 0;

    if (!itemParam) {
      setItemToRemove(null);
    }

    // If it's the last item(s), use clear cart API instead of remove item API
    if (isLastItem) {
      await handleClearCart();
    } else {
      await removeCartItem(item);
    }
  };

  const renderCartItem = (item: CartItem & { originalOrderItemIds?: number[] }) => {
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
          {
            isMerchant ? (<View
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
              <TouchableOpacity onPress={() => setItemToRemove(item)}>
                <SvgDeleteIcon />
              </TouchableOpacity>



            </View>) : (<View
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
            </View>)
          }

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
        getString('CHECKOUT_SOMEONE');
      const shareMessage = getString('CHECKOUT_SHARE_GIFT_MESSAGE')
        .replace('{senderName}', senderName)
        .replace('{giftLink}', giftLink);

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
    } catch (error) { }
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

      const payload: any = {
        orderid: cartData.OrderId,
        orderPaymentType: selectedPaymentMethod === 'visa' ? 2 : 1,
        IsRedeem: false,
        EhsaanAmount: activeDomationAmount || 0,
      };

      // For merchants, include FriendIds in payload if available
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

      // Check if the body content indicates success
      const isSuccess = message.includes('SUCCESS') || message.includes('Order:True');
      const isFailure = message.includes('Payment Failed') || message.includes('FAILED');

      if (isSuccess) {
        // Payment successful - close webview and show success screen
        setShowPaymentWebView(false);
        setPaymentUrl(null);
        setCheckoutCompleted(true);

        // Auto-share gift link if available and not send type 2
        if (giftLink && cartData?.SendType !== 2) {
          handleShareGiftLink(giftLink);
        }
      } else if (isFailure) {
        // Payment failed - close webview and show error
        setShowPaymentWebView(false);
        setPaymentUrl(null);
        notify.error(getString('AU_ERROR_OCCURRED') || 'Payment failed. Please try again.');
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

    return (
      <>
        <SuccessMessage
          SuccessLogo={isSendType2 ? <SvgLinkShareIcon /> : <SvgGiftSentIcon />}
          SuccessMessage={isSendType2 ? getString('CHECKOUT_GIFT_LINK_CREATED') : getString('CHECKOUT_GIFT_DELIVERED')}
          SuccessSubMessage={!isSendType2 ? getString('CHECKOUT_YOUR_SURPRISE_HAS_BEEN_SENT') : ''}
          primaryButtonTitle={
            isSendType2 ? getString('CHECKOUT_SHARE_LINK') : getString('CHECKOUT_HOME')
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
          <PlaceholderLogoText text={getString('EMPTY_NO_PRODUCTS_FOUND') || getString('CHECKOUT_YOUR_CART_IS_EMPTY')} />
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

  const DomationAmounts = [
    { value: '3', title: '3' },
    { value: '5', title: '5' },
    { value: '10', title: '10' },
    { value: 'Custom', title: getString('CHECKOUT_CUSTOM') },
  ];

  return (
    <ParentView>
      <HomeHeader title={getString('CHECKOUT_TITLE')} showBackButton={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        behavior='padding'
      // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent]}
          keyboardShouldPersistTaps="handled"
        // keyboardDismissMode="on-drag"
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
                disabled={!(isMerchant && cartData.MultiUsers && cartData.MultiUsers.length > 1)}
                isGroupImage={
                  cartData.SendType === 2
                    ? null
                    : isMerchant && cartData.MultiUsers && cartData.MultiUsers.length === 1
                      ? cartData.MultiUsers[0].ProfileUrl ||
                      require('../../../assets/images/img-placeholder.png')
                      : isMerchant && cartData.MultiUsers && cartData.MultiUsers.length > 1
                        ? null
                        : cartData.CampaginType === 3
                          ? cartData.users.ProfileUrl ||
                          require('../../../assets/images/img-placeholder.png')
                          : cartData.FriendImageUrl ||
                          require('../../../assets/images/img-placeholder.png')
                }
                title={
                  isMerchant && cartData.MultiUsers && cartData.MultiUsers.length > 1
                    ? getString('CHECKOUT_MY_EMPLOYEES') : cartData.MultiUsers && cartData.MultiUsers.length === 1 ? cartData.MultiUsers[0].FullName
                      : cartData.CampaginType === 3
                        ? cartData.users.FullName
                        : cartData.FriendName || getString('SG_SEND_THROUGH_LINK')
                }
                TabTextStyles={{
                  ...styles.TextMedium,
                  maxWidth: '90%',
                }}
                onPress={() => {
                  if (isMerchant && cartData.MultiUsers && cartData.MultiUsers.length > 1) {
                    setShowEmployeesBottomSheet(true);
                  }
                }}
                isLink={cartData.SendType === 2}
                hideRightIcon={true}
                rightSideView={
                  <View
                    style={[
                      styles.row,
                      {
                        gap: theme.sizes.WIDTH * 0.036,
                        flexDirection: rtlFlexDirection(isRtl),
                      },
                    ]}
                  >
                    <TouchableOpacity
                      hitSlop={15}
                      onPress={() => {
                        (navigation as any).navigate('GiftMessage', {
                          friendUserId: cartData.FriendId,
                          storeBranchId: cartData.StoreBranchId,
                          orderId: cartData.OrderId,
                        });
                      }}
                    >
                      <GiftIcon />
                    </TouchableOpacity>
                    {isMerchant && cartData.MultiUsers && cartData.MultiUsers.length > 0 && (
                      cartData.MultiUsers.length > 1 ? (
                        <TouchableOpacity
                          hitSlop={15}
                          onPress={() => setShowEmployeesBottomSheet(true)}
                        >
                          <ArrowDownIcon style={{ transform: rtlTransform(isRtl) }} />
                        </TouchableOpacity>
                      ) : (
                        <View>
                          <ArrowDownIcon style={{ transform: rtlTransform(isRtl) }} />
                        </View>
                      )
                    )}
                  </View>
                }
                icon={
                  isMerchant && cartData.MultiUsers && cartData.MultiUsers.length > 1 ? (
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
            {isMerchant && cartData.MultiUsers && cartData.MultiUsers.length > 0 && (
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
                          isLast={index === (cartData.MultiUsers?.length || 0) - 1}
                          showAddButton={false}
                          showSelection={false}
                          isGeneralSearchScreen={false}
                          onPress={() => { }}
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
            {isIOS && <TouchableOpacity
              onPress={() =>
                setSelectedPaymentMethod(
                  selectedPaymentMethod === 'applePay' ? null : 'applePay',
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
                    Selected={selectedPaymentMethod === 'applePay'}
                    onSelectionPress={() =>
                      setSelectedPaymentMethod(
                        selectedPaymentMethod === 'applePay' ? null : 'applePay',
                      )
                    }
                  />
                  <SvgApplePayIcon
                    height={scaleWithMax(32, 35)}
                    width={scaleWithMax(32, 35)}
                  />
                  <View>
                    <Text style={styles.TextMedium}>{getString('CHECKOUT_APPLE_PAY')}</Text>
                  </View>
                </View>
                <SvgSelectedCheck
                  width={scaleWithMax(16, 18)}
                  height={scaleWithMax(16, 18)}
                  style={{
                    opacity: selectedPaymentMethod === 'applePay' ? 1 : 0,
                  }}
                />
              </View>
            </TouchableOpacity>}
            <TouchableOpacity
              // disabled
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
                    onSelectionPress={() =>
                      setSelectedPaymentMethod(
                        selectedPaymentMethod === 'visa' ? null : 'visa',
                      )
                    }
                  />
                  <VisaIcon
                    height={scaleWithMax(32, 35)}
                    width={scaleWithMax(32, 35)}
                  />
                  <View>
                    <Text style={styles.TextMedium}>424242XXXXXX4242</Text>
                    <Text style={styles.TextMedium}>{getString('CHECKOUT_VISA')}</Text>
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
                    <Text style={styles.TextMedium}>{getString('W_GIFTEE_WALLET')}</Text>
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
              <PriceWithIcon Price={cartData.TotalAmount + (activeDomationAmount || 0)} />
            </View>
            {cartData.TotalDiscount > 0 && (
              <View
                style={[
                  styles.Prices,
                  { flexDirection: rtlFlexDirection(isRtl) },
                ]}
              >
                <Text style={styles.TextMedium}>{getString('CHECKOUT_DISCOUNT')}</Text>
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
                <Text style={styles.TextMedium}>{getString('CHECKOUT_VAT')}</Text>
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
                <Text style={styles.TextMedium}>{getString('CHECKOUT_DELIVERY_CHARGES')}</Text>
                <PriceWithIcon Price={cartData.DeliveryCharges} />
              </View>
            )}
            <View
              style={{
                flexDirection: rtlFlexDirection(isRtl),
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: theme.sizes.HEIGHT * 0.002,
              }}
            >
              <Text style={styles.TextMedium}>{getString('CHECKOUT_SEND_GIFT_WITH_EHSAN')}</Text>
              <SvgEhsanIcon width={scaleWithMax(26, 28)} height={scaleWithMax(26, 28)} />
            </View>
            <Text
              style={{
                ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                color: '#1B917B',
                fontSize: scaleWithMax(10, 11),
                // marginTop: theme.sizes.HEIGHT * 0.01,
              }}
            >
              {getString('CHECKOUT_EHSAN_MESSAGE')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: rtlFlexDirection(isRtl),
                gap: 10,
              }}
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
                    : activeDomationAmount === Number(amount.value) && !customMatchesPreset;

                return (
                  <TouchableOpacity
                    key={amount.value}
                    style={{
                      flexDirection: rtlFlexDirection(isRtl),
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: theme.sizes.WIDTH * 0.02,
                      paddingHorizontal: theme.sizes.WIDTH * 0.03,
                      paddingVertical: scaleWithMax(8, 10),
                      borderRadius: 10,
                      backgroundColor: isActive
                        ? theme.colors.SECONDARY
                        : theme.colors.LIGHT_GRAY,
                      // minHeight: scaleWithMax(36, 38),
                    }}
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
                    <View style={[styles.row, { gap: theme.sizes.WIDTH * 0.01 }]}>
                      {amount.value === 'Custom' ? null : isActive ? (
                        <SvgRiyalIconPrimary
                          width={scaleWithMax(12, 14)}
                          height={scaleWithMax(12, 14)}
                        />
                      ) : (
                        <SvgRiyalIcon
                          width={scaleWithMax(12, 14)}
                          height={scaleWithMax(12, 14)}
                        />
                      )}
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
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {showCustomDonationInput && (
              <View style={{ marginTop: theme.sizes.HEIGHT * 0.015 }}>
                <InputField
                  icon={
                    <SvgEhsanIcon
                      width={scaleWithMax(20, 22)}
                      height={scaleWithMax(20, 22)}
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
            <Text style={styles.vatNote}>{getString('CHECKOUT_VAT_NOTE')}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
              Price={cartData.TotalAmount + (activeDomationAmount || 0)}
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
        message={`${getString('CHECKOUT_REMOVE_ITEM_CONFIRM')} "${itemToRemove?.ItemName
          }" ${getString('CHECKOUT_FROM_CART')}`}
        confirmText={getString('CHECKOUT_REMOVE')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={() => handleRemoveItem()}
        onCancel={() => setItemToRemove(null)}
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
            style={{
              flexDirection: rtlFlexDirection(isRtl),
              alignItems: 'center',
              justifyContent: 'space-between',
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
            }}
          >
            <Text style={styles.heading}>{getString('CHECKOUT_PAYMENT_MANAGEMENT')}</Text>
            <TouchableOpacity
              onPress={() => {
                setShowPaymentWebView(false);
                setPaymentUrl(null);
              }}
              style={{
                padding: 8,
              }}
            >
              <Text style={{ ...styles.TextMedium, color: theme.colors.PRIMARY }}>
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
              onError={(syntheticEvent) => {
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
                  <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
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
