import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StatusBar,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import { Image } from '../../../utils/elements';
import ParentView from '../../../components/app/ParentView';
import ShadowView from '../../../components/global/ShadowView';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import { AppStackScreen } from '../../../types/navigation.types';
import { useLocaleStore } from '../../../store/reducer/locale';
import GroupTabs from '../../../components/global/GroupTabs';
import CatchProductCard from '../../../components/app/CatchProductCard';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard';
import useGetApi from '../../../hooks/useGetApi';
import { patchCacheItems } from '../../../utils/api-cache';
import apiEndpoints from '../../../constants/api-endpoints';
import {
  FaveItems,
  CatchItem,
  CatchItemsApiResponse,
  Category,
  CampaignCategory,
  StoreProduct,
  CartResponse,
} from '../../../types';
import SkeletonLoader from '../../../components/SkeletonLoader';
import api from '../../../utils/api';
import notify from '../../../utils/notify';
import { Text } from '../../../utils/elements';
import { useListingApi } from '../../../hooks/useListingApi';
import {
  ArrowDownIcon,
  GiftPlacedSvg,
  SvgRiyalIconWhite,
  SvgCatchTimeIcon,
  SvgProfileCrossIcon,
} from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import GiftOneGetOneProductCard from '../../../components/app/GiftOneGetOneProductCard';
import SuccessMessage from '../../../components/global/SuccessComponent';
import CityPickerModal from '../../../components/global/CityPickerModal';
import { City } from '../../../types';
import { useAuthStore } from '../../../store/reducer/auth';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
import ConfirmationModal from '../../../components/global/ConfirmationModal';
import { BlurView } from '@react-native-community/blur';
import CustomButton from '../../../components/global/Custombutton';
import { useFocusEffect } from '@react-navigation/native';

const CatchScreen: React.FC<AppStackScreen<'CatchScreen'>> = ({
  navigation,
  route,
}) => {
  const { styles, theme } = useStyles();
  const [openModal, setOpenModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { getString, isRtl, langCode } = useLocaleStore();
  const { user } = useAuthStore();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    route.params?.cityId || null,
  );
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const screenType = route.params?.type || 'catch';
  const storeID = route.params?.storeID;
  const businessTypeId = route.params?.businessTypeId;
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const friendUserId = route.params?.friendUserId ?? null;

  // Common transform function for listing APIs
  const transformListingData = (data: any) => ({
    data: data.Data?.Items || [],
    totalCount: data.Data?.TotalCount || 0,
  });

  // Transform categories data
  const transformCategoriesData = (data: any) => {
    if (screenType === 'favorite') {
      return data.Data?.Items || [];
    }
    // For campaign categories, flatten the Categories array from each CampaignCategory
    const campaignCategories: CampaignCategory[] = data.Data || [];
    const flattenedCategories: Category[] = [];
    campaignCategories.forEach(campaign => {
      campaign.Categories.forEach(cat => {
        if (!flattenedCategories.find(c => c.CategoryId === cat.CategoryId)) {
          flattenedCategories.push({
            CategoryId: cat.CategoryId,
            NameEn: cat.CategoryNameEn,
            NameAr: cat.CategoryNameAr,
            CategoryImage: '',
            IsActive: true,
            Status: 1,
          });
        }
      });
    });
    return flattenedCategories;
  };

  const categoriesApi = useGetApi<Category[]>(
    screenType === 'favorite'
      ? apiEndpoints.GET_CATEGORIES(businessTypeId, storeID) +
          '&isFavUserApp=true'
      : apiEndpoints.GET_CAMPAIGN_CATEGORIES(
          screenType === 'GiftOneGetOne' ? 3 : 1,
          selectedCityId || user?.CityId,
        ),
    {
      transformData: transformCategoriesData,
    },
  );

  const citiesApi = useGetApi<City[]>(
    screenType === 'GiftOneGetOne' ? apiEndpoints.GET_CITY_LISTING : '',
    {
      transformData: (data: any) => data.Data?.cities || [],
    },
  );

  const storeBranchID = route.params?.storeBranchID;
  const getFavoriteItems = useListingApi<FaveItems>(
    screenType === 'favorite' ? apiEndpoints.GET_FAV_STORE_ITEMS : '',
    '',
    {
      transformData: transformListingData,
      extraParams:
        storeID && storeBranchID
          ? {
              StoreId: storeID,
              StoreBranchId: storeBranchID,
            }
          : {},
      idExtractor: (item: FaveItems) => item.ItemId,
    },
  );

  const getCatchItems = useListingApi<CatchItem>(
    screenType === 'catch' ? apiEndpoints.GET_CATCH_ITEMS : '',
    '',
    {
      transformData: transformListingData,
      idExtractor: (item: CatchItem) => `${item.CampaignId}-${item.ItemId}`,
    },
  );

  const getStoreProducts = useListingApi<StoreProduct>(
    screenType === 'GiftOneGetOne' ? apiEndpoints.GET_CATCH_ITEMS : '',
    '',
    {
      transformData: transformListingData,
      extraParams: {
        campaingType: 3,
        cityId: route.params?.cityId || null,
      },
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

  // Update extraParams and recall API when selectedCityId changes (only for GiftOneGetOne)
  useEffect(() => {
    if (screenType === 'GiftOneGetOne' && selectedCityId !== null) {
      getStoreProducts.setExtraParams({
        campaingType: 3,
        CityId: selectedCityId,
      });
      getStoreProducts.recall();
    }
  }, [selectedCityId, screenType]);

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

  // When returning from ProductDetails after favoriting/unfavoriting, reload list
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      if (screenType === 'favorite') {
        getFavoriteItems.recall();
      }
    }, [screenType, getFavoriteItems]),
  );

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
  const filteredListingApi = useMemo(() => {
    if (screenType === 'favorite') {
      return getFavoriteItems || [];
    } else if (screenType === 'GiftOneGetOne') {
      return getStoreProducts || [];
    } else {
      return getCatchItems;
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
        StoreBranchId: item.StoreBranchId,
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
          setShowErrorModal(true);
        }
      } else {
        setShowErrorModal(true);
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
        storeId: favItem.StoreId ?? null,
        friendUserId: friendUserId ?? undefined,
        fromFavorites: true,
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
    patchCacheItems<{ ItemId: number; isFavourite: boolean }>(
      'listing:',
      item => item.ItemId === payload.ItemId,
      { isFavourite: payload.IsFavorite },
    );

    const revertFavorite = () => {
      setFavoriteStates(prev => ({
        ...prev,
        [payload.ItemId]: !payload.IsFavorite,
      }));
      patchCacheItems<{ ItemId: number; isFavourite: boolean }>(
        'listing:',
        item => item.ItemId === payload.ItemId,
        { isFavourite: !payload.IsFavorite },
      );
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

  const cityOptions = useMemo(() => {
    if (!citiesApi.data || citiesApi.data.length === 0) return [];
    return citiesApi.data.map(city => ({
      label:
        langCode === 'ar'
          ? city.CityNameAr || city.CityName
          : city.CityNameEn || city.CityName,
      value: city.CityID,
    }));
  }, [citiesApi.data, langCode]);

  const handleCitySelect = (cityId: number | string | null) => {
    const id = typeof cityId === 'string' ? parseInt(cityId, 10) : cityId;
    setSelectedCityId(id);
    getStoreProducts.setExtraParams({
      cityId: id,
      campaingType: 3,
    });
    setShowCityPicker(false);
  };

  const createFavoritePressHandler = (item: any) => () => {
    handleFavoritePress({
      ItemId: item.ItemId,
      IsFavorite: !getFavoriteState(item),
    });
  };

  const getItemKey = (item: any): string => {
    if (screenType === 'favorite' || screenType === 'GiftOneGetOne') {
      return item.ItemId.toString();
    }
    return item.id || `${item.catchItem?.CampaignId}-${item.catchItem?.ItemId}`;
  };

  // Get header title based on screen type
  const getHeaderTitle = () => {
    if (screenType === 'favorite') return getString('FAV_FAVORITES');
    if (screenType === 'GiftOneGetOne')
      return getString('HOME_GIFT_ONE_GET_ONE');
    return getString('HOME_CATCH');
  };

  // Handle tab press
  const handleTabPress = (id: string) => {
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
        CityId: selectedCityId,
      });
    } else if (screenType === 'catch') {
      getCatchItems.setExtraParams({
        categoryId,
        campaingType: 1,
      });
    }
  };

  useEffect(() => {
    categoriesApi.refetch();
  }, [selectedCityId]);

  // Render product item based on screen type
  const renderProductItem = ({ item }: { item: any }) => {
    if (screenType === 'favorite') {
      return (
        <FavoriteProductCard
          item={item as FaveItems}
          onPress={handleProductPress}
          isFavorite={getFavoriteState(item)}
          hasFavorite={true}
          onFavoritePress={createFavoritePressHandler(item)}
          // isFavoriteTab={true}
        />
      );
    }

    if (screenType === 'GiftOneGetOne') {
      return (
        <GiftOneGetOneProductCard
          item={item}
          onPress={handleProductPress}
          isFavorite={getFavoriteState(item)}
          hasFavorite={false}
          onFavoritePress={createFavoritePressHandler(item)}
        />
      );
    }

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
  };

  // Handle modal close and recall catch items if needed
  const handleModalClose = () => {
    setOpenModal(false);
    if (screenType === 'catch') {
      getCatchItems.recall();
    }
  };

  const catchIcon = require('../../../assets/images/catch-Group-Icon.png');
  if (openModal) {
    return (
      <SuccessMessage
        MediaLogo={
          <Image source={require('../../../assets/images/catch-gif.gif')} />
        }
        SuccessLogo={<Image source={catchIcon} style={styles.catchIcon} />}
        SuccessMessage={getString('CATCH_SUCCESS_MESSAGE')}
        SuccessSubMessage={getString('CATCH_SUCCESS_SUB_MESSAGE')}
        primaryButtonTitle={getString('HOME_INBOX')}
        onPrimaryPress={() => {
          handleModalClose();
          navigation.navigate('InboxOutbox', {
            title: getString('HOME_INBOX'),
            isInbox: true,
          });
        }}
        secondaryButtonTitle={getString('CATCH_CONTINUE')}
        onSecondaryPress={handleModalClose}
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
        title={getHeaderTitle()}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearchBar={filteredItems.length > 0 && !filteredListingApi.loading}
        loading={filteredListingApi.loading}
        searchValue={listingApi?.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={getString('HOME_SEARCH')}
        rightSideView={
          screenType === 'GiftOneGetOne' && (
            <TouchableOpacity
              onPress={() => setShowCityPicker(true)}
              style={{
                // width: theme.sizes.WIDTH * 0.48,
                // height: theme.sizes.HEIGHT * 0.045,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingHorizontal: theme.sizes.PADDING * 0.4,
                gap: scaleWithMax(4, 6),
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.FONTSIZE,
                  color: theme.colors.PRIMARY,
                  fontFamily: selectedCityId
                    ? theme.fonts.medium
                    : theme.fonts.regular,
                }}
                numberOfLines={1}
              >
                {selectedCityId
                  ? citiesApi.data?.find(city => city.CityID === selectedCityId)
                      ?.CityName ?? ''
                  : getString('SELECT_STORE_SELECT_CITY')}
              </Text>
              <ArrowDownIcon
                width={scaleWithMax(12, 14)}
                height={scaleWithMax(12, 14)}
                fill={theme.colors.PRIMARY}
              />
            </TouchableOpacity>
          )
        }
      />

      <View style={styles.listWrapper}>
        <View>
          {categoriesApi.loading ? (
            <View
              style={{
                paddingHorizontal: theme.sizes.PADDING,
              }}
            >
              <SkeletonLoader screenType="groupTabs" />
            </View>
          ) : categoriesApi.data &&
            categoriesApi.data.length > 0 &&
            ((listingApi?.data && listingApi.data.length > 0) ||
              listingApi?.loading) ? (
            <GroupTabs
              tabStyle={{ paddingHorizontal: theme.sizes.PADDING }}
              tabs={filterOptions}
              activeTab={selectedFilter}
              onTabPress={handleTabPress}
            />
          ) : (
            <View style={{ height: theme.sizes.HEIGHT * 0.016 }} />
          )}
        </View>

        {listingApi?.loading ? (
          <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
            <SkeletonLoader screenType="productListing" />
          </View>
        ) : (
          <FlatList
            data={filteredItems as any}
            numColumns={2}
            keyExtractor={getItemKey}
            columnWrapperStyle={styles.columnWrapper}
            extraData={favoriteStates}
            ListEmptyComponent={() => (
              <View style={{ height: theme.sizes.HEIGHT * 0.78 }}>
                <PlaceholderLogoText
                  text={getString('EMPTY_NO_PRODUCTS_FOUND')}
                />
              </View>
            )}
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
            renderItem={renderProductItem}
          />
        )}
      </View>

      {screenType === 'GiftOneGetOne' && (
        <CityPickerModal
          visible={showCityPicker}
          onClose={() => setShowCityPicker(false)}
          options={cityOptions}
          selectedValue={selectedCityId}
          onSelect={handleCitySelect}
          title={getString('SELECT_STORE_SELECT_CITY')}
        />
      )}
      {cartApi.data?.Items && (
        <ShadowView preset="storeCard">
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
              <Text style={styles.footerButtonText}>
                {getString('VIEW_CART')}
              </Text>
              <View style={styles.footerPriceRow}>
                <SvgRiyalIconWhite
                  width={scaleWithMax(12, 14)}
                  height={scaleWithMax(12, 14)}
                />
                <Text style={styles.footerPriceText}>
                  {cartApi.data?.TotalAmount || '0.00'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ShadowView>
      )}

      <Modal
        visible={showErrorModal}
        transparent
        style={{
          position: 'relative',
        }}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={2}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
          />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowErrorModal(false)}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.BACKGROUND,
                borderRadius: theme.sizes.BORDER_RADIUS_HIGH,
              },
            ]}
          >
            <View style={styles.innerContent}>
              <TouchableOpacity
                onPress={() => setShowErrorModal(false)}
                style={styles.closeButton}
              >
                <SvgProfileCrossIcon
                  width={scaleWithMax(12, 14)}
                  height={scaleWithMax(12, 14)}
                  stroke={theme.colors.BLACK}
                />
              </TouchableOpacity>

              <View style={styles.contentWrapper}>
                {/* <SvgCatchTimeIcon
                  width={scaleWithMax(120, 140)}
                  height={scaleWithMax(120, 140)}
                  style={{
                    position: 'absolute',
                    top: -scaleWithMax(60, 62),
                    zIndex: 199999
                  }}
                /> */}
                <Image
                  source={require('../../../assets/images/catch-time-icon.png')}
                  width={scaleWithMax(120, 140)}
                  height={scaleWithMax(120, 140)}
                  resizeMode="contain"
                  style={{
                    position: 'absolute',
                    top: -scaleWithMax(60, 62),
                    zIndex: 199999,
                    width: scaleWithMax(120, 140),
                    height: scaleWithMax(120, 140),
                  }}
                />

                <Text style={styles.modalTitle}>
                  {getString('ALREADY_CLAIMED')}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {getString('AVAILABLE_ONCE_EVERY_24_HOURS_PER_STORE')}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {getString('YOU_CAN_STILL_CLAIM_FROM_ANY_OTHER_STORE')}
                </Text>

                <CustomButton
                  title={getString('EXPLORE_OTHER_CATCH')}
                  onPress={() => setShowErrorModal(false)}
                  buttonStyle={styles.modalButton}
                  labelStyle={{
                    ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                    fontSize: theme.sizes.FONTSIZE_BUTTON,
                    color: theme.colors.WHITE,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ParentView>
  );
};

export default CatchScreen;
