import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import GroupTabs from '../../../components/global/GroupTabs.tsx';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import {
  ShareIcon,
  SvgHomeBack,
  SvgRiyalIconWhite,
  SvgVerifiedIcon,
} from '../../../assets/icons/index.ts';
import { rtlTransform, scaleWithMax } from '../../../utils';
import useGetApi from '../../../hooks/useGetApi.ts';
import { useListingApi } from '../../../hooks/useListingApi.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import { useAuthStore } from '../../../store/reducer/auth';
import {
  StoreProduct,
  FaveItems,
  Category,
  CartResponse,
} from '../../../types/index.ts';
import api from '../../../utils/api.ts';
import notify from '../../../utils/notify';
import ParentView from '../../../components/app/ParentView';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';

const StoreProducts: React.FC<AppStackScreen<'StoreProducts'>> = ({
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, langCode } = useLocaleStore();
  const navigation = useNavigation();

  const { token } = useAuthStore();

  const store = route.params?.store;
  const friendUserId = route.params?.friendUserId ?? null;
  const friendIds = route.params?.FriendIds ?? undefined;
  const friendName = route.params?.friendName ?? null;
  const storeId = route.params?.storeId ?? null;
  const businessTypeId = route.params?.businessTypeId ?? null;
  const sendType = route.params?.sendType ?? null;
  const isSendAGiftFlow = sendType !== null && sendType !== undefined;
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

  const isVerified = store?.isVerified ?? false;

  const [selectedFilter, setSelectedFilter] = useState('all');


  const categoriesApi = useGetApi<Category[]>(
    apiEndpoints.GET_CATEGORIES(businessTypeId, storeId),
    {
      transformData: (data: any) => data.Data.Items || [],
    },
  );

  const getStoreProducts = useListingApi<StoreProduct>(
    isSendAGiftFlow
      ? apiEndpoints.GET_SEND_A_GIFT_ITEMS
      : apiEndpoints.GET_STORE_DETAIL,
    token,
    {
      transformData: (data: any) => {
        return {
          data: data.Data?.Items || [],
          totalCount: data.Data?.TotalCount || 0,
        };
      },
      extraParams: {
        StoreId: storeId,
        status: 1,
        categoryId: null,
      },
      idExtractor: (item: StoreProduct) => item.ItemId,
    },
  );

  const getFavoriteItems = useListingApi<FaveItems>(
    apiEndpoints.GET_FAV_STORE_ITEMS,
    token,
    {
      transformData: (data: any) => {
        return {
          data: data.Data?.Items || [],
          totalCount: data.Data?.TotalCount || 0,
        };
      },
      extraParams: {
        StoreId: storeId,
        userId: friendUserId,
      },
      idExtractor: (item: FaveItems) => item.ItemId,
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
    const favoritesTabTitle =
      friendUserId && friendName ? getString('FAV_FAVORITES') : getString('FAV_FAVORITES');
    const favoritesOption = { id: 'favorites', title: favoritesTabTitle };

    // Only include favorites option if there are favorite items and not in send gift flow
    // Also hide it when coming from send through link flow (sendType === 2)
    const hasFavorites = getFavoriteItems.data && getFavoriteItems.data.length > 0;
    const isLinkFlow = sendType === 2;
    const options = [allOption];

    if (hasFavorites && !isLinkFlow) {
      options.push(favoritesOption);
    }

    if (!categoriesApi.data || categoriesApi.data.length === 0) {
      return options;
    }
    const categoryOptions = categoriesApi.data.map(category => ({
      id: String(category.CategoryId),
      title: langCode === 'ar' ? category.NameAr : category.NameEn,
    }));
    return [...options, ...categoryOptions];
  }, [categoriesApi.data, getFavoriteItems.data, getString, langCode, friendUserId, friendName, isSendAGiftFlow, sendType]);

  useEffect(() => {
    if (getStoreProducts.data && getStoreProducts.data.length > 0) {
      const initialState: Record<number, boolean> = {};
      getStoreProducts.data.forEach(item => {
        initialState[item.ItemId] = item.isFavourite ?? false;
      });
      setFavoriteStates(prev => ({ ...prev, ...initialState }));
    }
  }, [getStoreProducts.data]);

  useEffect(() => {
    if (getFavoriteItems.data && getFavoriteItems.data.length > 0) {
      const initialState: Record<number, boolean> = {};
      getFavoriteItems.data.forEach(item => {
        initialState[item.ItemId] = true; // Favorite items are always favorited
      });
      setFavoriteStates(prev => ({ ...prev, ...initialState }));
    }
  }, [getFavoriteItems.data]);

  const handleProductPress = (item: StoreProduct | FaveItems) => {
    if ('ItemId' in item && 'Thumbnail' in item) {
      const product = item as StoreProduct;
      (navigation as any).navigate('ProductDetails', {
        itemId: product.ItemId,
        storeId: product.StoreId ?? storeId,
        friendUserId,
        FriendIds: friendIds,
        sendType: route.params.sendType,
        campaignId: product?.Campaign?.CampaignId,
      });
    } else {
      (navigation as any).navigate('ProductDetails', {
        itemId: (item as any)?.ItemId ?? 0,
        storeId: (item as any)?.StoreId ?? storeId ?? null,
        friendUserId,
        FriendIds: friendIds,
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

  // Reset to 'all' if favorites tab is selected but there are no favorite items
  useEffect(() => {
    if (
      selectedFilter === 'favorites' &&
      getFavoriteItems.data &&
      getFavoriteItems.data.length === 0 &&
      !getFavoriteItems.loading
    ) {
      setSelectedFilter('all');
    }
  }, [getFavoriteItems.data, getFavoriteItems.loading, selectedFilter]);

  useEffect(() => {
    if (selectedFilter === 'favorites') {
      getFavoriteItems.setExtraParams({
        StoreId: storeId,
        userId: friendUserId,
      });
    } else {
      getStoreProducts.setExtraParams({
        StoreId: storeId,
        status: 1,
        categoryId: selectedFilter === 'all' ? null : Number(selectedFilter),
      });
    }
  }, [selectedFilter, storeId, friendUserId]);

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

  // Get the current listing API based on selected filter
  const currentListingApi = useMemo(() => {
    return selectedFilter === 'favorites' ? getFavoriteItems : getStoreProducts;
  }, [selectedFilter, getFavoriteItems, getStoreProducts]);

  // Get the current data
  const currentData = useMemo(() => {
    return selectedFilter === 'favorites'
      ? getFavoriteItems.data || []
      : getStoreProducts.data || [];
  }, [selectedFilter, getFavoriteItems.data, getStoreProducts.data]);

  // Handle tab press
  const handleTabPress = (id: string) => {
    setSelectedFilter(id);
    if (id === 'favorites') {
      getFavoriteItems.setExtraParams({
        StoreId: storeId,
        userId: friendUserId,
      });
    } else {
      getStoreProducts.setExtraParams({
        StoreId: storeId,
        status: 1,
        categoryId: id === 'all' ? null : Number(id),
      });
    }
  };

  // Render product item
  const renderProductItem = ({ item }: { item: StoreProduct | FaveItems }) => {
    const isFavoriteItem = selectedFilter === 'favorites';
    const isFavorite =
      (isFavoriteItem || favoriteStates[item.ItemId]) ??
      (item as StoreProduct).isFavourite ??
      false;

    return (
      <FavoriteProductCard
        item={item}
        onPress={handleProductPress}
        isFavorite={isFavorite}
        hasFavorite={true}
        onFavoritePress={() => {
          handleFavoritePress({
            ItemId: item.ItemId,
            isFavorite: !isFavorite,
          });
        }}
      />
    );
  };

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
        </View>
        <Image source={storeOverlayImage} style={styles.bottomImage} />
      </View>

      <View style={styles.container}>
        <View style={styles.headingContainer}>

          <View style={styles.verifiedContainer}>
            <Text style={styles.textLarge}>{store?.title}</Text>
            {isVerified && (
              <SvgVerifiedIcon />
            )}
          </View>

          <Text style={styles.textMedium}>{store?.subtitle}</Text>

        </View>
        <StatusBar
          backgroundColor={theme.colors.BACKGROUND}
          barStyle="light-content"
        />

        <View
          style={[
            styles.content,
            {
              paddingBottom: isCartFromCurrentStore
                ? theme.sizes.HEIGHT * 0.13
                : theme.sizes.HEIGHT * 0.086,
            },
          ]}
        >
          {currentListingApi.loading || categoriesApi.loading ? (
            <SkeletonLoader screenType="productListing" />
          ) : (
            <>
              <View style={styles.tabsContainer}>
                <GroupTabs
                  tabs={filterOptions}
                  activeTab={selectedFilter}
                  onTabPress={handleTabPress}
                />
              </View>
              <FlatList
                columnWrapperStyle={{ gap: 16 }}
                data={currentData}
                numColumns={2}
                keyExtractor={item => item.ItemId.toString()}
                extraData={favoriteStates}
                ListEmptyComponent={() => (
                  <View style={{ height: theme.sizes.HEIGHT * 0.5 }}>
                    <PlaceholderLogoText
                      text={getString('EMPTY_NO_PRODUCTS_FOUND')}
                    />
                  </View>
                )}
                contentContainerStyle={[
                  styles.content,
                  isCartFromCurrentStore && {
                    paddingBottom: theme.sizes.HEIGHT * 0.12,
                  },
                ]}
                showsVerticalScrollIndicator={false}
                onEndReached={currentListingApi.loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  currentListingApi.loadingMore ? (
                    <View
                      style={{
                        paddingVertical: theme.sizes.HEIGHT * 0.02,
                        alignItems: 'center',
                      }}
                    >
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.PRIMARY}
                      />
                    </View>
                  ) : null
                }
                renderItem={renderProductItem}
              />
            </>
          )}
        </View>
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
                {cartApi.data?.TotalAmount || '0.00'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ParentView>
  );
};

export default StoreProducts;
