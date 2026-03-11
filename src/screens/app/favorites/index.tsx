import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text } from '../../../utils/elements';
import useStyles from './style.ts';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/global/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useListingApi } from '../../../hooks/useListingApi.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import { FavStores, BusinessType, City } from '../../../types/index.ts';
import useGetApi from '../../../hooks/useGetApi.ts';
import api from '../../../utils/api.ts';
import notify from '../../../utils/notify';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';
import CustomButton from '../../../components/global/Custombutton';
import CityPickerModal from '../../../components/global/CityPickerModal.tsx';
import {
  SvgAddOccasion,
  ArrowDownIcon,
  SvgAddGroup,
} from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { useAuthStore } from '../../../store/reducer/auth';

const FavoritesScreen: React.FC<AppStackScreen<'Favorites'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
  const { user } = useAuthStore();
  const routeParams = route.params as
    | { cityId?: number; redirectionType?: string }
    | undefined;
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    routeParams?.cityId ?? user?.CityId ?? null,
  );
  const [showCityPicker, setShowCityPicker] = useState(false);

  const businessTypeUrl = useMemo(
    () =>
      apiEndpoints.GET_BUSINESS_TYPE +
      '?isFavUserApp=true' +
      (selectedCityId ? `&cityid=${selectedCityId}` : ''),
    [selectedCityId],
  );

  const FavStoreListing = useListingApi<FavStores>(
    apiEndpoints.GET_FAV_STORE,
    '',
    {
      transformData: data => {
        return {
          data: data.Data.Items || [],
          showingText: data?.Data?.ShowingText || '',
          totalCount: data?.Data?.TotalCount,
        };
      },
    },
  );

  const businessTypeApi = useGetApi<BusinessType[]>(businessTypeUrl, {
    transformData: (data: any) => data.Data.Items || [],
  });

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: (data: any) => data?.Data?.cities ?? [],
  });

  const cityOptions = useMemo(
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

  const selectedCityOption = useMemo(
    () =>
      cityOptions.find(opt => Number(opt.value) === Number(selectedCityId)) ||
      null,
    [cityOptions, selectedCityId],
  );

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [Steps, setSteps] = useState(1);
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => {
    if (FavStoreListing.data) {
      const initialState: Record<number, boolean> = {};
      FavStoreListing.data.forEach(store => {
        initialState[store.StoreId] = true;
      });
      setFavoriteStates(initialState);
    }
  }, [FavStoreListing.data]);

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

  useEffect(() => {
    FavStoreListing.setExtraParams(prev => ({
      ...prev,
      businessTypeId:
        selectedFilter === 'all' ? undefined : Number(selectedFilter),
      cityid: selectedCityId,
    }));
  }, [selectedFilter, selectedCityId]);

  // businessTypeApi auto-refetches when businessTypeUrl changes (driven by selectedCityId)

  const [cameFromProfile, setCameFromProfile] = useState(false);

  useEffect(() => {
    const routeParams = route.params as any;
    if (routeParams?.redirectionType === 'profile') {
      setCameFromProfile(true);
    } else {
      setCameFromProfile(false);
    }
  }, [route.params]);

  useEffect(() => {
    if (isRefreshing && !FavStoreListing.loading && !businessTypeApi.loading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, FavStoreListing.loading, businessTypeApi.loading]);

  const businessTypeRefetchRef = useRef(businessTypeApi.refetch);
  businessTypeRefetchRef.current = businessTypeApi.refetch;
  const citiesRefetchRef = useRef(citiesApi.refetch);
  citiesRefetchRef.current = citiesApi.refetch;

  useFocusEffect(
    useCallback(() => {
      FavStoreListing.recall();
      businessTypeRefetchRef.current?.();
      citiesRefetchRef.current?.();
    }, []),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    FavStoreListing.recall();
    businessTypeApi.refetch?.();
    citiesApi.refetch?.();
  };

  const handleAddFavoritesPress = () =>
    (navigation as any).navigate('SelectStore', {
      addToFavorites: true,
      CityId: selectedCityId,
    });

  const handleStepPress = (item: FavStores | any) => {
    if ('StoreNameEn' in item && 'StoreBranchID' in item) {
      const favStore = item as FavStores;
      navigation.navigate('CatchScreen', {
        storeID: favStore.StoreId,
        storeBranchID: favStore.StoreBranchID,
        type: 'favorite',
        businessTypeId: favStore.BusinessTypeId,
      });
    }
  };

  const handleBackPress = () => {
    if (Steps === 2) {
      setSteps(1);
    } else {
      if (cameFromProfile) {
        navigation.navigate('Profile' as never);
      } else {
        navigation.goBack();
      }
    }
  };

  const handleFavoritePress = async (store: FavStores) => {
    const storeId = store.StoreId;
    const storeBranchId = store.StoreBranchID;

    const previousFavoriteState = favoriteStates[storeId] ?? true;
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
  console.log('favestorelisting loaidng ==>', FavStoreListing.loading);
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={getString('FAV_FAVORITES')}
        showBackButton={true}
        onBackPress={handleBackPress}
        // loading={
        //   FavStoreListing?.loading ||
        //   businessTypeApi.loading ||
        //   citiesApi.loading ||
        //   isRefreshing ||
        //   FavStoreListing.search !== ''
        // }
        // showSearchBar={
        //   FavStoreListing.data.length > 0 && !FavStoreListing.loading
        // }
        showSearchBar={true}
        searchValue={FavStoreListing.search}
        hideSearchBar={false}
        onSearchChange={FavStoreListing.setSearch}
        rightSideView={
          <TouchableOpacity
            onPress={() => setShowCityPicker(true)}
            activeOpacity={0.7}
            style={{
              width: theme.sizes.WIDTH * 0.48,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
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
                : getString('SELECT_STORE_SELECT_CITY') || 'Select City'}
            </Text>
            <ArrowDownIcon
              width={scaleWithMax(12, 14)}
              height={scaleWithMax(12, 14)}
              fill={theme.colors.PRIMARY}
            />
          </TouchableOpacity>
        }
      />

      <View style={[styles.content, { position: 'relative' }]}>
        <View>
          {businessTypeApi.loading && !isRefreshing ? (
            <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
              <SkeletonLoader screenType="groupTabs" />
            </View>
          ) : businessTypeApi.data &&
            businessTypeApi.data.length > 0 &&
            ((FavStoreListing.data && FavStoreListing.data.length > 0) ||
              FavStoreListing.loading) ? (
            <GroupTabs
              tabStyle={{ paddingHorizontal: theme.sizes.PADDING }}
              tabs={filterOptions}
              activeTab={selectedFilter}
              onTabPress={setSelectedFilter}
            />
          ) : (
            <View style={{ height: theme.sizes.HEIGHT * 0.016 }} />
          )}
        </View>

        {FavStoreListing.loading && !isRefreshing ? (
          <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
            <SkeletonLoader screenType="storeCard" />
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={FavStoreListing.data || []}
            keyExtractor={item => item.StoreId.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: theme.sizes.HEIGHT * 0.16,
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
            renderItem={({ item }) => (
              <View style={styles.favoriteItemContainer}>
                <FavoriteItemCard
                  item={item}
                  onPress={handleStepPress}
                  showFavorite={true}
                  isFavorite={favoriteStates[item.StoreId] ?? true}
                  onFavoritePress={() => handleFavoritePress(item)}
                />
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  // backgroundColor: theme.colors.RED,
                  marginTop:
                    FavStoreListing.data && FavStoreListing.data.length > 0
                      ? theme.sizes.HEIGHT * 0.2
                      : theme.sizes.HEIGHT * 0.25,
                  alignItems: 'center',
                }}
              >
                <PlaceholderLogoText
                  text={getString('EMPTY_NO_FAVORITES_FOUND')}
                />
                <View
                  style={{
                    marginTop: theme.sizes.HEIGHT * 0.02,
                    width: '100%',
                  }}
                >
                  <CustomButton
                    title={getString('FAV_ADD_FAVORITES')}
                    type="primary"
                    icon={<SvgAddOccasion />}
                    onPress={handleAddFavoritesPress}
                  />
                </View>
              </View>
            }
          />
        )}

        {!FavStoreListing.loading && FavStoreListing.data.length > 0 && (
          <View style={styles.buttonContainer}>
            <CustomButton
              title={getString('FAV_ADD_FAVORITES')}
              type="primary"
              icon={<SvgAddOccasion />}
              onPress={handleAddFavoritesPress}
            />
          </View>
        )}
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
          const cityId = value as number | null;
          setSelectedCityId(cityId);
          navigation.setParams({ ...routeParams, cityId } as object);
          setShowCityPicker(false);
        }}
        title={getString('SELECT_STORE_SELECT_CITY') || 'Select City'}
      />
    </View>
  );
};

export default FavoritesScreen;
