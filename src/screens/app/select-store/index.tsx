import React, { useEffect, useState } from 'react';
import { View, StatusBar, FlatList } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ParentView from '../../../components/app/ParentView.tsx';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import GroupTabs from '../../../components/send-a-gift/GroupTabs.tsx';
import FavoriteItemCard from '../../../components/app/FavoriteItemCard.tsx';
import SkeletonLoader from '../../../components/SkeletonLoader';
import {
  AppStackScreen,
  AppStackParamList,
} from '../../../types/navigation.types.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import { Store } from '../../../types/index.ts';
import useGetApi from '../../../hooks/useGetApi.ts';

const SelectStore: React.FC<AppStackScreen<'SelectStore'>> = ({ route }) => {
  const friendUserId = route?.params?.friendUserId ?? null;
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { id: 'all', title: getString('FAV_ALL') },
    { id: 'bouquet', title: getString('FAV_BOUQUET') },
    { id: 'roses', title: getString('FAV_ROSES') },
    { id: 'flowers', title: getString('FAV_FLOWERS') },
    { id: 'cake', title: getString('FAV_CAKE') },
  ];

  const handleStoreSelect = (item: Store | any) => {
    const store = item as Store & { StoreBranchId?: number };
    const brandLogo = store.Documents.find(
      doc => doc.DocumentType === 'BrandLogo',
    )?.FileUrl;
    const brandLogoAttachment = store.Documents.find(
      doc => doc.DocumentType === 'BrandLogoAttachment',
    )?.FileUrl;

    navigation.navigate('StoreProducts', {
      store: {
        id: store.StoreId,
        storeId: store.StoreId,
        title: store.NameEn,
        subtitle: store.BusinessTypeName,
        imageLogo: brandLogo || null,
        imageCover: brandLogoAttachment || brandLogo || null,
      },
      storeBranchId: store.StoreBranchId ?? null,
      friendUserId: friendUserId ?? undefined,
    });
  };

  const storeListApi = useGetApi<Store[]>(apiEndpoints.GET_STORE_LIST, {
    transformData: (data: any) => data.Data.Items || [],
  });

  return (
    <ParentView>
      <View style={styles.container}>
        <StatusBar
          backgroundColor={theme.colors.BACKGROUND}
          barStyle="dark-content"
        />
        <HomeHeader
          title={getString('SELECT_STORE_TITLE')}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          showSearchBar={true}
        />
        <View style={styles.tabsContainer}>
          <GroupTabs
            tabs={filterOptions}
            activeTab={selectedFilter}
            onTabPress={setSelectedFilter}
          />
        </View>

        <View style={styles.content}>
          {storeListApi.loading ? (
            <View
              style={{
                paddingHorizontal: theme.sizes.PADDING,
              }}
            >
              <SkeletonLoader screenType="storeCard" />
            </View>
          ) : (
            <>
              <FlatList
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: theme.sizes.HEIGHT * 0.16,
                  paddingHorizontal: theme.sizes.PADDING,
                }}
                data={storeListApi?.data}
                renderItem={({ item }) => (
                  <View style={styles.favoriteItemContainer} key={item.StoreId}>
                    <FavoriteItemCard
                      key={item.StoreId}
                      item={item}
                      onPress={handleStoreSelect}
                    />
                  </View>
                )}
              />
            </>
          )}
        </View>
      </View>
    </ParentView>
  );
};

export default SelectStore;
