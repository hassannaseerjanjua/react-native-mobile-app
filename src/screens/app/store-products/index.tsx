import React, { useEffect, useState } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  FlatList,
  Image,
  Text,
} from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import ParentView from '../../../components/app/ParentView.tsx';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import {
  ShareIcon,
  SvgBackIcon,
  SvgHomeBack,
} from '../../../assets/icons/index.ts';

const StoreProducts: React.FC<AppStackScreen<'StoreProducts'>> = ({
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation();

  const dummyCover = require('../../../assets/images/dummy4.png');

  const mockfavoriteItems = [
    {
      id: '1',
      title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
      coverImage: require('../../../assets/images/dummy1.png'),
      price: 100,
      isFavorite: true,
    },
    {
      id: '2',
      title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
      coverImage: require('../../../assets/images/dummy2.png'),
      price: 100,
      isFavorite: true,
    },
    {
      id: '3',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
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
      coverImage: require('../../../assets/images/dummy4.png'),
      price: 100,
      isFavorite: true,
    },
    {
      id: '6',
      title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
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

  useEffect(() => {
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

  const handleProductPress = (item: any) => {
    navigation.navigate('ProductDetails' as never);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ position: 'relative' }}>
        <Image source={dummyCover} style={styles.topImage} />

        {/* Overlay icons */}
        <View
          style={{
            position: 'absolute',
            top: 68,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            alignItems: 'center',
            zIndex: 10,
            width: '100%',
          }}
        >
          <View style={styles.backContainer}>
            <SvgHomeBack />
          </View>
          <View style={styles.backContainer}>
            <ShareIcon />
          </View>
        </View>
        <Image source={dummyCover} style={styles.bottomImage} />
      </View>

      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Text style={styles.textLarge}>Perfume House</Text>
          <Text style={styles.textMedium}>Perfume & Cologne</Text>
        </View>
        <StatusBar
          backgroundColor={theme.colors.BACKGROUND}
          barStyle="light-content"
        />

        <View style={styles.tabsContainer}>
          <GroupTabs
            tabs={filterOptions}
            activeTab={selectedFilter}
            onTabPress={setSelectedFilter}
          />
        </View>

        {isLoading ? (
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
    </View>
  );
};

export default StoreProducts;
