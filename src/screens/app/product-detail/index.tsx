import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import useStyles from './style';
import {
  MinusIcon,
  PlusIcon,
  SvgHomeBack,
  SvgRiyalIcon,
  SvgRiyalPink,
} from '../../../assets/icons';
import PriceWithIcon from '../../../components/global/Price';
import {
  formatGroupedInteger,
  scaleWithMax,
  rtlTransform,
  isAndroid,
} from '../../../utils';
import ShadowView from '../../../components/global/ShadowView';
import ProductImageSlider from '../../../components/global/ProductImageSlider';
import GroupTabs from '../../../components/global/GroupTabs';
import CustomButton from '../../../components/global/Custombutton';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types';
import ParentView from '../../../components/app/ParentView';
import apiEndpoints from '../../../constants/api-endpoints';
import api from '../../../utils/api';
import { patchCacheItems } from '../../../utils/api-cache';
import { useLocaleStore } from '../../../store/reducer/locale';
import notify from '../../../utils/notify';
import useGetApi from '../../../hooks/useGetApi';
import { StoreProduct, CartResponse, CartItem } from '../../../types';
import { Text } from '../../../utils/elements';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import { useAuthStore } from '../../../store/reducer/auth';

const ProductDetails: React.FC<AppStackScreen<'ProductDetails'>> = ({
  route,
  navigation,
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
  const [favoriteSubmitting, setFavoriteSubmitting] = useState<boolean>(false);
  const favoriteInProgressRef = React.useRef(false);
  const [item, setItem] = useState<any>(null);
  const sendType = route?.params?.sendType ?? null;
  const isSendAGiftFlow = sendType !== null && sendType !== undefined;
  const campaignId = route?.params?.campaignId ?? null;
  const addToFavorites = route?.params?.addToFavorites ?? false;
  const fromFavorites = route?.params?.fromFavorites ?? false;
  const isFavoritesMode = addToFavorites || fromFavorites;
  const isGiftOneGetOne = route.params?.type === 'GiftOneGetOne';
  const [showClearCartConfirmation, setShowClearCartConfirmation] =
    useState(false);
  const [isVariantChange, setIsVariantChange] = useState(false);
  const [samestoreg1g1, setsamestoreg1g1] = useState(false);

  const cartApi = useGetApi<CartResponse>(apiEndpoints.GET_CART_ITEMS, {
    transformData: (data: any) => (data?.Data || data) as CartResponse,
  });
  const itemApi = useGetApi<StoreProduct>(
    isSendAGiftFlow || isFavoritesMode
      ? apiEndpoints.GET_SEND_A_GIFT_ITEM_BY_ID(itemId, !!campaignId)
      : apiEndpoints.GET_STORE_ITEM_BY_ID(
          itemId,
          route.params?.type === 'GiftOneGetOne',
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

  const selectedVariant = useMemo(() => {
    if (!item?.Variants?.length) return undefined;
    const byId = selectedFilter
      ? item.Variants.find(
          (v: any) => v.ItemVariantId === Number(selectedFilter),
        )
      : undefined;
    return (
      byId ||
      item.Variants.find((v: any) => v.Status === 1 && v.IsDefault === true) ||
      item.Variants.find((v: any) => v.Status === 1)
    );
  }, [item, selectedFilter]);

  const cartLineForSelection = useMemo(() => {
    if (!cartApi.data?.Items || !item) return undefined;
    const vid = selectedVariant?.ItemVariantId ?? null;
    return cartApi.data.Items.find((ci: CartItem) => {
      if (ci.ItemId !== item.ItemId) return false;
      const cartVid = ci.Variant?.ItemVariantId ?? null;
      if (vid != null) return cartVid === vid;
      return cartVid == null;
    });
  }, [cartApi.data, item, selectedVariant?.ItemVariantId]);

  useEffect(() => {
    if (!item) return;
    const fromCart = cartLineForSelection?.Quantity;
    if (fromCart != null && fromCart > 0) {
      setQuantity(fromCart);
      return;
    }
    const inVariant = selectedVariant?.IsAddedToCart === true;
    const count = selectedVariant?.CountInCart;
    if (inVariant && count != null && count > 0) {
      setQuantity(count);
      return;
    }
    setQuantity(1);
  }, [
    item?.ItemId,
    selectedVariant?.ItemVariantId,
    cartLineForSelection?.Quantity,
    selectedVariant?.CountInCart,
    selectedVariant?.IsAddedToCart,
  ]);

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

  const handleFavorite = async (): Promise<boolean> => {
    if (!item) return false;
    if (favoriteInProgressRef.current) return false;
    favoriteInProgressRef.current = true;
    setFavoriteSubmitting(true);
    const previousFavoriteState = item.isFavourite ?? false;
    const newFavoriteState = !previousFavoriteState;
    setItem({ ...item, isFavourite: newFavoriteState });
    try {
      const res = await api.post<any>(apiEndpoints.HANDLE_FAVORITE_ITEM, {
        ItemId: item.ItemId,
        isFavorite: newFavoriteState,
      });
      if (!res.success) {
        setItem({ ...item, isFavourite: previousFavoriteState });
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
        return false;
      }
      patchCacheItems<{ ItemId: number; isFavourite: boolean }>(
        'listing:',
        i => i.ItemId === item.ItemId,
        { isFavourite: newFavoriteState },
      );
      return true;
    } catch (error: any) {
      setItem({ ...item, isFavourite: previousFavoriteState });
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      return false;
    } finally {
      favoriteInProgressRef.current = false;
      setFavoriteSubmitting(false);
    }
  };

  const performAddToCart = async (skipSubmittingCheck = false) => {
    if (!skipSubmittingCheck && submitting) return;

    const variantId =
      selectedVariant?.ItemVariantId ??
      (selectedFilter ? Number(selectedFilter) : undefined);
    const isAlreadyInCart =
      (cartLineForSelection?.Quantity ?? 0) > 0 ||
      selectedVariant?.IsAddedToCart === true;

    if (isAlreadyInCart) {
      const payload = {
        ItemId: item.ItemId,
        ItemVariantId: variantId,
        Quantity: quantity,
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
      const finalCampaignId =
        campaignId || item?.CampaignId || item?.Campaign?.CampaignId;

      const payload: any = {
        ItemId: item.ItemId,
        ItemVariantId: variantId,
        Quantity: quantity,
        StoreId: storeId ?? null,
        SendType: route.params.sendType ?? 1,
        ...(finalCampaignId && { CampaignId: finalCampaignId }),
        IsGift: true,
      };

      if (isMerchant) {
        if (friendIds) {
          payload.FriendIds = Array.isArray(friendIds)
            ? friendIds
            : [friendIds];
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

      const clearResponse = await api.put(apiEndpoints.CLEAR_CART, {});
      if (!clearResponse.success) {
        notify.error(clearResponse.error || getString('AU_ERROR_OCCURRED'));
        setSubmitting(false);
        return;
      }

      await performAddToCart(true);
      setSubmitting(false);
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      setSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    if (submitting) return;

    if (isGiftOneGetOne && cartApi.data) {
      const cartItems = cartApi.data.Items || [];
      const hasCartItems = cartItems.length > 0;

      if (hasCartItems) {
        const currentItemInCart = cartItems.find(
          cartItem => cartItem.ItemId === item?.ItemId,
        );

        if (currentItemInCart) {
          const selectedVariantId = selectedFilter
            ? Number(selectedFilter)
            : null;
          const cartVariantId =
            currentItemInCart.Variant?.ItemVariantId || null;

          if (selectedVariantId !== cartVariantId) {
            setIsVariantChange(true);
            setsamestoreg1g1(false);
            setShowClearCartConfirmation(true);
            return;
          }
        } else {
          const cartStoreId = cartApi.data.StoreId;
          const currentStoreId = item?.StoreId || storeId;
          const isSameStore = cartStoreId === currentStoreId;

          setIsVariantChange(false);
          setsamestoreg1g1(isSameStore);
          setShowClearCartConfirmation(true);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      await performAddToCart(true);
      setSubmitting(false);
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      setSubmitting(false);
    }
  };

  const { originalPrice, finalPrice, discountAmount, hasDiscount } =
    useMemo(() => {
      if (!itemApi.data)
        return {
          originalPrice: 0,
          finalPrice: 0,
          discountAmount: 0,
          hasDiscount: false,
        };

      const selectedVariant = selectedFilter
        ? itemApi.data.Variants?.find(
            (v: any) => v.ItemVariantId === Number(selectedFilter),
          )
        : itemApi.data.Variants?.find((v: any) => v.IsDefault);

      const basePrice = selectedVariant
        ? selectedVariant.Price
        : itemApi.data.Price;
      const feelingFee = selectedVariant ? selectedVariant.FeelingFee : 0;
      const finalPrice = selectedVariant
        ? selectedVariant.FinalPrice
        : itemApi.data.FinalPrice;
      const discountAmount = selectedVariant
        ? selectedVariant.DiscountedPrice
        : itemApi.data.DiscountedPrice;

      const originalPrice = (basePrice ?? 0) + (feelingFee ?? 0);

      const hasDiscount = finalPrice < originalPrice;

      return {
        originalPrice,
        finalPrice: finalPrice ?? 0,
        discountAmount: discountAmount ?? 0,
        hasDiscount,
      };
    }, [itemApi.data, selectedFilter]);

  const isItemInCart = useMemo(() => {
    if (!cartApi.data || !item) return false;

    const cartItems = cartApi.data.Items || [];
    const selectedVariantId = selectedVariant?.ItemVariantId ?? null;

    return cartItems.some((cartItem: any) => {
      const matchesItemId = cartItem.ItemId === item.ItemId;
      const matchesVariantId = selectedVariantId
        ? cartItem.Variant?.ItemVariantId === selectedVariantId
        : !cartItem.Variant?.ItemVariantId;

      return matchesItemId && matchesVariantId;
    });
  }, [cartApi.data, item, selectedVariant?.ItemVariantId]);

  const savingsAmount = useMemo(() => {
    return hasDiscount ? originalPrice - finalPrice : 0;
  }, [hasDiscount, originalPrice, finalPrice]);

  return (
    <ParentView edges={['bottom']} stableLayout={false}>
      <View style={{ flex: 1 }}>
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
          <ShadowView preset="default">
            <TouchableOpacity
              onPress={navigation.goBack}
              style={styles.backContainer}
            >
              <SvgHomeBack style={{ transform: rtlTransform(isRtl) }} />
            </TouchableOpacity>
          </ShadowView>
        </View>

        {loading ? (
          <ScrollView
            style={styles.container}
            contentContainerStyle={{
              paddingHorizontal: sizes.PADDING,
              paddingBottom: sizes.HEIGHT * 0.04,
            }}
          >
            <SkeletonLoader screenType="productDetails" />
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.LowerContainer}>
              <View style={styles.ProductTitleContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.ProductTitle}>
                    {isRtl ? item?.NameAr : item?.NameEn}
                  </Text>
                  <View style={styles.priceContainer}>
                    {hasDiscount && (
                      <PriceWithIcon
                        amount={finalPrice}
                        variant="discounted"
                        bold
                        icon={
                          <SvgRiyalPink
                            width={scaleWithMax(15, 18)}
                            height={scaleWithMax(15, 18)}
                          />
                        }
                        iconSize={scaleWithMax(15, 18)}
                        textStyle={styles.discountedPrice}
                      />
                    )}
                    <PriceWithIcon
                      amount={originalPrice}
                      variant={hasDiscount ? 'cut' : 'default'}
                      bold
                      icon={
                        <SvgRiyalIcon
                          width={
                            hasDiscount
                              ? scaleWithMax(11, 13)
                              : scaleWithMax(15, 18)
                          }
                          height={
                            hasDiscount
                              ? scaleWithMax(11, 13)
                              : scaleWithMax(15, 18)
                          }
                        />
                      }
                      iconSize={
                        hasDiscount
                          ? scaleWithMax(11, 13)
                          : scaleWithMax(15, 18)
                      }
                      iconOpacity={hasDiscount ? 0.32 : 1}
                      textStyle={hasDiscount ? styles.cutPrice : styles.price}
                    />
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
                      tabStyle={{
                        paddingVertical: theme.sizes.HEIGHT * 0.008,
                      }}
                      activeTab={selectedFilter}
                      onTabPress={setSelectedFilter}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        )}

        <ShadowView
          preset="productDetailFooter"
          style={{
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            backgroundColor: theme.colors.WHITE,
          }}
        >
          <View
            style={{
              ...styles.spaceBetween,
              gap: sizes.WIDTH * 0.045,
              backgroundColor: theme.colors.WHITE,
              paddingHorizontal: sizes.PADDING,
              paddingTop: sizes.HEIGHT * 0.016,
              paddingBottom: isAndroid ? sizes.HEIGHT * 0.025 : undefined,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}
          >
            {!isMerchant && !isGiftOneGetOne && !isFavoritesMode && (
              <View style={styles.QuantityContainer}>
                <MinusIcon
                  width={scaleWithMax(25, 28)}
                  height={scaleWithMax(25, 28)}
                  onPress={() => handleQuantityChange('decrement')}
                />
                <Text style={styles.QuantityText}>
                  {formatGroupedInteger(quantity)}
                </Text>
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
                if (isFavoritesMode) {
                  handleFavorite().then(success => {
                    if (success) navigation.goBack();
                  });
                } else if (isGiftOneGetOne && isItemInCart) {
                  (navigation as any).navigate('CheckOut');
                } else {
                  handleAddToCart();
                }
              }}
              title={
                isFavoritesMode
                  ? item?.isFavourite
                    ? getString('PRODUCT_REMOVE_FROM_FAVORITES')
                    : getString('PRODUCT_ADD_TO_FAVORITES')
                  : isGiftOneGetOne && isItemInCart
                  ? getString('PRODUCT_VIEW_CART')
                  : getString('PRODUCT_ADD_TO_CART')
              }
              disabled={submitting || favoriteSubmitting}
            />
          </View>
        </ShadowView>
      </View>

      <ConfirmationPopup
        visible={showClearCartConfirmation}
        message={
          isVariantChange
            ? getString('PRODUCT_CLEAR_CART_VARIANT_MESSAGE')
            : samestoreg1g1
            ? getString('PRODUCT_CLEAR_CART_MESSAGE_SAME')
            : getString('PRODUCT_CLEAR_CART_MESSAGE')
        }
        confirmText={getString('PRODUCT_CONFIRM')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={handleClearCartAndAddItem}
        onCancel={() => {
          setShowClearCartConfirmation(false);
          setIsVariantChange(false);
          setsamestoreg1g1(false);
        }}
        loading={submitting}
      />
    </ParentView>
  );
};

export default ProductDetails;
