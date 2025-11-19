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
  SvgBackIcon,
  SvgHomeBack,
} from '../../../assets/icons/index.ts';
import { rtlTransform, rtlFlexDirection } from '../../../utils';
import useGetApi from '../../../hooks/useGetApi.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import { StoreProduct, FaveItems, Category } from '../../../types/index.ts';
import api from '../../../utils/api.ts';
import notify from '../../../utils/notify';

const StoreProducts: React.FC<AppStackScreen<'StoreProducts'>> = ({
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, langCode } = useLocaleStore();
  const navigation = useNavigation();
  const store = route.params?.store;
  const friendUserId = route.params?.friendUserId ?? null;
  const storeId = route.params?.storeId ?? null;
  // Track favorite state for each item by ItemId
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );
  const storeCoverImage = store?.imageCover
    ? { uri: store.imageCover }
    : require('../../../assets/images/img-placeholder.png');
  const storeOverlayImage = store?.imageLogo
    ? { uri: store.imageLogo }
    : require('../../../assets/images/img-placeholder.png');

  const [selectedFilter, setSelectedFilter] = useState('all');

  const categoriesApi = useGetApi<Category[]>(apiEndpoints.GET_CATEGORIES, {
    transformData: (data: any) => data.Data.Items || [],
  });

  const getStoreProducts = useGetApi<StoreProduct[]>(
    apiEndpoints.GET_STORE_DETAIL(store?.id),
    {
      transformData: (data: any) => data.Data.Items || [],
    },
  );

  // Create filter options from categories
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

  // Initialize favorite states from API data
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
    // Optimistically update the specific item's favorite state
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
        // Revert the state change on error
        setFavoriteStates(prev => ({
          ...prev,
          [payload.ItemId]: !payload.isFavorite,
        }));
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      // Revert the state change on error
      setFavoriteStates(prev => ({
        ...prev,
        [payload.ItemId]: !payload.isFavorite,
      }));
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (!getStoreProducts.data) return [];
    if (selectedFilter === 'all') return getStoreProducts.data;
    const categoryId = Number(selectedFilter);
    return getStoreProducts.data.filter(
      product => product.CategoryId === categoryId,
    );
  }, [getStoreProducts.data, selectedFilter]);

  return (
    <View style={{ flex: 1 }}>
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
            contentContainerStyle={styles.content}
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
    </View>
  );
};

export default StoreProducts;
