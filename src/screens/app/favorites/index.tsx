import React, { useEffect, useState } from 'react';
import { View, StatusBar, ScrollView, FlatList } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import ParentView from '../../../components/app/ParentView.tsx';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard.tsx';

const mockFavorites = [
  {
    id: '1',
    title: 'Perfume House',
    subtitle: 'Perfume & Cologne',
    backgroundImage: require('../../../assets/images/perfumeHouseCover.png'),
    overlayImage: require('../../../assets/images/perfumeHouse.png'),
  },
  {
    id: '2',
    title: 'Gym',
    subtitle: 'Health & Fitness',
    backgroundImage: require('../../../assets/images/storeCover.png'),
    overlayImage: require('../../../assets/images/storeLogo.png'),
  },
  {
    id: '3',
    title: 'Coffematics',
    subtitle: 'Cafe Shops',
    backgroundImage: require('../../../assets/images/coffeematicsCover.png'),
    overlayImage: require('../../../assets/images/coffeematics.png'),
  },
];

const mockfavoriteItems = [
  {
    id: '1',
    title: 'Pink Charm Delight Bouquet',
    subtitle: 'Bouquet',
    coverImage: require('../../../assets/images/dummy1.png'),
    price: 100,
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Pink Charm Delight Bouquet',
    subtitle: 'Bouquet',
    coverImage: require('../../../assets/images/dummy2.png'),
    price: 100,
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Pink Charm Delight Cake',
    subtitle: 'Cake House',
    coverImage: require('../../../assets/images/dummy3.png'),
    price: 100,
    isFavorite: true,
  },
  {
    id: '4',
    title: 'Pink Charm Delight Cake',
    subtitle: 'Cake House',
    coverImage: require('../../../assets/images/dummy4.png'),
    price: 100,
    isFavorite: true,
  },
  {
    id: '5',
    title: 'Pink Charm Delight Cake',
    subtitle: 'Cake House',
    coverImage: require('../../../assets/images/dummy4.png'),
    price: 100,
    isFavorite: true,
  },
  {
    id: '6',
    title: 'Pink Charm Delight Cake',
    subtitle: 'Cake House',
    coverImage: require('../../../assets/images/dummy4.png'),
    price: 100,
    isFavorite: true,
  },
];

const filterOptions = [
  { id: 'all', title: 'All' },
  { id: 'bouquet', title: 'Bouquet' },
  { id: 'roses', title: 'Roses' },
  { id: 'flowers', title: 'Flowers' },
  { id: 'cake', title: 'Cake' },
];

const FavoritesScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [Steps, setSteps] = useState(1);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSteps(1);
    });
    return unsubscribe;
  }, [navigation]);

  const handleStepPress = (item: any) => {
    setSteps(2);
  };

  const handleProductPress = (item: any) => {
    console.log('Navigate to product:', item.title);
  };

  const handleBackPress = () => {
    if (Steps === 2) {
      setSteps(1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title="Favorites"
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.favoritesContainer}>
            {mockFavorites.map(item => (
              <View style={styles.favoriteItemContainer} key={item.id}>
                <FavoriteItemCard
                  key={item.id}
                  item={item}
                  onPress={handleStepPress}
                />
              </View>
            ))}
          </View>
        </ScrollView>
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
