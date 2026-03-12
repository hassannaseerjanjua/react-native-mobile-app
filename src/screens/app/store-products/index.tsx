import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import {
  View,
  StatusBar,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from '../../../utils/elements';
import useStyles from './style.ts';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
import { patchCacheItems } from '../../../utils/api-cache';
import notify from '../../../utils/notify';
import ParentView from '../../../components/app/ParentView';
import ShadowView from '../../../components/global/ShadowView';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';
import PriceWithIcon from '../../../components/global/Price';

const StoreProducts: React.FC<AppStackScreen<'StoreProducts'>> = ({
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, langCode } = useLocaleStore();
  const navigation = useNavigation();

  const { token, user } = useAuthStore();
  const isMerchant = user?.isMerchant === 1;

  const store = route.params?.store;
  const friendUserId = route.params?.friendUserId ?? null;
  const friendIds = route.params?.FriendIds ?? undefined;
  const friendName = route.params?.friendName ?? null;
  const storeId = route.params?.storeId ?? null;
  const businessTypeId = route.params?.businessTypeId ?? null;
  const sendType = route.params?.sendType ?? null;
  const addToFavorites = route.params?.addToFavorites ?? false;
  const isSendAGiftFlow = sendType !== null && sendType !== undefined;

  const effectiveFriendUserId =
    friendUserId ||
    (Array.isArray(friendIds) && friendIds.length === 1 ? friendIds[0] : null);
  const isMultipleUsers = Array.isArray(friendIds) && friendIds.length > 1;

  const [userToggleOverrides, setUserToggleOverrides] = useState<
    Record<number, boolean>
  >({});
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categoriesApi = useGetApi<Category[]>(
    apiEndpoints.GET_CATEGORIES(businessTypeId, storeId),
    {
      transformData: (data: any) => data.Data.Items || [],
    },
  );

  const getStoreProducts = useListingApi<StoreProduct>(
    apiEndpoints.GET_SEND_A_GIFT_ITEMS,

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
        userId: effectiveFriendUserId,
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
      friendUserId && friendName
        ? getString('FAV_FAVORITES')
        : getString('FAV_FAVORITES');
    const favoritesOption = { id: 'favorites', title: favoritesTabTitle };

    // Only include favorites option if there are favorite items and not in send gift flow
    // Also hide it when coming from send through link flow (sendType === 2) or add-to-favorites flow
    const hasFavorites =
      getFavoriteItems.data && getFavoriteItems.data.length > 0;
    const isLinkFlow = sendType === 2;
    const options = [allOption];

    if (hasFavorites && !isLinkFlow && !isMultipleUsers && !addToFavorites) {
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
  }, [
    categoriesApi.data,
    getFavoriteItems.data,
    getString,
    langCode,
    friendUserId,
    friendName,
    isSendAGiftFlow,
    sendType,
    addToFavorites,
  ]);

  const handleProductPress = (item: StoreProduct | FaveItems) => {
    const productItem = item as any;
    const itemCampaignId =
      productItem?.Campaign?.CampaignId || productItem?.CampaignId;

    (navigation as any).navigate('ProductDetails', {
      itemId: productItem?.ItemId ?? 0,
      storeId: productItem?.StoreId ?? storeId ?? null,
      friendUserId,
      FriendIds: friendIds,
      sendType: route.params?.sendType,
      campaignId: itemCampaignId,
      addToFavorites,
    });
  };

  const handleFavoritePress = async (payload: {
    ItemId: number;
    isFavorite: boolean;
  }) => {
    // Optimistically update local override and patch the cache so the next
    // visit shows the correct state before the fresh API response arrives.
    setUserToggleOverrides(prev => ({
      ...prev,
      [payload.ItemId]: payload.isFavorite,
    }));
    patchCacheItems<{ ItemId: number; isFavourite: boolean }>(
      'listing:',
      item => item.ItemId === payload.ItemId,
      { isFavourite: payload.isFavorite },
    );
    try {
      const res = await api.post<any>(
        apiEndpoints.HANDLE_FAVORITE_ITEM,
        payload,
      );
      if (!res.success) {
        // Revert both the local override and the cache patch on failure.
        setUserToggleOverrides(prev => ({
          ...prev,
          [payload.ItemId]: !payload.isFavorite,
        }));
        patchCacheItems<{ ItemId: number; isFavourite: boolean }>(
          'listing:',
          item => item.ItemId === payload.ItemId,
          { isFavourite: !payload.isFavorite },
        );
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      setUserToggleOverrides(prev => ({
        ...prev,
        [payload.ItemId]: !payload.isFavorite,
      }));
      patchCacheItems<{ ItemId: number; isFavourite: boolean }>(
        'listing:',
        item => item.ItemId === payload.ItemId,
        { isFavourite: !payload.isFavorite },
      );
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  // When returning from ProductDetails, reload listing so favorite state is reflected
  // (user may have favorited/unfavorited via Add to Favorites button or heart icon)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      getStoreProducts.recall();
      getFavoriteItems.recall();
    }, [getStoreProducts, getFavoriteItems]),
  );

  // Sync userToggleOverrides with fresh server data when it arrives.
  // userToggleOverrides holds optimistic updates from the listing; when the user
  // unfavorites from ProductDetails and we recall, we must overwrite stale overrides.
  useEffect(() => {
    const products = getStoreProducts.data || [];
    const favorites = getFavoriteItems.data || [];
    const itemsToSync: (StoreProduct | FaveItems)[] = [...products];
    favorites.forEach(f => {
      if (!itemsToSync.some(p => p.ItemId === f.ItemId)) {
        itemsToSync.push(f);
      }
    });
    if (itemsToSync.length === 0) return;
    setUserToggleOverrides(prev => {
      const next = { ...prev };
      let changed = false;
      itemsToSync.forEach(item => {
        const serverState = item.isFavourite ?? false;
        if (prev[item.ItemId] !== serverState) {
          next[item.ItemId] = serverState;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [getStoreProducts.data, getFavoriteItems.data]);

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
        userId: effectiveFriendUserId,
      });
    } else {
      getStoreProducts.setExtraParams({
        StoreId: storeId,
        status: 1,
        categoryId: selectedFilter === 'all' ? null : Number(selectedFilter),
      });
    }
  }, [selectedFilter, storeId, effectiveFriendUserId]);

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

  useEffect(() => {
    if (isRefreshing && !currentListingApi.loading && !categoriesApi.loading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, currentListingApi.loading, categoriesApi.loading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    currentListingApi.recall();
    categoriesApi.refetch?.();
  };

  // Handle tab press
  const handleTabPress = (id: string) => {
    setSelectedFilter(id);
    if (id === 'favorites') {
      getFavoriteItems.setExtraParams({
        StoreId: storeId,
        userId: effectiveFriendUserId,
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
      userToggleOverrides[item.ItemId] ??
      (isFavoriteItem ? true : (item as StoreProduct).isFavourite ?? false);

    return (
      <FavoriteProductCard
        item={item}
        onPress={handleProductPress}
        isFavorite={isFavorite}
        hasFavorite={!isMerchant}
        onFavoritePress={() => {
          handleFavoritePress({
            ItemId: item.ItemId,
            isFavorite: !isFavorite,
          });
        }}
        isFavoriteTab={isFavoriteItem}
      />
    );
  };

  return (
    <ParentView edges={['left', 'right']} stableLayout={false}>
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
          <ShadowView preset="default">
            <TouchableOpacity
              style={styles.backContainer}
              onPress={() => navigation.goBack()}
            >
              <SvgHomeBack style={{ transform: rtlTransform(isRtl) }} />
            </TouchableOpacity>
          </ShadowView>
        </View>
        <Image source={storeOverlayImage} style={styles.bottomImage} />
      </View>

      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <View style={styles.verifiedContainer}>
            <Text style={styles.textLarge}>{store?.title}</Text>
            {isVerified && <SvgVerifiedIcon />}
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
                ? theme.sizes.HEIGHT * 0.18
                : theme.sizes.HEIGHT * 0.086,
            },
          ]}
        >
          <View>
            {categoriesApi.loading && !isRefreshing ? (
              <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
                <SkeletonLoader screenType="groupTabs" />
              </View>
            ) : (categoriesApi.data &&
                categoriesApi.data.length > 0 &&
                currentListingApi.data &&
                currentListingApi.data.length > 0) ||
              currentListingApi.loading ? (
              <GroupTabs
                tabs={filterOptions}
                activeTab={selectedFilter}
                onTabPress={handleTabPress}
                tabStyle={{ paddingHorizontal: theme.sizes.PADDING }}
              />
            ) : (
              <View style={{ height: theme.sizes.HEIGHT * 0.016 }} />
            )}
          </View>
          {currentListingApi.loading && !isRefreshing ? (
            <SkeletonLoader screenType="productListing" />
          ) : (
            <FlatList
              columnWrapperStyle={{ gap: 16 }}
              data={currentData}
              numColumns={2}
              keyExtractor={item => item.ItemId.toString()}
              extraData={userToggleOverrides}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={theme.colors.PRIMARY}
                  colors={[theme.colors.PRIMARY]}
                />
              }
              ListEmptyComponent={() => {
                if (!currentListingApi.isInitialLoad) return null;
                return (
                  <View style={{ height: theme.sizes.HEIGHT * 0.5 }}>
                    <PlaceholderLogoText
                      text={getString('EMPTY_NO_PRODUCTS_FOUND')}
                    />
                  </View>
                );
              }}
              contentContainerStyle={[
                styles.content,
                {
                  paddingHorizontal: theme.sizes.PADDING,
                  paddingBottom: isCartFromCurrentStore
                    ? theme.sizes.HEIGHT * 0.12
                    : theme.sizes.HEIGHT * 0.086,
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
          )}
        </View>
      </View>

      {isCartFromCurrentStore && cartApi.data && (
        // <ShadowView preset="storeCard">
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
            <Text style={styles.footerButtonText}>
              {getString('VIEW_CART')}
            </Text>
            <PriceWithIcon
              amount={cartApi.data?.TotalAmount || '0.00'}
              textStyle={styles.footerPriceText}
              containerStyle={styles.footerPriceRow}
              icon={
                <SvgRiyalIconWhite
                  width={scaleWithMax(12, 14)}
                  height={scaleWithMax(12, 14)}
                />
              }
              iconSize={scaleWithMax(12, 14)}
              iconPosition="end"
              iconOnLeftInRtl
            />
          </TouchableOpacity>
        </View>
        // </ShadowView>
      )}
    </ParentView>
  );
};

export default StoreProducts;
