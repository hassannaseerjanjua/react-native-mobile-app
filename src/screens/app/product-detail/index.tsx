import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import useStyles from './style';
import {
  MinusIcon,
  PlusIcon,
  SvgBackIconProduct,
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
  SvgRiyalIcon,
} from '../../../assets/icons';
import { scaleWithMax, rtlTransform } from '../../../utils';
import ProductImageSlider from '../../../components/global/ProductImageSlider';
import { GroupTabs } from '../../../components/send-a-gift';
import CustomButton from '../../../components/global/Custombutton';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types';
import ParentView from '../../../components/app/ParentView';
import apiEndpoints from '../../../constants/api-endpoints';
import api from '../../../utils/api';
import { useLocaleStore } from '../../../store/reducer/locale';
import notify from '../../../utils/notify';
import useGetApi from '../../../hooks/useGetApi';
import { StoreProduct } from '../../../types';
import { Text } from '../../../utils/elements';

const ProductDetails: React.FC<AppStackScreen<'ProductDetails'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const itemId = route?.params?.itemId;
  const friendUserId = route?.params?.friendUserId ?? null;
  const storeId = route?.params?.storeId ?? null;
  const { sizes } = theme;
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [item, setItem] = useState<any>(null);

  const itemApi = useGetApi<StoreProduct>(
    apiEndpoints.GET_STORE_ITEM_BY_ID(
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
        title: v.NameEn,
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
    console.log('item?.ThumbnailUrl', item?.Thumbnail);
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

  const handleAddToCart = async () => {
    if (submitting) return;

    const selectedVariant = item?.Variants?.find(
      (v: any) => v.ItemVariantId === Number(selectedFilter),
    );
    const isAlreadyInCart = selectedVariant?.IsAddedToCart === true;
    const currentCartQuantity = selectedVariant?.CountInCart || 0;

    const IsGift =
      route.params.type === 'GiftOneGetOne' || route.params.sendType !== 1;

    try {
      setSubmitting(true);

      if (isAlreadyInCart) {
        // Update cart item quantity
        const newQuantity = currentCartQuantity + quantity;
        const payload = {
          ItemId: item.ItemId,
          ItemVariantId: selectedFilter ? Number(selectedFilter) : undefined,
          Quantity: newQuantity,
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
        const payload = {
          FriendId: friendUserId,
          ItemId: item.ItemId,
          ItemVariantId: selectedFilter ? Number(selectedFilter) : undefined,
          Quantity: quantity,
          StoreId: storeId ?? null,
          SendType: route.params.sendType ?? 1,
          ...(route.params.type === 'GiftOneGetOne' && {
            CampaignId: item.CampaignId,
          }),
          IsGift: true,
        };

        const response = await api.post(apiEndpoints.ADD_TO_CART, payload);
        if (response.success) {
          navigation.goBack();
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      }
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    } finally {
      setSubmitting(false);
    }
  };
  const itemPrice = useMemo(() => {
    if (!itemApi.data?.Variants?.length) return itemApi.data?.Price;

    const selectedVariant = selectedFilter
      ? itemApi.data.Variants.find(
          v => v.ItemVariantId === Number(selectedFilter),
        )
      : itemApi.data.Variants.find(v => v.IsDefault);

    return selectedVariant?.FinalPrice ?? 0;
  }, [item, selectedFilter]);

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
          paddingHorizontal: 10,
          alignItems: 'center',
          zIndex: 10,
          width: '100%',
        }}
      >
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.rounded_white_background}
        >
          <SvgBackIconProduct
            width={scaleWithMax(14, 16)}
            height={scaleWithMax(14, 16)}
            style={{ transform: rtlTransform(isRtl) }}
          />
        </TouchableOpacity>
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
      </View>
      {loading ? (
        <View style={{}}>
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
          style={{ ...styles.container, marginBottom: sizes.HEIGHT * 0.025 }}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.LowerContainer}>
            <View style={styles.ProductTitleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.ProductTitle}>{item?.NameEn ?? ''}</Text>
                <View style={styles.priceContainer}>
                  <SvgRiyalIcon
                    width={scaleWithMax(15, 18)}
                    height={scaleWithMax(15, 18)}
                    style={{
                      marginTop: 3.5,
                    }}
                  />
                  <Text style={styles.price}>
                    {itemPrice !== undefined && itemPrice !== null
                      ? String(itemPrice)
                      : ''}
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
              <Text style={styles.Description}>{item?.DescEn ?? ''}</Text>
            </View>
            {item?.Variants?.length > 0 && (
              <View>
                <Text style={styles.Heading}>
                  {getString('PRODUCT_VARIANTS')}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.tabsContainer}>
            <GroupTabs
              tabs={filterOptions}
              activeTab={selectedFilter}
              onTabPress={setSelectedFilter}
            />
          </View>
        </ScrollView>
      )}
      <View
        style={{
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          ...theme.globalStyles.SHADOW_STYLE,
        }}
      >
        <View
          style={{
            ...styles.spaceBetween,
            gap: sizes.WIDTH * 0.045,
            backgroundColor: theme.colors.WHITE,
            paddingHorizontal: sizes.PADDING,
            paddingVertical: sizes.HEIGHT * 0.028,
          }}
        >
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

          <CustomButton
            buttonStyle={styles.button}
            onPress={handleAddToCart}
            title={getString('PRODUCT_ADD_TO_CART')}
            disabled={submitting}
          />
        </View>
      </View>
    </ParentView>
  );
};

export default ProductDetails;
