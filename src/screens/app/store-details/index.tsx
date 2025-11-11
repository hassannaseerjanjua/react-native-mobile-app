import React, { useMemo, useState } from 'react';
import {
  Image,
  StatusBar,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import ParentView from '../../../components/app/ParentView';
import useStyles from './style';
import { AppStackScreen } from '../../../types/navigation.types';
import { SvgBackIcon, SvgGiftLink } from '../../../assets/icons';
import GroupTabs from '../../../components/send-a-gift/GroupTabs';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard';
import { useLocaleStore } from '../../../store/reducer/locale';
import { Text } from '../../../utils/elements';

type ProductCategory = 'all' | 'bouquet' | 'flowers' | 'roses' | 'cake';

interface StoreProduct {
  id: string;
  title: string;
  subtitle: string;
  coverImage: any;
  price: number;
  isFavorite: boolean;
  description?: string;
  category: ProductCategory;
}

const StoreDetailsScreen: React.FC<AppStackScreen<'StoreDetails'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const fallbackStore = useMemo(
    () => ({
      id: '0',
      title: getString('FAV_MOCK_PERFUME_HOUSE'),
      subtitle: getString('FAV_MOCK_PERFUME_COLOGNE'),
      backgroundImage: require('../../../assets/images/perfumeHouseCover.png'),
      overlayImage: require('../../../assets/images/perfumeHouse.png'),
    }),
    [getString],
  );

  const store = route.params?.store ?? fallbackStore;

  const [selectedFilter, setSelectedFilter] = useState<ProductCategory>('all');

  const filterOptions = useMemo(
    () => [
      { id: 'all', title: getString('FAV_ALL') },
      { id: 'bouquet', title: getString('FAV_BOUQUET') },
      { id: 'roses', title: getString('FAV_ROSES') },
      { id: 'flowers', title: getString('FAV_FLOWERS') },
      { id: 'cake', title: getString('FAV_CAKE') },
    ],
    [getString],
  );

  const mockProducts = useMemo<StoreProduct[]>(
    () => [
      {
        id: '1',
        title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
        subtitle: getString('FAV_MOCK_BOUQUET'),
        coverImage: require('../../../assets/images/dummy1.png'),
        price: 200,
        isFavorite: true,
        category: 'bouquet',
      },
      {
        id: '2',
        title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
        subtitle: getString('FAV_MOCK_BOUQUET'),
        coverImage: require('../../../assets/images/dummy2.png'),
        price: 200,
        isFavorite: false,
        category: 'bouquet',
      },
      {
        id: '3',
        title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
        subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
        coverImage: require('../../../assets/images/dummy3.png'),
        price: 200,
        isFavorite: true,
        category: 'cake',
      },
      {
        id: '4',
        title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
        subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
        coverImage: require('../../../assets/images/dummy4.png'),
        price: 200,
        isFavorite: true,
        category: 'cake',
      },
      {
        id: '5',
        title: getString('FAV_MOCK_PINK_CHARM_BOUQUET'),
        subtitle: getString('FAV_MOCK_BOUQUET'),
        coverImage: require('../../../assets/images/dummy1.png'),
        price: 200,
        isFavorite: false,
        category: 'roses',
      },
      {
        id: '6',
        title: getString('FAV_MOCK_PINK_CHARM_CAKE'),
        subtitle: getString('FAV_MOCK_CAKE_HOUSE'),
        coverImage: require('../../../assets/images/dummy3.png'),
        price: 200,
        isFavorite: true,
        category: 'cake',
      },
    ],
    [getString],
  );

  const filteredProducts = useMemo(() => {
    if (selectedFilter === 'all') {
      return mockProducts;
    }
    return mockProducts.filter(product => product.category === selectedFilter);
  }, [mockProducts, selectedFilter]);

  const renderHeader = () => (
    <View style={styles.contentWrapper}>
      <View style={styles.heroWrapper}>
        <Image source={store.backgroundImage} style={styles.heroImage} />
        <View style={styles.heroOverlay}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <SvgBackIcon width={16} height={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <SvgGiftLink width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.storeCard}>
        <View style={styles.storeInfoRow}>
          <Image source={store.overlayImage} style={styles.storeAvatar} />
          <View style={styles.storeTextContainer}>
            <Text style={styles.storeTitle}>{store.title}</Text>
            <Text style={styles.storeSubtitle}>{store.subtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <GroupTabs
          tabs={filterOptions}
          activeTab={selectedFilter}
          onTabPress={tab => setSelectedFilter(tab as ProductCategory)}
        />
      </View>
    </View>
  );

  return (
    <ParentView>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <FavoriteProductCard
              item={item}
              onPress={() =>
                navigation.navigate('ProductDetails', { product: item })
              }
            />
          </View>
        )}
      />
    </ParentView>
  );
};

export default StoreDetailsScreen;
