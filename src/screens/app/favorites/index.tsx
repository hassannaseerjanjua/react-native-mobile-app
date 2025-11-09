import React, { useEffect, useState } from 'react';
import { View, StatusBar, ScrollView, FlatList } from 'react-native';
import useStyles from './style.ts';
import ParentView from '../../../components/app/ParentView.tsx';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';

const FavoritesScreen: React.FC<AppStackScreen<'Favorites'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();

  const mockFavorites = [
    {
      id: '1',
      title: getString('FAV_MOCK_PERFUME_HOUSE'),
      subtitle: getString('FAV_MOCK_PERFUME_COLOGNE'),
      backgroundImage: require('../../../assets/images/perfumeHouseCover.png'),
      overlayImage: require('../../../assets/images/perfumeHouse.png'),
    },
    {
      id: '2',
      title: getString('FAV_MOCK_GYM'),
      subtitle: getString('FAV_MOCK_HEALTH_FITNESS'),
      backgroundImage: require('../../../assets/images/storeCover.png'),
      overlayImage: require('../../../assets/images/storeLogo.png'),
    },
    {
      id: '3',
      title: getString('FAV_MOCK_COFFEMATICS'),
      subtitle: getString('FAV_MOCK_CAFE_SHOPS'),
      backgroundImage: require('../../../assets/images/coffeematicsCover.png'),
      overlayImage: require('../../../assets/images/coffeematics.png'),
    },
  ];

  const mockfavoriteItems = [
    {
      id: '1',
      title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
      subtitle: getString('FAV_MOCK_BOUQUET'),
      coverImage: require('../../../assets/images/dummy1.png'),
      description:
        'Hand-tied bouquet of blush roses and lilies designed for heartfelt celebrations, finished with silk ribbon twists and fragrant eucalyptus sprigs. Each stem is selected at peak bloom to create a lasting impression that feels both romantic and refined.',
      price: 100,
      isFavorite: true,
    },
    {
      id: '2',
      title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
      subtitle: getString('FAV_MOCK_BOUQUET'),
      coverImage: require('../../../assets/images/dummy2.png'),
      description:
        "Soft pink blooms paired with baby's breath to complement romantic gifting moments, offering a modern take on classic floral storytelling. The bouquet rests in a reusable glass vase, inviting the recipient to refresh it season after season.",
      price: 100,
      isFavorite: true,
    },
    {
      id: '3',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy3.png'),
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
      description:
        'Signature pink charm cake topped with sugared petals and a satin ribbon finish, offering layers of airy sponge, silky mousse, and a hidden berry compote center. Designed for milestone moments, it photographs beautifully and tastes even better.',
      price: 100,
      isFavorite: true,
    },
    {
      id: '5',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy4.png'),
      description:
        'Decadent strawberry mousse cake created for birthdays, anniversaries, and sweet surprises, balancing tart fruit layers with velvety vanilla accents. Each slice is adorned with edible pearls to elevate an ordinary evening into a memory worth keeping.',
      price: 100,
      isFavorite: true,
    },
    {
      id: '6',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy4.png'),
      description:
        'Petal-pink buttercream cake layered with berry compote to share with loved ones, offering an irresistible balance of sweetness and citrus brightness. Wrapped in a textured frosting pattern, it invites guests to linger over dessert and conversation.',
      price: 100,
      isFavorite: true,
    },
  ];
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

  const handleStepPress = (item: any) => {
    setSteps(2);
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleProductPress = (item: (typeof mockfavoriteItems)[number]) => {
    navigation.navigate('ProductDetails', { product: item });
  };

  const handleBackPress = () => {
    console.log('Back pressed, cameFromProfile:', cameFromProfile);
    if (Steps === 2) {
      setSteps(1);
    } else {
      // If we came from profile, navigate back to profile
      // Otherwise use default goBack behavior
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

      {Steps === 1 ? (
        <View style={styles.content}>
          {isLoading ? (
            <SkeletonLoader screenType="storeCard" />
          ) : (
            <>
              {mockFavorites.map(item => (
                <View style={styles.favoriteItemContainer} key={item.id}>
                  <FavoriteItemCard
                    key={item.id}
                    item={item}
                    onPress={handleStepPress}
                  />
                </View>
              ))}
            </>
          )}
        </View>
      ) : isLoading ? (
        <SkeletonLoader screenType="productListing" />
      ) : (
        <FlatList
          columnWrapperStyle={{
            gap: 16,
          }}
          data={mockfavoriteItems}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FavoriteProductCard item={item} onPress={handleProductPress} />
          )}
        />
      )}
    </View>
  );
};

export default FavoritesScreen;
