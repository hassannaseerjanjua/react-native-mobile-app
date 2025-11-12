import React, { useMemo, useState, useEffect } from 'react';
import { StatusBar, View, ScrollView } from 'react-native';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import GroupTabs from '../../../components/send-a-gift/GroupTabs';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard';
import SkeletonLoader from '../../../components/SkeletonLoader';
import useStyles from './style';
import { AppStackScreen } from '../../../types/navigation.types';
import { useLocaleStore } from '../../../store/reducer/locale';

type StoreCategory = 'perfume' | 'fitness' | 'cafe';

interface StoreItem {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage: any;
  overlayImage: any;
  category: StoreCategory;
}

const GiftOneGetOneScreen: React.FC<AppStackScreen<'GiftOneGetOne'>> = ({
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const mockStores = useMemo<StoreItem[]>(
    () => [
      {
        id: '1',
        title: getString('FAV_MOCK_PERFUME_HOUSE'),
        subtitle: getString('FAV_MOCK_PERFUME_COLOGNE'),
        backgroundImage: require('../../../assets/images/perfumeHouseCover.png'),
        overlayImage: require('../../../assets/images/perfumeHouse.png'),
        category: 'perfume',
      },
      {
        id: '2',
        title: getString('FAV_MOCK_GYM'),
        subtitle: getString('FAV_MOCK_HEALTH_FITNESS'),
        backgroundImage: require('../../../assets/images/storeCover.png'),
        overlayImage: require('../../../assets/images/storeLogo.png'),
        category: 'fitness',
      },
      {
        id: '3',
        title: getString('FAV_MOCK_COFFEMATICS'),
        subtitle: getString('FAV_MOCK_CAFE_SHOPS'),
        backgroundImage: require('../../../assets/images/coffeematicsCover.png'),
        overlayImage: require('../../../assets/images/coffeematics.png'),
        category: 'cafe',
      },
      {
        id: '4',
        title: getString('FAV_MOCK_PERFUME_HOUSE'),
        subtitle: getString('FAV_MOCK_PERFUME_COLOGNE'),
        backgroundImage: require('../../../assets/images/perfumeHouseCover.png'),
        overlayImage: require('../../../assets/images/perfumeHouse.png'),
        category: 'perfume',
      },
    ],
    [getString],
  );

  const filterOptions = useMemo(
    () => [
      { id: 'all', title: getString('FAV_ALL') },
      { id: 'perfume', title: getString('FAV_MOCK_PERFUME_COLOGNE') },
      { id: 'fitness', title: getString('FAV_MOCK_HEALTH_FITNESS') },
      { id: 'cafe', title: getString('FAV_MOCK_CAFE_SHOPS') },
    ],
    [getString],
  );

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedFilter]);

  const filteredStores = useMemo(() => {
    if (selectedFilter === 'all') {
      return mockStores;
    }

    return mockStores.filter(store => store.category === selectedFilter);
  }, [mockStores, selectedFilter]);

  const handleStorePress = (store: StoreItem) => {
    navigation.navigate('StoreProducts', {
      store: {
        id: store.id,
        title: store.title,
        subtitle: store.subtitle,
        backgroundImage: store.backgroundImage,
        overlayImage: store.overlayImage,
      },
    });
  };

  return (
    <ParentView>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={`Select Store`}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearchBar
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filteredStores.map(store => (
              <View style={styles.favoriteItemContainer} key={store.id}>
                <FavoriteItemCard
                  item={store}
                  onPress={() => handleStorePress(store)}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ParentView>
  );
};

export default GiftOneGetOneScreen;
