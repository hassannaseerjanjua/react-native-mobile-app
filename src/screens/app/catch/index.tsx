import React, { useEffect, useMemo, useState } from 'react';
import {
  StatusBar,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import { AppStackScreen } from '../../../types/navigation.types';
import { useLocaleStore } from '../../../store/reducer/locale';
import GroupTabs from '../../../components/send-a-gift/GroupTabs';
import CatchProductCard from '../../../components/app/CatchProductCard';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard';
import useGetApi from '../../../hooks/useGetApi';
import apiEndpoints from '../../../constants/api-endpoints';
import {
  FaveItems,
  CatchItem,
  CatchItemsApiResponse,
  Category,
  StoreProduct,
  CartResponse,
} from '../../../types';
import SkeletonLoader from '../../../components/SkeletonLoader';
import api from '../../../utils/api';
import notify from '../../../utils/notify';
import { Text } from '../../../utils/elements';
import { useListingApi } from '../../../hooks/useListingApi';
import { GiftPlacedSvg, SvgRiyalIconWhite } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import GiftOneGetOneProductCard from '../../../components/app/GiftOneGetOneProductCard';
import SuccessMessage from '../../../components/global/SuccessComponent';

const CatchScreen: React.FC<AppStackScreen<'CatchScreen'>> = ({
  navigation,
  route,
}) => {
  const { styles, theme } = useStyles();
  const [openModal, setOpenModal] = useState(false);
  const { getString, isRtl, langCode } = useLocaleStore();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const screenType = route.params?.type || 'catch';
  const storeID = route.params?.storeID;
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const friendUserId = route.params?.friendUserId ?? null;
  const categoriesApi = useGetApi<Category[]>(apiEndpoints.GET_CATEGORIES(15), {
    transformData: (data: any) => data.Data?.Items || [],
  });

  const getFavoriteItems = useListingApi<FaveItems>(
    route.params?.type === 'favorite' ? apiEndpoints.GET_FAV_STORE_ITEMS : '',
    '',
    {
      transformData: (data: any) => {
        return {
          data: data.Data?.Items || [],
          totalCount: data.Data?.TotalCount || 0,
        };
      },
      extraParams: storeID ? { StoreId: storeID } : {},
      idExtractor: (item: FaveItems) => item.ItemId,
    },
  );

  const getCatchItems = useListingApi<CatchItem>(
    route.params?.type === 'catch' ? apiEndpoints.GET_CATCH_ITEMS : '',
    '',
    {
      transformData: (data: CatchItemsApiResponse) => {
        return {
          data: data.Data?.Items || [],
          totalCount: data.Data?.TotalCount || 0,
        };
      },
      idExtractor: (item: CatchItem) => `${item.CampaignId}-${item.ItemId}`,
    },
  );
  const getStoreProducts = useListingApi<StoreProduct>(
    route.params?.type === 'GiftOneGetOne' ? apiEndpoints.GET_CATCH_ITEMS : '',
    '',
    {
      transformData: (data: any) => {
        return {
          data: data.Data?.Items || [],
          totalCount: data.Data?.TotalCount || 0,
        };
      },
      extraParams: { campaingType: 3 },
      idExtractor: (item: StoreProduct) => item.ItemId,
    },
  );
  const cartApi = useGetApi<CartResponse>(
    screenType === 'GiftOneGetOne' ? apiEndpoints.GET_CART_ITEMS : '',
    {
      transformData: (data: any) => (data?.Data || data) as CartResponse,
    },
  );
  useEffect(() => {
    if (route.params.type !== 'GiftOneGetOne') return;
    const unsubscribe = navigation.addListener('focus', () => {
      cartApi.refetch();
    });
    return unsubscribe;
  }, [navigation, cartApi.refetch]);

  useEffect(() => {
    const initializeFavoriteStates = (
      items: Array<{ ItemId: number; isFavourite?: boolean }>,
      defaultFavorite: boolean = false,
    ) => {
      const initialState: Record<number, boolean> = {};
      items.forEach(item => {
        initialState[item.ItemId] = item.isFavourite ?? defaultFavorite;
      });
      setFavoriteStates(initialState);
    };

    if (screenType === 'GiftOneGetOne' && getStoreProducts.data) {
      initializeFavoriteStates(getStoreProducts.data, false);
    } else if (screenType === 'favorite' && getFavoriteItems.data) {
      initializeFavoriteStates(getFavoriteItems.data, true);
    }
  }, [screenType, getStoreProducts.data, getFavoriteItems.data]);

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

  const transformedCatchItems = useMemo(() => {
    if (!getCatchItems.data) return [];
    return getCatchItems.data.map((item: CatchItem) => ({
      id: `${item.CampaignId}-${item.ItemId}`,
      title: isRtl ? item.ItemNameAr : item.ItemNameEn,
      subTitle2: isRtl ? item.CategoryNameAr : item.CategoryNameEn,
      coverImage:
        item.ItemImage && item.ItemImage.trim()
          ? { uri: item.ItemImage }
          : require('../../../assets/images/img-placeholder.png'),
      price: item.ItemPrice,
      discountedPrice: item.DiscountedPrice || 0,
      isGift: false,
      subtitle: isRtl ? item.StoreNameAr : item.StoreNameEn,
      catchItem: item,
    }));
  }, [getCatchItems.data, isRtl]);

  const filteredItems = useMemo(() => {
    if (screenType === 'favorite') {
      return getFavoriteItems.data || [];
    } else if (screenType === 'GiftOneGetOne') {
      return getStoreProducts.data || [];
    } else {
      return transformedCatchItems;
    }
  }, [
    screenType,
    getFavoriteItems.data,
    transformedCatchItems,
    getStoreProducts.data,
  ]);

  const listingApi = useMemo(() => {
    if (screenType === 'favorite') return getFavoriteItems;
    if (screenType === 'GiftOneGetOne') return getStoreProducts;
    if (screenType === 'catch') return getCatchItems;
    return null;
  }, [screenType, getFavoriteItems, getStoreProducts, getCatchItems]);

  const searchValue = listingApi?.search || '';

  const handleSearchChange = (text: string) => {
    if (listingApi) {
      listingApi.setSearch(text);
    }
  };

  const _handleCatchPress = async (item: CatchItem) => {
    const itemKey = `${item.CampaignId}-${item.ItemId}`;
    if (loadingItems[itemKey]) return;

    setLoadingItems(prev => ({ ...prev, [itemKey]: true }));

    try {
      const res = await api.post<{
        Data: {
          Message: string;
          OrderId: number;
          OrderItemId: number;
          Success: boolean;
        };
      }>(apiEndpoints.ADD_TO_CART, {
        FriendId: friendUserId,
        ItemId: item.ItemId,
        ItemVariantId: item.ItemVariantId,
        StoreId: item.StoreId,
        SendType: 1,
        CampaignId: item.CampaignId,
        IsGift: false,
      });
      if (res.success) {
        const payload = {
          orderid: res.data?.Data.OrderId,
          orderPaymentType: 1,
          IsRedeem: false,
        };
        const response = await api.post<any>(
          apiEndpoints.INITIATE_CHECKOUT,
          payload,
        );
        if (response.success) {
          setOpenModal(true);
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      } else {
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } finally {
      setLoadingItems(prev => ({ ...prev, [itemKey]: false }));
    }
  };
  const handleProductPress = (item: any) => {
    if (screenType === 'favorite') {
      const favItem = item as FaveItems;
      navigation.navigate('ProductDetails', {
        itemId: favItem.ItemId,
        friendUserId: friendUserId ?? undefined,
      });
    } else if (screenType === 'GiftOneGetOne') {
      const product = item as StoreProduct | CatchItem;
      (navigation as any).navigate('ProductDetails', {
        itemId: product.ItemId ?? 0,
        storeId: product.StoreId ?? null,
        friendUserId,
        type: 'GiftOneGetOne',
        campaignId: (product as CatchItem).CampaignId,
      });
    }
  };

  const handleFavoritePress = async (payload: {
    ItemId: number;
    IsFavorite: boolean;
  }) => {
    setFavoriteStates(prev => ({
      ...prev,
      [payload.ItemId]: payload.IsFavorite,
    }));

    const revertFavorite = () => {
      setFavoriteStates(prev => ({
        ...prev,
        [payload.ItemId]: !payload.IsFavorite,
      }));
    };

    try {
      const res = await api.post<any>(
        apiEndpoints.HANDLE_FAVORITE_ITEM,
        payload,
      );
      if (!res.success) {
        revertFavorite();
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      revertFavorite();
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  const getFavoriteState = (item: any): boolean => {
    return favoriteStates[item.ItemId] ?? item.isFavourite ?? true;
  };

  const createFavoritePressHandler = (item: any) => () => {
    handleFavoritePress({
      ItemId: item.ItemId,
      IsFavorite: !getFavoriteState(item),
    });
  };

  const isLoading = () => {
    return listingApi?.loading || false;
  };

  const getItemKey = (item: any): string => {
    if (screenType === 'favorite' || screenType === 'GiftOneGetOne') {
      return item.ItemId.toString();
    }
    return item.id || `${item.catchItem?.CampaignId}-${item.catchItem?.ItemId}`;
  };
  const catchIcon = require('../../../assets/images/catch-Group-Icon.png');
  if (openModal) {
    return (
      <SuccessMessage
        SuccessLogo={<Image source={catchIcon} style={styles.catchIcon} />} SuccessMessage={getString('CATCH_SUCCESS_MESSAGE')}
        SuccessSubMessage={getString('CATCH_SUCCESS_SUB_MESSAGE')}
        primaryButtonTitle={getString('HOME_INBOX')}
        onPrimaryPress={() => {
          setOpenModal(false);
          if (screenType === 'catch') {
            getCatchItems.recall();
          }
          navigation.navigate('InboxOutbox', {
            title: getString('HOME_INBOX'),
            isInbox: true,
          });
        }}
        secondaryButtonTitle="Continue"
        onSecondaryPress={() => {
          setOpenModal(false);
          if (screenType === 'catch') {
            getCatchItems.recall();
          }
        }}
      />
    );
  }

  return (
    <ParentView>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={
          screenType === 'favorite'
            ? getString('FAV_FAVORITES')
            : screenType === 'GiftOneGetOne'
              ? getString('HOME_GIFT_ONE_GET_ONE')
              : getString('HOME_CATCH')
        }
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearchBar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={getString('HOME_SEARCH')}
      />

      <View style={styles.listWrapper}>
        <View style={styles.tabsContainer}>
          {categoriesApi.loading ? (
            <SkeletonLoader screenType="groupTabs" />
          ) : (
            <GroupTabs
              tabs={filterOptions}
              activeTab={selectedFilter}
              onTabPress={id => {
                setSelectedFilter(id);
                const categoryId = id === 'all' ? null : Number(id);
                if (screenType === 'favorite') {
                  getFavoriteItems.setExtraParams({
                    ...(storeID ? { StoreId: storeID } : {}),
                    categoryId,
                  });
                } else if (screenType === 'GiftOneGetOne') {
                  getStoreProducts.setExtraParams({
                    categoryId,
                    campaingType: 3,
                  });
                } else if (screenType === 'catch') {
                  getCatchItems.setExtraParams({ categoryId });
                }
              }}
            />
          )}
        </View>
        {isLoading() ? (
          <SkeletonLoader screenType="productListing" />
        ) : (
          <FlatList
            data={filteredItems as any}
            numColumns={2}
            keyExtractor={getItemKey}
            columnWrapperStyle={styles.columnWrapper}
            extraData={favoriteStates}
            contentContainerStyle={[
              styles.listContent,
              styles.listContainer,
              screenType === 'GiftOneGetOne' && {
                paddingBottom: theme.sizes.HEIGHT * 0.12,
              },
            ]}
            showsVerticalScrollIndicator={false}
            onEndReached={
              listingApi && listingApi.hasMore ? listingApi.loadMore : undefined
            }
            onEndReachedThreshold={0.5}
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
            ListFooterComponent={
              listingApi && listingApi.loadingMore ? (
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
            renderItem={({ item }) => {
              if (screenType === 'favorite') {
                return (
                  <FavoriteProductCard
                    item={item as FaveItems}
                    onPress={handleProductPress}
                    isFavorite={getFavoriteState(item)}
                    hasFavorite={true}
                    onFavoritePress={createFavoritePressHandler(item)}
                  />
                );
              } else if (screenType === 'GiftOneGetOne') {
                return (
                  <GiftOneGetOneProductCard
                    item={item}
                    onPress={handleProductPress}
                    isFavorite={getFavoriteState(item)}
                    hasFavorite={false}
                    onFavoritePress={createFavoritePressHandler(item)}
                  />
                );
              } else {
                return (
                  <CatchProductCard
                    loading={loadingItems[item.id] || false}
                    item={item}
                    onPress={handleProductPress}
                    onCatchPress={item => {
                      if (item.catchItem) {
                        _handleCatchPress(item.catchItem);
                      }
                    }}
                  />
                );
              }
            }}
          />
        )}
      </View>
      {cartApi.data?.Items && (
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
                {cartApi.data?.Items?.reduce(
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

export default CatchScreen;
