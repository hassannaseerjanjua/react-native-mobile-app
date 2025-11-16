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
  const mockCatchItems = [
    {
      id: '1',
      title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
      subtitle: getString('FAV_MOCK_BOUQUET'),
      coverImage: require('../../../assets/images/dummy1.png'),
      category: 'bouquet',
      description:
        'Hand-tied bouquet of blush roses and lilies designed for heartfelt celebrations, finished with silk ribbon twists and fragrant eucalyptus sprigs. Each stem is selected at peak bloom to create a lasting impression that feels both romantic and refined.',
      price: 100,
      discountedPrice: 50,
      isGift: true,
      subTitle2: 'Flowers',
    },
    {
      id: '2',
      title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
      subtitle: getString('FAV_MOCK_BOUQUET'),
      coverImage: require('../../../assets/images/dummy2.png'),
      category: 'bouquet',
      description:
        "Soft pink blooms paired with baby's breath to complement romantic gifting moments, offering a modern take on classic floral storytelling. The bouquet rests in a reusable glass vase, inviting the recipient to refresh it season after season.",
      price: 100,
      discountedPrice: 50,
      isGift: false,
      subTitle2: 'Flowers',
    },
    {
      id: '3',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy3.png'),
      category: 'cake',
      discountedPrice: 0,
      isGift: true,
      subTitle2: 'Cake',

      description:
        'Vanilla sponge layered with rose-infused frosting for a lightly floral dessert that melts at the first bite and finishes with a whisper of citrus. Finished with hand-piped rosettes, it transforms any gathering into an elegant celebration.',
      price: 100,
    },
    {
      id: '4',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy4.png'),
      category: 'cake',
      discountedPrice: 12,
      subTitle2: 'Cake',
      isGift: false,
      description:
        'Signature pink charm cake topped with sugared petals and a satin ribbon finish, offering layers of airy sponge, silky mousse, and a hidden berry compote center. Designed for milestone moments, it photographs beautifully and tastes even better.',
      price: 14,
    },
  ];

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
        initialState[item.ItemId] = item.IsFavorite ?? true;
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
    } else {
      console.log('item', item);
    }
  };

  const handleFavoritePress = async (payload: {
    ItemId: number;
    IsFavorite: boolean;
  }) => {
    console.log('onFavoritePress', payload);
    setFavoriteStates(prev => ({
      ...prev,
      [payload.ItemId]: payload.IsFavorite,
    }));
    try {
      const res = await api.post<any>(
        apiEndpoints.HANDLE_FAVORITE_ITEM,
        payload,
      );
      if (res.data.success) {
        console.log('Favorite item updated successfully');
      }
    } catch (error) {
      console.log('Error updating favorite item', error);
      // Revert the state change on error
      setFavoriteStates(prev => ({
        ...prev,
        [payload.ItemId]: !payload.IsFavorite,
      }));
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
            renderItem={({ item }) =>
              screenType === 'favorite' ? (
                <FavoriteProductCard
                  item={item as FaveItems}
                  onPress={handleProductPress}
                  isFavorite={
                    favoriteStates[item.ItemId] ?? item.IsFavorite ?? true
                  }
                  onFavoritePress={() => {
                    handleFavoritePress({
                      ItemId: item.ItemId,
                      IsFavorite: !(
                        favoriteStates[item.ItemId] ??
                        item.IsFavorite ??
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
