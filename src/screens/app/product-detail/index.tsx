import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import useStyles from './style';
import {
  MinusIcon,
  PlusIcon,
  SvgHomeBack,
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
  SvgRiyalIcon,
  SvgRiyalPink,
} from '../../../assets/icons';
import { scaleWithMax, rtlTransform } from '../../../utils';
import ProductImageSlider from '../../../components/global/ProductImageSlider';
import GroupTabs from '../../../components/global/GroupTabs';
import CustomButton from '../../../components/global/Custombutton';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types';
import ParentView from '../../../components/app/ParentView';
import apiEndpoints from '../../../constants/api-endpoints';
import api from '../../../utils/api';
import { useLocaleStore } from '../../../store/reducer/locale';
import notify from '../../../utils/notify';
import useGetApi from '../../../hooks/useGetApi';
import { StoreProduct, CartResponse } from '../../../types';
import { Text } from '../../../utils/elements';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import { useAuthStore } from '../../../store/reducer/auth';

const ProductDetails: React.FC<AppStackScreen<'ProductDetails'>> = ({
  route, navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const itemId = route?.params?.itemId;
  const friendUserId = route?.params?.friendUserId ?? null;
  const friendIds = route?.params?.FriendIds ?? undefined;
  const storeId = route?.params?.storeId ?? null;
  const isMerchant = useAuthStore().user?.isMerchant;
  const { sizes } = theme;
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [item, setItem] = useState<any>(null);
  const sendType = route?.params?.sendType ?? null;
  const isSendAGiftFlow = sendType !== null && sendType !== undefined;
  const campaignId = route?.params?.campaignId ?? null;
  const isGiftOneGetOne = route.params.type === 'GiftOneGetOne';
  const [showClearCartConfirmation, setShowClearCartConfirmation] =
    useState(false);
  const [isVariantChange, setIsVariantChange] = useState(false);

  const cartApi = useGetApi<CartResponse>(
    apiEndpoints.GET_CART_ITEMS,
    {
      transformData: (data: any) => (data?.Data || data) as CartResponse,
    },
  );
  const itemApi = useGetApi<StoreProduct>(
    isSendAGiftFlow
      ? apiEndpoints.GET_SEND_A_GIFT_ITEM_BY_ID(itemId, !!campaignId)
      : apiEndpoints.GET_STORE_ITEM_BY_ID(
        itemId,
        route.params.type === 'GiftOneGetOne',
      ),
    {
      transformData: (data: any) => data?.Data ?? null,
    },
  );

  const loading = itemApi.loading;

  useEffect(() => {
    if (itemApi.error) {
      notify.error(itemApi.error || getString('AU_ERROR_OCCURRED'));
      navigation.goBack();
    } else if (itemApi.data) {
      setItem(itemApi.data);
      // First try to find variant with IsDefault === true and Status === 1
      // Otherwise, find first variant with Status === 1
      const defaultVariant = itemApi.data?.Variants?.find(
        (v: any) => v.Status === 1 && v.IsDefault === true,
      );
      const activeVariant =
        defaultVariant ||
        itemApi.data?.Variants?.find((v: any) => v.Status === 1);
      const variantId = activeVariant?.ItemVariantId;
      setSelectedFilter(variantId ? String(variantId) : '');
    }
  }, [itemApi.data, itemApi.error]);

  const filterOptions = useMemo(() => {
    return (
      item?.Variants?.map((v: any) => ({
        id: String(v.ItemVariantId),
        title: isRtl ? v.NameAr : v.NameEn,
      })) ?? []
    );
  }, [item]);

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setQuantity(prevQuantity => prevQuantity + 1);
    } else {
      if (quantity > 1) {
        setQuantity(prevQuantity => prevQuantity - 1);
      }
    }
  };
  const productImages = useMemo(() => {
    const placeholderImage = item?.Thumbnail
      ? { uri: item?.Thumbnail }
      : require('../../../assets/images/img-placeholder.png');

    if (!item?.Images || item.Images.length === 0) {
      return [placeholderImage];
    }

    const imgs = item.Images.map((img: any) =>
      img.ImageUrl && img.ImageUrl.trim()
        ? { uri: img.ImageUrl }
        : placeholderImage,
    );

    return imgs.length > 0 ? imgs : [placeholderImage];
  }, [item]);

  const handleFavorite = async () => {
    if (!item) return;
    const previousFavoriteState = item.isFavourite ?? false;
    // Optimistically update the UI
    setItem({ ...item, isFavourite: !previousFavoriteState });
    try {
      const res = await api.post<any>(apiEndpoints.HANDLE_FAVORITE_ITEM, {
        ItemId: item.ItemId,
        isFavorite: !previousFavoriteState,
      });
      if (!res.success) {
        // Revert on error
        setItem({ ...item, isFavourite: previousFavoriteState });
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      // Revert on error
      setItem({ ...item, isFavourite: previousFavoriteState });
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  const performAddToCart = async (skipSubmittingCheck = false) => {
    if (!skipSubmittingCheck && submitting) return;

    const selectedVariant = item?.Variants?.find(
      (v: any) => v.ItemVariantId === Number(selectedFilter),
    );
    const isAlreadyInCart = selectedVariant?.IsAddedToCart === true;
    const currentCartQuantity = selectedVariant?.CountInCart || 0;

    if (isAlreadyInCart) {
      // Update cart item quantity
      const newQuantity = currentCartQuantity + quantity;
      const payload = {
        ItemId: item.ItemId,
        ItemVariantId: selectedFilter ? Number(selectedFilter) : undefined,
        ...(!isMerchant ? { Quantity: newQuantity } : {
          Quantity: quantity,
        }),
      };

      const response = await api.put(
        apiEndpoints.UPDATE_CART_ITEM_QUANTITY,
        payload,
      );
      if (response.success) {
        navigation.goBack();
      } else {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    } else {
      // Add new item to cart
      const finalCampaignId =
        campaignId || item?.CampaignId || item?.Campaign?.CampaignId;

      const payload: any = {
        ItemId: item.ItemId,
        ItemVariantId: selectedFilter ? Number(selectedFilter) : undefined,
        Quantity: quantity,
        StoreId: storeId ?? null,
        SendType: route.params.sendType ?? 1,
        ...(finalCampaignId && { CampaignId: finalCampaignId }),
        IsGift: true,
      };

      // For merchants, use FriendIds array; otherwise use FriendId
      if (isMerchant) {
        // Always use array format for merchants
        if (friendIds) {
          payload.FriendIds = Array.isArray(friendIds) ? friendIds : [friendIds];
        } else if (friendUserId) {
          payload.FriendIds = [friendUserId];
        }
      } else if (friendUserId) {
        payload.FriendId = friendUserId;
      }

      const response = await api.post(apiEndpoints.ADD_TO_CART, payload);
      if (response.success) {
        navigation.goBack();
      } else {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    }
  };

  const handleClearCartAndAddItem = async () => {
    setShowClearCartConfirmation(false);
    setIsVariantChange(false);
    if (submitting) return;

    try {
      setSubmitting(true);

      // Clear the cart first
      const clearResponse = await api.put(apiEndpoints.CLEAR_CART, {});
      if (!clearResponse.success) {
        notify.error(clearResponse.error || getString('AU_ERROR_OCCURRED'));
        setSubmitting(false);
        return;
      }

      // Then add the new item (skip submitting check since we're already managing it)
      await performAddToCart(true);
      setSubmitting(false);
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      setSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    if (submitting) return;

    // Check if we're in GiftOneGetOne flow and cart has items
    if (isGiftOneGetOne && cartApi.data) {
      const cartItems = cartApi.data.Items || [];
      const hasCartItems = cartItems.length > 0;

      if (hasCartItems) {
        // Check if the current item is in cart
        const currentItemInCart = cartItems.find(
          cartItem => cartItem.ItemId === item?.ItemId,
        );

        if (currentItemInCart) {
          // Item is in cart, check if it's a different variant
          const selectedVariantId = selectedFilter ? Number(selectedFilter) : null;
          const cartVariantId = currentItemInCart.Variant?.ItemVariantId || null;

          // If variants are different, show confirmation
          if (selectedVariantId !== cartVariantId) {
            setIsVariantChange(true);
            setShowClearCartConfirmation(true);
            return;
          }
          // Same item and same variant - proceed normally (will update quantity)
        } else {
          // Different item in cart, show confirmation
          setIsVariantChange(false);
          setShowClearCartConfirmation(true);
          return;
        }
      }
    }

    // Proceed with normal add to cart flow
    try {
      setSubmitting(true);
      await performAddToCart(true);
      setSubmitting(false);
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      setSubmitting(false);
    }
  };

  // Updated price calculation to use FinalPrice directly
  const { originalPrice, finalPrice, discountAmount, hasDiscount } = useMemo(() => {
    if (!itemApi.data)
      return {
        originalPrice: 0,
        finalPrice: 0,
        discountAmount: 0,
        hasDiscount: false
      };

    const selectedVariant = selectedFilter
      ? itemApi.data.Variants?.find(
        (v: any) => v.ItemVariantId === Number(selectedFilter),
      )
      : itemApi.data.Variants?.find((v: any) => v.IsDefault);

    // Get values from the selected variant or fallback to item level
    const originalPrice = selectedVariant ? selectedVariant.Price : itemApi.data.Price;
    const finalPrice = selectedVariant ? selectedVariant.FinalPrice : itemApi.data.FinalPrice;
    const discountAmount = selectedVariant ? selectedVariant.DiscountedPrice : itemApi.data.DiscountedPrice;

    // Check if there's a discount (FinalPrice is less than original Price)
    const hasDiscount = finalPrice < originalPrice;

    return {
      originalPrice: originalPrice ?? 0,
      finalPrice: finalPrice ?? 0,
      discountAmount: discountAmount ?? 0,
      hasDiscount,
    };
  }, [itemApi.data, selectedFilter]);

  const isItemInCart = useMemo(() => {
    if (!cartApi.data || !item) return false;
    if (!isMerchant && !isGiftOneGetOne) return false;

    const cartItems = cartApi.data.Items || [];
    const selectedVariantId = selectedFilter ? Number(selectedFilter) : null;

    return cartItems.some((cartItem: any) => {
      const matchesItemId = cartItem.ItemId === item.ItemId;
      const matchesVariantId = selectedVariantId
        ? cartItem.Variant?.ItemVariantId === selectedVariantId
        : !cartItem.Variant?.ItemVariantId;

      return matchesItemId && matchesVariantId;
    });
  }, [isMerchant, isGiftOneGetOne, cartApi.data, item, selectedFilter]);

  // Calculate savings amount
  const savingsAmount = useMemo(() => {
    return hasDiscount ? originalPrice - finalPrice : 0;
  }, [hasDiscount, originalPrice, finalPrice]);

  return (
    <ParentView edges={['bottom']}>
      <View style={styles.sliderWrapper}>
        <ProductImageSlider
          loading={loading}
          sliders={productImages}
          contentContainerStyle={styles.sliderContent}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          top: 68,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: sizes.PADDING,
          alignItems: 'center',
          zIndex: 10,
          width: '100%',
        }}
      >
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.backContainer}
        >
          <SvgHomeBack style={{ transform: rtlTransform(isRtl) }} />
        </TouchableOpacity>
        {!isMerchant && (
          <TouchableOpacity
            style={styles.rounded_white_background}
            onPress={() => handleFavorite()}
          >
            {item?.isFavourite ? (
              <SvgItemFavouriteIcon
                width={scaleWithMax(14, 16)}
                height={scaleWithMax(14, 16)}
              />
            ) : (
              <SvgItemFavouriteIconInActive
                width={scaleWithMax(14, 16)}
                height={scaleWithMax(14, 16)}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: sizes.PADDING,
              paddingBottom: sizes.HEIGHT * 0.15,
            }}
          >
            <View>
              <SkeletonLoader screenType="productDetails" />
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          style={{ ...styles.container }}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.LowerContainer}>
            <View style={styles.ProductTitleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.ProductTitle}>
                  {isRtl ? item?.NameAr : item?.NameEn}
                </Text>
                <View style={styles.priceContainer}>
                  {/* Final Price - Current price after discount */}
                  {hasDiscount && (
                    <>
                      <SvgRiyalPink
                        width={scaleWithMax(15, 18)}
                        height={scaleWithMax(15, 18)}
                        style={{
                          marginTop: 3.5,
                        }}
                      />
                      <Text style={styles.discountedPrice}>
                        {finalPrice}
                      </Text>
                    </>
                  )}

                  {/* Original Price - Strikethrough when discounted */}
                  <SvgRiyalIcon
                    width={hasDiscount ? scaleWithMax(11, 13) : scaleWithMax(15, 18)}
                    height={hasDiscount ? scaleWithMax(11, 13) : scaleWithMax(15, 18)}
                    opacity={hasDiscount ? 0.32 : 1}
                    style={{
                      marginTop: 3.5,
                    }}
                  />
                  <Text style={hasDiscount ? styles.cutPrice : styles.price}>
                    {originalPrice}
                  </Text>


                </View>
              </View>
              <Text style={styles.TaxIncludeText}>
                {getString('PRODUCT_ALL_PRICE_INCLUDE_TAX')}
              </Text>
            </View>

            <View style={styles.ProductDescriptionContainer}>
              <Text style={styles.Heading}>
                {getString('PRODUCT_DESCRIPTION')}
              </Text>
              <Text style={styles.Description}>
                {isRtl ? item?.DescAr : item?.DescEn}
              </Text>
            </View>
            {item?.Variants?.length > 1 && (
              <>
                <View style={styles.tabsContainer}>
                  <Text style={styles.Heading}>
                    {getString('PRODUCT_VARIANTS')}
                  </Text>
                  <GroupTabs
                    tabs={filterOptions}
                    activeTab={selectedFilter}
                    onTabPress={setSelectedFilter}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Bottom Action Bar */}
      <View
        style={{
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          position: 'absolute',
          bottom: scaleWithMax(3, 4),
          left: 0,
          right: 0,
          ...theme.globalStyles.SHADOW_STYLE_STORE_CARD,
        }}
      >
        <View
          style={{
            ...styles.spaceBetween,
            gap: sizes.WIDTH * 0.045,
            backgroundColor: theme.colors.WHITE,
            paddingHorizontal: sizes.PADDING,
            paddingVertical: sizes.HEIGHT * 0.028,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          {!isMerchant && !isGiftOneGetOne && (
            <View style={styles.QuantityContainer}>
              <MinusIcon
                width={scaleWithMax(25, 28)}
                height={scaleWithMax(25, 28)}
                onPress={() => handleQuantityChange('decrement')}
              />
              <Text style={styles.QuantityText}>{quantity}</Text>
              <PlusIcon
                width={scaleWithMax(25, 28)}
                height={scaleWithMax(25, 28)}
                onPress={() => handleQuantityChange('increment')}
              />
            </View>
          )}

          <CustomButton
            buttonStyle={styles.button}
            onPress={() => {
              if (isItemInCart) {
                (navigation as any).navigate('CheckOut');
              } else {
                handleAddToCart();
              }
            }}
            title={
              isItemInCart
                ? getString('PRODUCT_VIEW_CART')
                : getString('PRODUCT_ADD_TO_CART')
            }
            disabled={submitting}
          />
        </View>
      </View>

      <ConfirmationPopup
        visible={showClearCartConfirmation}
        message={
          isVariantChange
            ? getString('PRODUCT_CLEAR_CART_VARIANT_MESSAGE')
            : getString('PRODUCT_CLEAR_CART_MESSAGE')
        }
        confirmText={getString('PRODUCT_CONFIRM')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={handleClearCartAndAddItem}
        onCancel={() => {
          setShowClearCartConfirmation(false);
          setIsVariantChange(false);
        }}
        loading={submitting}
      />
    </ParentView>
  );
};

export default ProductDetails;