import React, { useEffect, useState } from 'react';
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
import { StoreProduct, FaveItems } from '../../../types/index.ts';
import api from '../../../utils/api.ts';

const StoreProducts: React.FC<AppStackScreen<'StoreProducts'>> = ({
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const navigation = useNavigation();
  const store = route.params?.store;
  const friendUserId = route.params?.friendUserId ?? null;
  const storeBranchId = route.params?.storeBranchId ?? null;
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

  const filterOptions = [
    { id: 'all', title: getString('FAV_ALL') },
    { id: 'bouquet', title: getString('FAV_BOUQUET') },
    { id: 'roses', title: getString('FAV_ROSES') },
    { id: 'flowers', title: getString('FAV_FLOWERS') },
    { id: 'cake', title: getString('FAV_CAKE') },
  ];

  const getStoreProducts = useGetApi<StoreProduct[]>(
    apiEndpoints.GET_STORE_DETAIL(store?.id),
    {
      transformData: (data: any) => data.Data.Items || [],
    },
  );

  // Initialize favorite states from API data
  useEffect(() => {
    if (getStoreProducts.data) {
      const initialState: Record<number, boolean> = {};
      getStoreProducts.data.forEach(item => {
        initialState[item.ItemId] = item.IsFavorite ?? false;
      });
      setFavoriteStates(initialState);
    }
  }, [getStoreProducts.data]);

  const handleProductPress = (item: StoreProduct | FaveItems) => {
    if ('ItemId' in item && 'Thumbnail' in item) {
      const product = item as StoreProduct;
      (navigation as any).navigate('ProductDetails', {
        itemId: product.ItemId,
        storeBranchId: product.StoreBranchId ?? storeBranchId,
        friendUserId,
      });
    } else {
      (navigation as any).navigate('ProductDetails', {
        itemId: (item as any)?.ItemId ?? 0,
        storeBranchId: (item as any)?.StoreBranchId ?? storeBranchId ?? null,
        friendUserId,
      });
    }
  };

  const handleFavoritePress = async (payload: {
    ItemId: number;
    IsFavorite: boolean;
  }) => {
    // Optimistically update the specific item's favorite state
    setFavoriteStates(prev => ({
      ...prev,
      [payload.ItemId]: payload.IsFavorite,
    }));
    try {
      const res = await api.post<any>(
        apiEndpoints.HANDLE_FAVORITE_ITEM,
        payload,
      );
      if (res.data.success) {
      }
    } catch (error) {
      // Revert the state change on error
      setFavoriteStates(prev => ({
        ...prev,
        [payload.ItemId]: !payload.IsFavorite,
      }));
    }
  };

  const filteredProducts =
    getStoreProducts.data?.filter(product => {
      if (selectedFilter === 'all') return true;
      return true;
    }) || [];

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
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text>{getString('EMPTY_NO_PRODUCTS_FOUND')}</Text>
            }
            renderItem={({ item }) => (
              <FavoriteProductCard
                item={item}
                onPress={handleProductPress}
                isFavorite={
                  favoriteStates[item.ItemId] ?? item.IsFavorite ?? false
                }
                onFavoritePress={() => {
                  handleFavoritePress({
                    ItemId: item.ItemId,
                    IsFavorite: !(
                      favoriteStates[item.ItemId] ??
                      item.IsFavorite ??
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
