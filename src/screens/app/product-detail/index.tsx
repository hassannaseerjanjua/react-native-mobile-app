import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import useStyles from './style';
import {
  MinusIcon,
  PlusIcon,
  SvgBackIcon,
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
  SvgRiyalIcon,
} from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
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

const ProductDetails: React.FC<AppStackScreen<'ProductDetails'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const itemId = route?.params?.itemId;
  const friendUserId = route?.params?.friendUserId ?? null;
  const storeId = route?.params?.storeId ?? null;
  const { sizes } = theme;
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [item, setItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [itemAddedToCart, setItemAddedToCart] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.get<any>(
          apiEndpoints.GET_STORE_ITEM_BY_ID(itemId),
        );
        if (mounted) {
          if (res.success) {
            const data = (res.data as any)?.Data ?? null;
            setItem(data);
            // default selected variant
            const firstVariantId = data?.Variants?.[0]?.ItemVariantId;
            setSelectedFilter(firstVariantId ? String(firstVariantId) : '');
          } else {
            notify.error(res.error || getString('AU_ERROR_OCCURRED'));
          }
          setLoading(false);
        }
      } catch (error: any) {
        if (mounted) {
          notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
          setLoading(false);
        }
      }
    };
    if (itemId) {
      fetchItem();
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [itemId]);

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
    const imgs = item?.Images?.map((img: any) => ({ uri: img.ImageUrl })) ?? [];
    return imgs;
  }, [item]);

  const handleFavorite = async () => {
    setIsFavorite(prev => !prev);
    try {
      const res = await api.post<any>(apiEndpoints.HANDLE_FAVORITE_ITEM, {
        ItemId: item?.ItemId,
      });
      if (res.success) {
        setIsFavorite(prev => !prev);
      } else {
        setIsFavorite(prev => !prev);
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      setIsFavorite(prev => !prev);
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  const handleAddToCart = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const payload = {
        FriendId: friendUserId ?? null,
        ItemId: item?.ItemId,
        ItemVariantId: selectedFilter ? Number(selectedFilter) : undefined,
        Quantity: quantity,
        StoreId: storeId ?? null,
      };
      const response = await api.post(apiEndpoints.ADD_TO_CART, payload);
      if (response.success) {
        // Mark as added and change button to "Go to Cart"
        setItemAddedToCart(true);
      } else {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToCart = () => {
    navigation.navigate('CheckOut', undefined);
  };

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
          <SvgBackIcon
            style={{
              width: scaleWithMax(15, 18),
              height: scaleWithMax(15, 18),
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rounded_white_background}
          onPress={() => handleFavorite()}
        >
          {isFavorite ? (
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
              // paddingTop: sizes.HEIGHT * 0.02,
              paddingBottom: sizes.HEIGHT * 0.15,
            }}
          >
            <View>
              <SkeletonLoader screenType="sendToGroup" />
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
                    {item?.Price !== undefined && item?.Price !== null
                      ? String(item?.Price)
                      : ''}
                  </Text>
                </View>
              </View>
              {/* <Text style={styles.SubTitle}>{product.subtitle}</Text> */}
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
            <Text style={styles.Heading}>{getString('PRODUCT_VARIANTS')}</Text>
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
          // ...theme.globalStyles.SHADOW_STYLE,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          // backgroundColor: theme.colors.RED,
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
            onPress={itemAddedToCart ? handleGoToCart : handleAddToCart}
            title={
              itemAddedToCart ? 'Go to Cart' : getString('PRODUCT_ADD_TO_CART')
            }
            disabled={submitting}
          />
        </View>
      </View>
    </ParentView>
  );
};

export default ProductDetails;
