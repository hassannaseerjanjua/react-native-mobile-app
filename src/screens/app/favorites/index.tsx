import React, { useCallback, useEffect, useState } from 'react';
import { View, StatusBar, ScrollView, FlatList } from 'react-native';
import { Text } from '../../../utils/elements';
import useStyles from './style.ts';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useListingApi } from '../../../hooks/useListingApi.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';

import { FaveItems, FavStores } from '../../../types/index.ts';
import { useFocusEffect } from '@react-navigation/native';

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
  const [isLoading, setIsLoading] = useState(true);

  const filterOptions = [
    { id: 'all', title: getString('FAV_ALL') },
    { id: 'bouquet', title: getString('FAV_BOUQUET') },
    { id: 'roses', title: getString('FAV_ROSES') },
    { id: 'flowers', title: getString('FAV_FLOWERS') },
    { id: 'cake', title: getString('FAV_CAKE') },
  ];

  const [cameFromProfile, setCameFromProfile] = useState(false);

  // Use a more reliable method to detect if we came from profile
  useEffect(() => {
    // Check if we have route params indicating we came from profile
    const routeParams = route.params as any;
    console.log('Favorites route params:', routeParams);
    if (routeParams?.redirectionType === 'profile') {
      setCameFromProfile(true);
    } else {
      setCameFromProfile(false);
    }
  }, [route.params]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSteps(1);
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, [navigation]);

  // Simulate data loadings
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedFilter]);

  const handleStepPress = (item: FavStores | any) => {
    // Handle FavStores type
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
    console.log('Back pressed, cameFromProfile:', cameFromProfile);
    if (Steps === 2) {
      setSteps(1);
    } else {
      if (cameFromProfile) {
        console.log('Navigating back to Profile');
        navigation.navigate('Profile' as never);
      } else {
        console.log('Using default goBack');
        navigation.goBack();
      }
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
          <SkeletonLoader screenType="storeCard" />
        ) : (
          <>
            {FavStoreListing.data.length > 0 ? (
              FavStoreListing.data.map(item => (
                <View style={styles.favoriteItemContainer} key={item.StoreId}>
                  <FavoriteItemCard
                    key={item.StoreId}
                    item={item}
                    onPress={handleStepPress}
                  />
                </View>
              ))
            ) : (
              <Text>No favorites found</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default FavoritesScreen;
