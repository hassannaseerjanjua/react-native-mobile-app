import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar, FlatList, View, TouchableOpacity } from 'react-native';
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
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const screenType = route.params?.type || 'catch';
  const storeID = route.params?.storeID;
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const friendUserId = route.params?.friendUserId ?? null;
  const [submitting, setSubmitting] = useState(false);
  const categoriesApi = useGetApi<Category[]>(apiEndpoints.GET_CATEGORIES, {
    transformData: (data: any) => data.Data?.Items || [],
  });

  const getFavoriteItems = useGetApi<FaveItems[]>(
    route.params?.type === 'favorite' && storeID
      ? apiEndpoints.GET_FAV_STORE_ITEMS(storeID)
      : '',
    {
      transformData: (data: any) => data.Data?.Items || [],
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
    if (screenType !== 'GiftOneGetOne') return;
    if (getStoreProducts.data) {
      const initialState: Record<number, boolean> = {};
      getStoreProducts.data.forEach(item => {
        initialState[item.ItemId] = item.isFavourite ?? false;
      });
      setFavoriteStates(initialState);
    }
  }, [getStoreProducts.data]);

  console.log('getCatchItems', getStoreProducts);

  useEffect(() => {
    if (screenType === 'favorite' && getFavoriteItems.data) {
      const initialState: Record<number, boolean> = {};
      getFavoriteItems.data.forEach(item => {
        initialState[item.ItemId] = item.isFavourite ?? true;
      });
      setFavoriteStates(initialState);
    }
  }, [screenType, getFavoriteItems.data]);

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
      subtitle: isRtl ? item.CategoryNameAr : item.CategoryNameEn,
      coverImage:
        item.ItemImage && item.ItemImage.trim()
          ? { uri: item.ItemImage }
          : require('../../../assets/images/img-placeholder.png'),
      category: item.CategoryNameEn?.toLowerCase() || 'all',
      price: item.ItemPrice,
      discountedPrice: item.DiscountedPrice || 0,
      isGift: false,
      subTitle2: isRtl ? item.CategoryNameAr : item.CategoryNameEn,
      catchItem: item,
    }));
  }, [getCatchItems.data, isRtl]);

  const filteredItems = useMemo(() => {
    if (screenType === 'favorite') {
      const items = getFavoriteItems.data || [];
      if (selectedFilter === 'all') {
        return items;
      }
      const categoryId = Number(selectedFilter);
      return items.filter((item: FaveItems) => {
        return item.CategoryId === categoryId;
      });
    } else if (screenType === 'GiftOneGetOne') {
      const items = getStoreProducts.data || [];
      if (selectedFilter === 'all') {
        return items;
      }
      const categoryId = Number(selectedFilter);
      return items.filter((item: StoreProduct) => {
        return item.CategoryId === categoryId;
      });
    } else {
      const items = transformedCatchItems;
      if (selectedFilter === 'all') {
        return items;
      }
      const categoryId = Number(selectedFilter);
      return items.filter(item => {
        return item.catchItem?.CategoryId === categoryId;
      });
    }
  }, [
    selectedFilter,
    screenType,
    getFavoriteItems.data,
    transformedCatchItems,
    getStoreProducts.data,
  ]);

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
    } else if (screenType === 'catch' && item.catchItem) {
      // navigation.navigate('ProductDetails', {
      //   itemId: item.catchItem.ItemId,
      //   friendUserId: friendUserId ?? undefined,
      // });
    } else if (screenType === 'GiftOneGetOne') {
      if ('ItemId' in item && 'Thumbnail' in item) {
        const product = item as CatchItem;
        (navigation as any).navigate('ProductDetails', {
          itemId: product.ItemId,
          storeId: product.StoreId,
          friendUserId,
          type: 'GiftOneGetOne',
          campaignId: product.CampaignId,
        });
      } else {
        (navigation as any).navigate('ProductDetails', {
          itemId: (item as any)?.ItemId ?? 0,
          storeId: (item as any)?.StoreId ?? null,
          friendUserId,
          type: 'GiftOneGetOne',
          campaignId: (item as any)?.CampaignId,
        });
      }
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
    try {
      const res = await api.post<any>(
        apiEndpoints.HANDLE_FAVORITE_ITEM,
        payload,
      );
      if (!res.success) {
        setFavoriteStates(prev => ({
          ...prev,
          [payload.ItemId]: !payload.IsFavorite,
        }));
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      setFavoriteStates(prev => ({
        ...prev,
        [payload.ItemId]: !payload.IsFavorite,
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
  const handleAddToCart = async (item: CatchItem) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const payload = {
        StoreId: item?.StoreId ?? null,
        ItemId: item?.ItemId,
        CampaignId: item.CampaignId,
      };
      const response = await api.post(
        apiEndpoints.ADD_CAMPAIGN_TO_CART,
        payload,
      );
      if (response.success) {
        navigation.navigate('CheckOut' as never);
      } else {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    } finally {
      setSubmitting(false);
    }
  };
  if (openModal) {
    return (
      <SuccessMessage
        SuccessLogo={<GiftPlacedSvg />}
        SuccessMessage="🎉 Nice Catch 🎉"
        SuccessSubMessage="You have successfully captured it!"
        primaryButtonTitle="Inbox"
        onPrimaryPress={() => {
          setOpenModal(false);
          navigation.navigate('InboxOutbox', {
            title: getString('HOME_INBOX'),
            isInbox: true,
          });
        }}
        secondaryButtonTitle="Continue"
        onSecondaryPress={() => {
          setOpenModal(false);
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
      />

      <View style={styles.listWrapper}>
        <View style={styles.tabsContainer}>
          <GroupTabs
            tabs={filterOptions}
            activeTab={selectedFilter}
            onTabPress={id => {
              setSelectedFilter(id);
              screenType === 'GiftOneGetOne'
                ? getStoreProducts.setExtraParams({
                    categoryId: id === 'all' ? null : Number(id),
                  })
                : getCatchItems.setExtraParams({
                    categoryId: id === 'all' ? null : Number(id),
                  });
            }}
          />
        </View>
        {(screenType === 'favorite' && getFavoriteItems.loading) ||
        (screenType === 'GiftOneGetOne' && getStoreProducts.loading) ||
        (screenType === 'catch' && getCatchItems.loading) ? (
          <SkeletonLoader screenType="productListing" />
        ) : (
          <FlatList
            data={filteredItems as any}
            numColumns={2}
            keyExtractor={(item: any) =>
              screenType === 'favorite' || screenType === 'GiftOneGetOne'
                ? item.ItemId.toString()
                : item.id ||
                  `${item.catchItem?.CampaignId}-${item.catchItem?.ItemId}`
            }
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={[
              styles.listContent,
              styles.listContainer,
              screenType === 'GiftOneGetOne' && {
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
                }}
              >
                <Text>{getString('EMPTY_NO_PRODUCTS_FOUND')}</Text>
              </View>
            }
            renderItem={({ item }) =>
              screenType === 'favorite' ? (
                <FavoriteProductCard
                  item={item as FaveItems}
                  onPress={handleProductPress}
                  isFavorite={
                    favoriteStates[item.ItemId] ?? item.isFavourite ?? true
                  }
                  hasFavorite={screenType === 'favorite'}
                  onFavoritePress={() => {
                    handleFavoritePress({
                      ItemId: item.ItemId,
                      IsFavorite: !(
                        favoriteStates[item.ItemId] ??
                        item.isFavourite ??
                        true
                      ),
                    });
                  }}
                />
              ) : screenType === 'GiftOneGetOne' ? (
                <GiftOneGetOneProductCard
                  item={item}
                  onPress={handleProductPress}
                  isFavorite={
                    favoriteStates[item.ItemId] ?? item.isFavourite ?? true
                  }
                  hasFavorite={false}
                  onFavoritePress={() => {
                    handleFavoritePress({
                      ItemId: item.ItemId,
                      IsFavorite: !(
                        favoriteStates[item.ItemId] ??
                        item.isFavourite ??
                        true
                      ),
                    });
                  }}
                />
              ) : (
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
              )
            }
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
