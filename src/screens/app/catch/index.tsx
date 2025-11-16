import React, { useMemo, useState } from 'react';
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

const CatchScreen: React.FC<AppStackScreen<'CatchScreen'>> = ({
  navigation,
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const screenType = route.params?.type || 'catch';
  const storeID = route.params?.storeID;

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
      isGift: false,
      isFavorite: true,
      subTitle2: '',
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
      isFavorite: true,
      subTitle2: '',
    },
    {
      id: '3',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy3.png'),
      category: 'cake',
      discountedPrice: 0,
      isGift: true,
      subTitle2: 'Sub 2',

      description:
        'Vanilla sponge layered with rose-infused frosting for a lightly floral dessert that melts at the first bite and finishes with a whisper of citrus. Finished with hand-piped rosettes, it transforms any gathering into an elegant celebration.',
      price: 100,
      isFavorite: true,
    },
    {
      id: '4',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy4.png'),
      category: 'cake',
      discountedPrice: 50,
      subTitle2: 'Sub 2',
      isGift: false,

      description:
        'Signature pink charm cake topped with sugared petals and a satin ribbon finish, offering layers of airy sponge, silky mousse, and a hidden berry compote center. Designed for milestone moments, it photographs beautifully and tastes even better.',
      price: 100,
      isFavorite: true,
    },
  ];

  // Fetch favorite items when coming from favorites
  const getFavoriteItems = useGetApi<FaveItems[]>(
    screenType === 'favorite' && storeID
      ? apiEndpoints.GET_FAV_STORE_ITEMS(storeID)
      : '',
    {
      transformData: (data: any) => data.Data?.Items || [],
    },
  );

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
        // Filter by category name if available
        const categoryLower = item.CategoryNameEn?.toLowerCase() || '';
        return categoryLower.includes(selectedFilter);
      });
    } else {
      // Use mock items for catch type
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
        product: {
          id: favItem.ItemId.toString(),
          title: favItem.ItemNameEn,
          subtitle: favItem.CategoryNameEn,
          coverImage: favItem.ItemImage ? { uri: favItem.ItemImage } : null,
          price: favItem.Price,
          description: '',
          category: favItem.CategoryNameEn?.toLowerCase() as any,
          isFavorite: true,
        },
      });
    } else {
      const mockItem = item as (typeof mockCatchItems)[number];
      navigation.navigate('ProductDetails', {
        product: {
          id: mockItem.id,
          title: mockItem.title,
          subtitle: mockItem.subtitle,
          coverImage: mockItem.coverImage,
          price: mockItem.discountedPrice || mockItem.price,
          isFavorite: mockItem.isFavorite,
          description: mockItem.description,
          category: mockItem.category as any,
        },
      });
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
