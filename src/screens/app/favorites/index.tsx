import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
import { FavStores, BusinessType } from '../../../types/index.ts';
import useGetApi from '../../../hooks/useGetApi.ts';
import api from '../../../utils/api.ts';
import notify from '../../../utils/notify';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';
import { SvgAddOccasion } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';

const FavoritesScreen: React.FC<AppStackScreen<'Favorites'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
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

  const businessTypeApi = useGetApi<BusinessType[]>(
    apiEndpoints.GET_BUSINESS_TYPE + '?isFavUserApp=true',
    {
      transformData: (data: any) => data.Data.Items || [],
    },
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
    }));
  }, [selectedFilter]);

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

  useFocusEffect(
    useCallback(() => {
      FavStoreListing.recall();
      businessTypeApi.refetch?.();
    }, []),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    FavStoreListing.recall();
    businessTypeApi.refetch?.();
  };

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
        showSearchBar={true}
        searchValue={FavStoreListing.search}
        onSearchChange={FavStoreListing.setSearch}
        rightSideView={
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('SelectStore' as never, {
                addToFavorites: true,
              } as never)
            }
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: scaleWithMax(4, 6),
            }}
          >
            <SvgAddOccasion
              width={scaleWithMax(20, 24)}
              height={scaleWithMax(20, 24)}
            />
            <Text
              style={{
                fontSize: theme.sizes.FONTSIZE,
                color: theme.colors.PRIMARY,
                fontFamily: theme.fonts.medium,
              }}
            >
              {getString('FAV_ADD_FAVORITES')}
            </Text>
          </TouchableOpacity>
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
                  height:
                    FavStoreListing.data && FavStoreListing.data.length > 0
                      ? theme.sizes.HEIGHT * 0.55
                      : theme.sizes.HEIGHT * 0.64,
                }}
              >
                <PlaceholderLogoText
                  text={getString('EMPTY_NO_FAVORITES_FOUND')}
                />
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default FavoritesScreen;
