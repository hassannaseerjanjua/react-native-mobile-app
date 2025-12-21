import React, { useEffect, useState, useMemo } from 'react';
import { View, StatusBar, FlatList } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ParentView from '../../../components/app/ParentView.tsx';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import DropdownField, {
  DropdownOption,
} from '../../../components/global/DropdownField.tsx';
import {
  AppStackScreen,
  AppStackParamList,
} from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useAuthStore } from '../../../store/reducer/auth';
import apiEndpoints from '../../../constants/api-endpoints.ts';
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

const SelectStore: React.FC<AppStackScreen<'SelectStore'>> = ({ route }) => {
  const friendUserId = route?.params?.friendUserId ?? null;
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
  const { token, user } = useAuthStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const initialCityId = route?.params?.CityId ?? null;
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    initialCityId,
  );
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );

  const businessTypeApi = useGetApi<BusinessType[]>(
    apiEndpoints.GET_BUSINESS_TYPE,
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
      (citiesApi.data || []).map(city => ({
        label:
          langCode === 'ar'
            ? city.CityNameAr || city.CityName
            : city.CityNameEn || city.CityName,
        value: city.CityID,
      })),
    [citiesApi.data, langCode],
  );

  const selectedCityOption: DropdownOption | null = useMemo(
    () => cityOptions.find(option => option.value === selectedCityId) || null,
    [cityOptions, selectedCityId],
  );

  const handleStoreSelect = (item: Store | any) => {
    const store = item as Store;

    navigation.navigate('StoreProducts', {
      store: {
        id: store.StoreId,
        storeId: store.StoreId,
        title: store.NameEn,
        subtitle: store.BusinessTypeName,
        imageLogo: store.ImageLogo,
        imageCover: store.ImageCover,
      },
      sendType: route.params.sendType,
      storeId: store.StoreId ?? null,
      friendUserId: friendUserId ?? undefined,
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
      extraParams: {
        businessTypeId:
          selectedFilter === 'all' ? undefined : Number(selectedFilter),
        cityid: selectedCityId,
      },
    },
  );

  useEffect(() => {
    if (storeListApi.data) {
      const initialState: Record<number, boolean> = {};
      storeListApi.data.forEach(store => {
        initialState[store.StoreId] = store.isFavourite ?? false;
      });
      setFavoriteStates(initialState);
    }
  }, [storeListApi.data]);

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
          onBackPress={() => navigation.goBack()}
          showSearchBar={true}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={getString('HOME_SEARCH')}
          rightSideView={
            route.params.sendType !== 2 && (
              <View
                style={{
                  width: theme.sizes.WIDTH * 0.4,
                }}
              >
                <DropdownField
                  options={cityOptions}
                  selectedValue={selectedCityId ?? undefined}
                  selectedOption={selectedCityOption}
                  onSelect={option => setSelectedCityId(option.value)}
                  isLoading={citiesApi.loading}
                  label="Select City"
                  placeholder=""
                  style={{
                    height: theme.sizes.HEIGHT * 0.045,
                    borderRadius: theme.sizes.BORDER_RADIUS,
                    paddingHorizontal: theme.sizes.PADDING * 0.4,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    elevation: 0,
                  }}
                />
              </View>
            )
          }
        />
        <View style={styles.tabsContainer}>
          <GroupTabs
            tabs={filterOptions}
            activeTab={selectedFilter}
            onTabPress={setSelectedFilter}
          />
        </View>

        <View style={styles.content}>
          {storeListApi.loading ? (
            <View
              style={{
                paddingHorizontal: theme.sizes.PADDING,
              }}
            >
              <SkeletonLoader screenType="storeCard" />
            </View>
          ) : (
            <>
              {!storeListApi.data || storeListApi.data.length === 0 ? (
                <View
                  style={{
                    paddingHorizontal: theme.sizes.PADDING,
                    paddingTop: theme.sizes.HEIGHT * 0.1,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: theme.colors.SECONDARY_TEXT || '#666',
                    }}
                  >
                    {searchQuery
                      ? getString('SEARCH_NO_RESULTS_FOUND')
                      : 'No Stores Found'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingBottom: theme.sizes.HEIGHT * 0.16,
                    paddingHorizontal: theme.sizes.PADDING,
                  }}
                  data={storeListApi.data}
                  extraData={favoriteStates}
                  keyExtractor={item => item.StoreId.toString()}
                  renderItem={({ item }) => (
                    <View
                      style={styles.favoriteItemContainer}
                      key={item.StoreId}
                    >
                      <FavoriteItemCard
                        key={item.StoreId}
                        item={item}
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
                  )}
                  onEndReached={storeListApi.loadMore}
                  onEndReachedThreshold={0.5}
                />
              )}
            </>
          )}
        </View>
      </View>
    </ParentView>
  );
};

export default SelectStore;
