import React, { useEffect, useState } from 'react';
import { View, StatusBar, ScrollView, FlatList } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ParentView from '../../../components/app/ParentView.tsx';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen, AppStackParamList } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import { ArrowDownIcon } from '../../../assets/icons/index.ts';
import { scaleWithMax } from '../../../utils/index.ts';

const SelectStore: React.FC<AppStackScreen<'SelectStore'>> = ({ route }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

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
      price: 100,
      isFavorite: true,
    },
    {
      id: '2',
      title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
      subtitle: getString('FAV_MOCK_BOUQUET'),
      coverImage: require('../../../assets/images/dummy2.png'),
      price: 100,
      isFavorite: true,
    },
    {
      id: '3',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy3.png'),
      price: 100,
      isFavorite: true,
    },
    {
      id: '4',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy4.png'),
      price: 100,
      isFavorite: true,
    },
    {
      id: '5',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy4.png'),
      price: 100,
      isFavorite: true,
    },
    {
      id: '6',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
      subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
      coverImage: require('../../../assets/images/dummy4.png'),
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
    // Handle both FavStores (API) and MockStoreItem types
    if ('StoreNameEn' in item) {
      // API item (FavStores)
      navigation.navigate('StoreProducts', {
        store: {
          id: item.StoreId,
          storeId: item.StoreId,
          storeBranchId: item.StoreBranchID,
          title: item.StoreNameEn,
          subtitle: item.BusinessTypeNameEn,
          imageLogo: item.ImageLogo,
          imageCover: item.ImageCover,
        },
      });
    } else {
      // Mock item
      navigation.navigate('StoreProducts', {
        store: {
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          backgroundImage: item.backgroundImage,
          overlayImage: item.overlayImage,
        },
      });
    }
  };

  const handleProductPress = (item: any) => {
    navigation.navigate('ProductDetails', {
      product: {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        coverImage: item.coverImage,
        price: item.price,
        isFavorite: item.isFavorite,
        category: 'all',
      },
    });
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
        navigation.navigate('Profile');
      } else {
        console.log('Using default goBack');
        navigation.goBack();
      }
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
          title={getString('FAV_FAVORITES')}
          showBackButton={true}
          onBackPress={handleBackPress}
          rightSideTitle={'Title'}
          rightSideIcon={
            <ArrowDownIcon
              width={scaleWithMax(8, 9)}
              height={scaleWithMax(8, 9)}
            />
          }
          showSearchBar={true}
          rightSideTitleStyle={{ flexDirection: 'row-reverse' }}
        />
        <View style={styles.tabsContainer}>
          <GroupTabs
            tabs={filterOptions}
            activeTab={selectedFilter}
            onTabPress={setSelectedFilter}
          />
        </View>

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
      </View>
    </ParentView>
  );
};

export default SelectStore;
