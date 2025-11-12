import React, { useMemo, useState } from 'react';
import { StatusBar, FlatList, View } from 'react-native';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard';
import useStyles from './style';
import { AppStackScreen } from '../../../types/navigation.types';
import { useLocaleStore } from '../../../store/reducer/locale';
import GroupTabs from '../../../components/send-a-gift/GroupTabs';

const CatchScreen: React.FC<AppStackScreen<'CatchScreen'>> = ({
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [selectedFilter, setSelectedFilter] = useState('all');

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
      subTitle2: 'Sub 2',
      isFavorite: true,
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
      subTitle2: 'Sub 2',

      isFavorite: true,
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

  const filterOptions = useMemo(
    () => [
      { id: 'all', title: getString('FAV_ALL') },
      { id: 'bouquet', title: getString('FAV_BOUQUET') },
      { id: 'cake', title: getString('FAV_CAKE') },
    ],
    [getString],
  );

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'all') {
      return mockCatchItems;
    }
    return mockCatchItems.filter(item => item.category === selectedFilter);
  }, [mockCatchItems, selectedFilter]);

  const handleProductPress = (item: (typeof mockCatchItems)[number]) => {
    navigation.navigate('CheckOut' as never);
  };

  return (
    <ParentView>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={getString('HOME_CATCH')}
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
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={item => item.id}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[styles.listContent, styles.listContainer]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FavoriteProductCard
              isCatch
              item={item}
              onPress={handleProductPress}
            />
          )}
        />
      </View>
    </ParentView>
  );
};

export default CatchScreen;
