import React, { useEffect, useState } from 'react';
import { View, StatusBar, FlatList } from 'react-native';
import { Text } from '../../../utils/elements';
import useStyles from './style.ts';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useListingApi } from '../../../hooks/useListingApi.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import { FavStores } from '../../../types/index.ts';
import api from '../../../utils/api.ts';

const FavoritesScreen: React.FC<AppStackScreen<'Favorites'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();

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

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [Steps, setSteps] = useState(1);

  const filterOptions = [
    { id: 'all', title: getString('FAV_ALL') },
    { id: 'bouquet', title: getString('FAV_BOUQUET') },
    { id: 'roses', title: getString('FAV_ROSES') },
    { id: 'flowers', title: getString('FAV_FLOWERS') },
    { id: 'cake', title: getString('FAV_CAKE') },
  ];

  const [cameFromProfile, setCameFromProfile] = useState(false);

  useEffect(() => {
    const routeParams = route.params as any;
    if (routeParams?.redirectionType === 'profile') {
      setCameFromProfile(true);
    } else {
      setCameFromProfile(false);
    }
  }, [route.params]);

  const handleStepPress = (item: FavStores | any) => {
    if ('StoreNameEn' in item && 'StoreBranchID' in item) {
      const favStore = item as FavStores;
      navigation.navigate('CatchScreen', {
        storeID: favStore.StoreId,
        storeBranchID: favStore.StoreBranchID,
        type: 'favorite',
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

  const handleFavoritePress = async (payload: {
    ItemId: number;
    IsFavorite: boolean;
  }) => {
    try {
      const res = await api.post<any>(
        apiEndpoints.HANDLE_FAVORITE_ITEM,
        payload,
      );
      if (res.data.success) {
      }
    } catch (error) {}
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
      />
      <View style={styles.tabsContainer}>
        <GroupTabs
          tabs={filterOptions}
          activeTab={selectedFilter}
          onTabPress={setSelectedFilter}
        />
      </View>

      <View style={styles.content}>
        {FavStoreListing.loading ? (
          <View style={styles.favoritesContainer}>
            <SkeletonLoader screenType="storeCard" />
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={FavStoreListing.data}
            keyExtractor={item => item.StoreId.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.favoritesContainer}
            renderItem={({ item }) => (
              <View style={styles.favoriteItemContainer}>
                <FavoriteItemCard item={item} onPress={handleStepPress} />
              </View>
            )}
            ListEmptyComponent={<Text>No favorites found</Text>}
          />
        )}
      </View>
    </View>
  );
};

export default FavoritesScreen;
