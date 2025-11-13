import React, { useEffect, useState } from 'react';
import { View, StatusBar, FlatList, Image, Text } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteProductCard from '../../../components/app/FavoriteProductCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { AppStackScreen } from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import {
  ShareIcon,
  SvgBackIcon,
  SvgHomeBack,
} from '../../../assets/icons/index.ts';
import useGetApi from '../../../hooks/useGetApi.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import { StoreProduct, FaveItems } from '../../../types/index.ts';

const StoreProducts: React.FC<AppStackScreen<'StoreProducts'>> = ({
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation();
  const store = route.params?.store;

  const storeTitle = store?.title || 'Perfume House';
  const storeSubtitle = store?.subtitle || 'Perfume & Cologne';
  const storeCoverImage = store?.backgroundImage
    ? store.backgroundImage
    : store?.imageLogo
    ? { uri: store.imageLogo }
    : require('../../../assets/images/dummy4.png');
  const storeOverlayImage = store?.overlayImage
    ? store.overlayImage
    : store?.imageCover
    ? { uri: store.imageCover }
    : require('../../../assets/images/dummy4.png');

  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { id: 'all', title: getString('FAV_ALL') },
    { id: 'bouquet', title: getString('FAV_BOUQUET') },
    { id: 'roses', title: getString('FAV_ROSES') },
    { id: 'flowers', title: getString('FAV_FLOWERS') },
    { id: 'cake', title: getString('FAV_CAKE') },
  ];

  const getStoreProducts = useGetApi<StoreProduct[]>(
    apiEndpoints.GET_STORE_DETAIL(store?.id),
    {
      transformData: (data: any) => data.Data.Items || [],
    },
  );

  const handleProductPress = (item: StoreProduct | FaveItems) => {
    if ('ItemId' in item && 'Thumbnail' in item) {
      const product = item as StoreProduct;
      (navigation as any).navigate('ProductDetails', {
        product: {
          id: product.ItemId,
          itemId: product.ItemId,
          title: product.NameEn,
          subtitle: product.CategoryNameEn,
          coverImage: product.Thumbnail ? { uri: product.Thumbnail } : null,
          price: product.Price,
          description: product.DescEn,
        },
      });
    } else {
      (navigation as any).navigate('ProductDetails');
    }
  };

  const filteredProducts =
    getStoreProducts.data?.filter(product => {
      if (selectedFilter === 'all') return true;
      return true;
    }) || [];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ position: 'relative' }}>
        <Image source={storeCoverImage} style={styles.topImage} />

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
        <Image source={storeOverlayImage} style={styles.bottomImage} />
      </View>

      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Text style={styles.textLarge}>{storeTitle}</Text>
          <Text style={styles.textMedium}>{storeSubtitle}</Text>
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

        {getStoreProducts.loading ? (
          <SkeletonLoader screenType="productListing" />
        ) : (
          <FlatList
            columnWrapperStyle={{
              gap: 16,
            }}
            data={filteredProducts}
            numColumns={2}
            keyExtractor={item => item.ItemId.toString()}
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
