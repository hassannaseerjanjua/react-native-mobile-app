import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import {
  ShareIcon,
  SvgHomeBack,
  SvgRiyalIconWhite,
} from '../../../assets/icons/index.ts';
import { rtlTransform, scaleWithMax } from '../../../utils';
import useGetApi from '../../../hooks/useGetApi.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import {
  StoreProduct,
  FaveItems,
  Category,
  CartResponse,
} from '../../../types/index.ts';
import api from '../../../utils/api.ts';
import notify from '../../../utils/notify';
import ParentView from '../../../components/app/ParentView';

const StoreProducts: React.FC<AppStackScreen<'StoreProducts'>> = ({
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, langCode } = useLocaleStore();
  const navigation = useNavigation();
  const store = route.params?.store;
  const friendUserId = route.params?.friendUserId ?? null;
  const storeId = route.params?.storeId ?? null;
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );
  const storeCoverImage =
    store?.imageCover && store.imageCover.trim()
      ? { uri: store.imageCover }
      : require('../../../assets/images/img-placeholder.png');
  const storeOverlayImage =
    store?.imageLogo && store.imageLogo.trim()
      ? { uri: store.imageLogo }
      : require('../../../assets/images/img-placeholder.png');

  const [selectedFilter, setSelectedFilter] = useState('all');

  const categoriesApi = useGetApi<Category[]>(apiEndpoints.GET_CATEGORIES, {
    transformData: (data: any) => data.Data.Items || [],
  });

  const getStoreProducts = useGetApi<StoreProduct[]>(
    apiEndpoints.GET_STORE_DETAIL + `?StoreId=${storeId}&status=1`,
    {
      transformData: (data: any) => data.Data.Items || [],
    },
  );

  const cartApi = useGetApi<CartResponse>(apiEndpoints.GET_CART_ITEMS, {
    transformData: (data: any) => (data?.Data || data) as CartResponse,
  });
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cartApi.refetch();
    });
    return unsubscribe;
  }, [navigation, cartApi.refetch]);

  const filterOptions = useMemo(() => {
    const allOption = { id: 'all', title: getString('FAV_ALL') };
    if (!categoriesApi.data || categoriesApi.data.length === 0) {
      return [allOption];
    }
    const categoryOptions = categoriesApi.data.map(category => ({
      id: String(category.CategoryId),
      title: langCode === 'ar' ? category.NameAr : category.NameEn,
    }));
    return [allOption, ...categoryOptions];
  }, [categoriesApi.data, getString, langCode]);

  useEffect(() => {
    if (getStoreProducts.data) {
      const initialState: Record<number, boolean> = {};
      getStoreProducts.data.forEach(item => {
        initialState[item.ItemId] = item.isFavourite ?? false;
      });
      setFavoriteStates(initialState);
    }
  }, [getStoreProducts.data]);

  const handleProductPress = (item: StoreProduct | FaveItems) => {
    if ('ItemId' in item && 'Thumbnail' in item) {
      const product = item as StoreProduct;
      (navigation as any).navigate('ProductDetails', {
        itemId: product.ItemId,
        storeId: product.StoreId ?? storeId,
        friendUserId,
        sendType: route.params.sendType,
      });
    } else {
      (navigation as any).navigate('ProductDetails', {
        itemId: (item as any)?.ItemId ?? 0,
        storeId: (item as any)?.StoreId ?? storeId ?? null,
        friendUserId,
      });
    }
  };

  const handleFavoritePress = async (payload: {
    ItemId: number;
    isFavorite: boolean;
  }) => {
    setFavoriteStates(prev => ({
      ...prev,
      [payload.ItemId]: payload.isFavorite,
    }));
    try {
      const res = await api.post<any>(
        apiEndpoints.HANDLE_FAVORITE_ITEM,
        payload,
      );
      if (res.success) {
      } else {
        setFavoriteStates(prev => ({
          ...prev,
          [payload.ItemId]: !payload.isFavorite,
        }));
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      setFavoriteStates(prev => ({
        ...prev,
        [payload.ItemId]: !payload.isFavorite,
      }));
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  const filteredProducts = useMemo(() => {
    if (!getStoreProducts.data) return [];
    if (selectedFilter === 'all') return getStoreProducts.data;
    const categoryId = Number(selectedFilter);
    return getStoreProducts.data.filter(
      product => product.CategoryId === categoryId,
    );
  }, [getStoreProducts.data, selectedFilter]);

  const isCartFromCurrentStore = useMemo(() => {
    if (
      !cartApi.data ||
      !cartApi.data.Items ||
      cartApi.data.Items.length === 0
    ) {
      return false;
    }
    const currentStoreId = store?.id || storeId;
    if (!currentStoreId) return false;
    return cartApi.data.StoreId === Number(currentStoreId);
  }, [cartApi.data, store?.id, storeId]);

  return (
    <ParentView edges={['left', 'right']}>
      <View style={{ position: 'relative' }}>
        <Image source={storeCoverImage} style={styles.topImage} />
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
            style={styles.backContainer}
            onPress={() => navigation.goBack()}
          >
            <SvgHomeBack style={{ transform: rtlTransform(isRtl) }} />
          </TouchableOpacity>
          <View style={styles.backContainer}>
            <ShareIcon />
          </View>
        </View>
        <Image source={storeOverlayImage} style={styles.bottomImage} />
      </View>

      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Text style={styles.textLarge}>{store?.title}</Text>
          <Text style={styles.textMedium}>{store?.subtitle}</Text>
        </View>
        <StatusBar
          backgroundColor={theme.colors.BACKGROUND}
          barStyle="light-content"
        />

        <View style={styles.tabsContainer}>
          <GroupTabs
            tabs={filterOptions}
            activeTab={selectedFilter}
            onTabPress={setSelectedFilter}
          />
        </View>

        {getStoreProducts.loading ? (
          <SkeletonLoader screenType="productListing" />
        ) : (
          <FlatList
            columnWrapperStyle={{
              gap: 16,
            }}
            data={filteredProducts}
            numColumns={2}
            keyExtractor={item => item.ItemId.toString()}
            extraData={favoriteStates}
            contentContainerStyle={[
              styles.content,
              isCartFromCurrentStore && {
                paddingBottom: theme.sizes.HEIGHT * 0.12,
              },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: theme.sizes.HEIGHT * 0.5,
                }}
              >
                <Text>{getString('EMPTY_NO_PRODUCTS_FOUND')}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <FavoriteProductCard
                item={item}
                onPress={handleProductPress}
                isFavorite={
                  favoriteStates[item.ItemId] ?? item.isFavourite ?? false
                }
                onFavoritePress={() => {
                  handleFavoritePress({
                    ItemId: item.ItemId,
                    isFavorite: !(
                      favoriteStates[item.ItemId] ??
                      item.isFavourite ??
                      false
                    ),
                  });
                }}
              />
            )}
          />
        )}
      </View>

      {isCartFromCurrentStore && cartApi.data && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => {
              if (!cartApi.data) return;

              const cartData = cartApi.data;

              (navigation as any).navigate('GiftMessage', {
                friendUserId,
                storeBranchId: cartData.StoreBranchId,
              });
            }}
            activeOpacity={0.8}
          >
            <View style={styles.footerQuantityBadge}>
              <Text style={styles.footerQuantityText}>
                {cartApi.data?.Items.reduce(
                  (sum, item) => sum + item.Quantity,
                  0,
                ) || 0}
              </Text>
            </View>
            <Text style={styles.footerButtonText}>View Cart</Text>
            <View style={styles.footerPriceRow}>
              <SvgRiyalIconWhite
                width={scaleWithMax(16, 18)}
                height={scaleWithMax(16, 18)}
              />
              <Text style={styles.footerPriceText}>
                {cartApi.data?.TotalAmount.toFixed(2) || '0.00'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ParentView>
  );
};

export default StoreProducts;
