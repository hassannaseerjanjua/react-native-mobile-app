import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar, FlatList, View } from 'react-native';
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
import { FaveItems } from '../../../types';
import SkeletonLoader from '../../../components/SkeletonLoader';
import api from '../../../utils/api';
import notify from '../../../utils/notify';
import { Text } from '../../../utils/elements';
import { mockCatchItems } from '../../../types/index';

const CatchScreen: React.FC<AppStackScreen<'CatchScreen'>> = ({
  navigation,
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const screenType = route.params?.type || 'catch';
  const storeID = route.params?.storeID;
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );

  const getFavoriteItems = useGetApi<FaveItems[]>(
    screenType === 'favorite' && storeID
      ? apiEndpoints.GET_FAV_STORE_ITEMS(storeID)
      : '',
    {
      transformData: (data: any) => data.Data?.Items || [],
    },
  );

  useEffect(() => {
    if (screenType === 'favorite' && getFavoriteItems.data) {
      const initialState: Record<number, boolean> = {};
      getFavoriteItems.data.forEach(item => {
        initialState[item.ItemId] = item.isFavourite ?? true;
      });
      setFavoriteStates(initialState);
    }
  }, [screenType, getFavoriteItems.data]);

  const filterOptions = useMemo(
    () => [
      { id: 'all', title: getString('FAV_ALL') },
      { id: 'bouquet', title: getString('FAV_BOUQUET') },
      { id: 'cake', title: getString('FAV_CAKE') },
    ],
    [getString],
  );

  const filteredItems = useMemo(() => {
    if (screenType === 'favorite') {
      const items = getFavoriteItems.data || [];
      if (selectedFilter === 'all') {
        return items;
      }
      return items.filter((item: FaveItems) => {
        const categoryLower = item.CategoryNameEn?.toLowerCase() || '';
        return categoryLower.includes(selectedFilter);
      });
    } else {
      if (selectedFilter === 'all') {
        return mockCatchItems;
      }
      return mockCatchItems.filter(item => item.category === selectedFilter);
    }
  }, [selectedFilter, screenType, getFavoriteItems.data]) as
    | FaveItems[]
    | typeof mockCatchItems;

  const handleProductPress = (item: any) => {
    if (screenType === 'favorite') {
      const favItem = item as FaveItems;
      navigation.navigate('ProductDetails', {
        itemId: favItem.ItemId,
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
            onTabPress={setSelectedFilter}
          />
        </View>
        {screenType === 'favorite' && getFavoriteItems.loading ? (
          <SkeletonLoader screenType="productListing" />
        ) : (
          <FlatList
            data={filteredItems as any}
            numColumns={2}
            keyExtractor={(item: any) =>
              screenType === 'favorite' ? item.ItemId.toString() : item.id
            }
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={[styles.listContent, styles.listContainer]}
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
                  item={item as (typeof mockCatchItems)[number]}
                  onPress={handleProductPress}
                />
              )
            }
          />
        )}
      </View>
    </ParentView>
  );
};

export default CatchScreen;
