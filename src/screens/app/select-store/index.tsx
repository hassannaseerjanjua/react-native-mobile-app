import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ParentView from '../../../components/app/ParentView.tsx';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/global/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import DropdownField, {
  DropdownOption,
} from '../../../components/global/DropdownField.tsx';
import CityPickerModal from '../../../components/global/CityPickerModal.tsx';
import {
  AppStackScreen,
  AppStackParamList,
} from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useAuthStore } from '../../../store/reducer/auth';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import { ArrowDownIcon } from '../../../assets/icons';
import {
  Store,
  BusinessType,
  StoreListApiResponse,
  City,
} from '../../../types/index.ts';
import useGetApi from '../../../hooks/useGetApi.ts';
import { useListingApi } from '../../../hooks/useListingApi.ts';
import api from '../../../utils/api.ts';
import notify from '../../../utils/notify';
import { Text } from '../../../utils/elements';
import { scaleWithMax } from '../../../utils';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';

const SelectStore: React.FC<AppStackScreen<'SelectStore'>> = ({ route }) => {
  const friendUserId = route?.params?.friendUserId ?? null;
  const friendIds = route?.params?.FriendIds ?? undefined;
  const { styles, theme } = useStyles();
  const { getString, langCode, isRtl } = useLocaleStore();
  const { token, user } = useAuthStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const initialCityId = route?.params?.CityId ?? user?.CityId ?? null;
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    initialCityId,
  );
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const businessTypeApi = useGetApi<BusinessType[]>(
    apiEndpoints.GET_BUSINESS_TYPE +
      '?cityid=' +
      selectedCityId +
      '&hideEmptyBusinessType=true',
    {
      transformData: (data: any) => data.Data.Items || [],
    },
  );

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: (data: any) => data?.Data?.cities ?? [],
  });

  const filterOptions = useMemo(() => {
    const allOption = { id: 'all', title: getString('FAV_ALL') };
    if (!businessTypeApi.data || businessTypeApi.data.length === 0) {
      return [allOption];
    }
    const businessTypeOptions = businessTypeApi.data.map(businessType => ({
      id: String(businessType.BusinessTypeId),
      title: langCode === 'ar' ? businessType.NameAr : businessType.NameEn,
    }));
    return [allOption, ...businessTypeOptions];
  }, [businessTypeApi.data, getString, langCode]);

  const cityOptions: DropdownOption[] = useMemo(
    () =>
      (citiesApi.data || []).map(city => {
        const cityId = city.CityID ?? (city as { CityId?: number }).CityId;
        return {
          label:
            langCode === 'ar'
              ? city.CityNameAr || city.CityName
              : city.CityNameEn || city.CityName,
          value: cityId,
        };
      }),
    [citiesApi.data, langCode],
  );

  const businessTypeMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (businessTypeApi.data) {
      businessTypeApi.data.forEach(bt => {
        map[bt.BusinessTypeId] = bt.NameAr;
      });
    }
    return map;
  }, [businessTypeApi.data]);

  const selectedCityOption: DropdownOption | null = useMemo(
    () =>
      cityOptions.find(
        option => Number(option.value) === Number(selectedCityId),
      ) || null,
    [cityOptions, selectedCityId],
  );

  const handleStoreSelect = (item: Store | any) => {
    const store = item as Store;

    navigation.navigate('StoreProducts', {
      store: {
        id: store.StoreId,
        storeId: store.StoreId,
        title: isRtl ? store.NameAr : store.NameEn,
        subtitle: isRtl
          ? businessTypeMap[store.BusinessTypeID] ||
            (store as any).BusinessTypeNameAr ||
            store.BusinessTypeName
          : store.BusinessTypeName,
        imageLogo: store.ImageLogo,
        imageCover: store.ImageCover,
        isVerified: store.isVerified,
      },
      businessTypeId: store.BusinessTypeID,
      sendType: route.params?.sendType,
      storeId: store.StoreId ?? null,
      friendUserId: friendUserId ?? undefined,
      FriendIds: friendIds,
      friendName: route.params?.friendName ?? null,
      addToFavorites: route.params?.addToFavorites ?? false,
    });
  };
  const storeListApi = useListingApi<Store>(
    apiEndpoints.GET_STORE_LIST,
    token,
    {
      idExtractor: (item: Store) => item.StoreId,
      transformData: (data: StoreListApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      pageSize: 5,
      extraParams: {
        businessTypeId:
          selectedFilter === 'all' ? undefined : Number(selectedFilter),
        cityid: selectedCityId,
        userapp: true,
      },
    },
  );

  useEffect(() => {
    if (isRefreshing && !storeListApi.loading && !businessTypeApi.loading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, storeListApi.loading, businessTypeApi.loading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    storeListApi.recall();
    businessTypeApi.refetch?.();
    citiesApi.refetch?.();
  };

  useEffect(() => {
    if (storeListApi.data) {
      const initialState: Record<number, boolean> = {};
      storeListApi.data.forEach(store => {
        initialState[store.StoreId] = store.isFavourite ?? false;
      });
      setFavoriteStates(initialState);
    }
  }, [storeListApi.data]);

  // Clearing the cart before proceeding with another user
  useEffect(() => {
    const response = api.put(apiEndpoints.CLEAR_CART, {});
  }, []);

  useEffect(() => {
    storeListApi.setExtraParams(prev => ({
      ...prev,
      businessTypeId:
        selectedFilter === 'all' ? undefined : Number(selectedFilter),
      cityid: selectedCityId,
    }));
  }, [selectedFilter, selectedCityId]);

  const searchQuery = storeListApi.search;
  const setSearchQuery = storeListApi.setSearch;

  const handleFavoritePress = async (store: Store) => {
    const storeId = store.StoreId;
    const storeBranchId = 1;

    const previousFavoriteState =
      favoriteStates[storeId] ?? store.isFavourite ?? false;
    const newFavoriteState = !previousFavoriteState;

    setFavoriteStates(prev => ({
      ...prev,
      [storeId]: newFavoriteState,
    }));

    try {
      const res = await api.post<any>(apiEndpoints.HANDLE_FAVORITE_STORE, {
        StoreID: storeId,
        StoreBranchID: storeBranchId,
        IsFavorite: newFavoriteState,
      });
      if (res.success) {
      } else {
        setFavoriteStates(prev => ({
          ...prev,
          [storeId]: previousFavoriteState,
        }));
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      setFavoriteStates(prev => ({
        ...prev,
        [storeId]: previousFavoriteState,
      }));
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  useEffect(() => {
    if (selectedCityId) {
      businessTypeApi.refetch();
    }
  }, [selectedCityId]);

  return (
    <ParentView>
      <View style={styles.container}>
        <StatusBar
          backgroundColor={theme.colors.BACKGROUND}
          barStyle="dark-content"
        />
        <HomeHeader
          title={getString('SELECT_STORE_TITLE')}
          showBackButton={true}
          onBackPress={() => {
            // Check if we can go back, otherwise navigate to home
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              // Navigate to home if there's no back history (e.g., from deep link)
              navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabs' as never }],
              });
            }
          }}
          showSearchBar={storeListApi.data.length > 0 && !storeListApi.loading}
          loading={storeListApi.loading}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={getString('HOME_SEARCH')}
          rightSideView={
            route.params.sendType !== 2 && (
              <TouchableOpacity
                onPress={() => setShowCityPicker(true)}
                style={{
                  width: theme.sizes.WIDTH * 0.48,
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
                    fontFamily: selectedCityOption
                      ? theme.fonts.medium
                      : theme.fonts.regular,
                  }}
                  numberOfLines={1}
                >
                  {selectedCityOption
                    ? selectedCityOption.label
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

        <View style={styles.content}>
          <View>
            {businessTypeApi.loading && !isRefreshing ? (
              <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
                <SkeletonLoader screenType="groupTabs" />
              </View>
            ) : businessTypeApi.data &&
              businessTypeApi.data.length > 0 &&
              ((storeListApi.data && storeListApi.data.length > 0) ||
                storeListApi.loading) ? (
              <GroupTabs
                tabs={filterOptions}
                activeTab={selectedFilter}
                onTabPress={setSelectedFilter}
                tabStyle={{ paddingHorizontal: theme.sizes.PADDING }}
              />
            ) : (
              <View style={{ height: theme.sizes.HEIGHT * 0.016 }} />
            )}
          </View>

          {storeListApi.loading && !isRefreshing ? (
            <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
              <SkeletonLoader screenType="storeCard" />
            </View>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: theme.sizes.HEIGHT * 0.2,
                paddingHorizontal: theme.sizes.PADDING,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={theme.colors.PRIMARY}
                  colors={[theme.colors.PRIMARY]}
                />
              }
              data={storeListApi.data}
              extraData={favoriteStates}
              ListEmptyComponent={() => (
                <View style={{ height: theme.sizes.HEIGHT * 0.78 }}>
                  <PlaceholderLogoText
                    text={
                      searchQuery
                        ? getString('SEARCH_NO_RESULTS_FOUND')
                        : getString('SELECT_STORE_NO_STORES_FOUND')
                    }
                  />
                </View>
              )}
              keyExtractor={item => item.StoreId.toString()}
              renderItem={({ item }) => (
                <>
                  <View style={styles.favoriteItemContainer} key={item.StoreId}>
                    <FavoriteItemCard
                      key={item.StoreId}
                      item={
                        {
                          ...item,
                          BusinessTypeNameAr:
                            businessTypeMap[item.BusinessTypeID] ||
                            (item as any).BusinessTypeNameAr,
                        } as any
                      }
                      onPress={handleStoreSelect}
                      showFavorite={true}
                      isFavorite={
                        favoriteStates[item.StoreId] ??
                        item.isFavourite ??
                        false
                      }
                      onFavoritePress={() => handleFavoritePress(item)}
                    />
                  </View>
                </>
              )}
              onEndReached={storeListApi.loadMore}
              onEndReachedThreshold={0.5}
            />
          )}
        </View>
      </View>

      <CityPickerModal
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        options={cityOptions.map(opt => ({
          label: opt.label,
          value: opt.value,
        }))}
        selectedValue={selectedCityId}
        onSelect={value => {
          setSelectedCityId(value as number | null);
          setShowCityPicker(false);
        }}
        title={getString('SELECT_STORE_SELECT_CITY')}
      />
    </ParentView>
  );
};

export default SelectStore;
