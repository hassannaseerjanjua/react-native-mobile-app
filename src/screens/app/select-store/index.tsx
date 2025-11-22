import React, { useEffect, useState, useMemo } from 'react';
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
import { Store, BusinessType } from '../../../types/index.ts';
import useGetApi from '../../../hooks/useGetApi.ts';
import api from '../../../utils/api.ts';
import notify from '../../../utils/notify';

const SelectStore: React.FC<AppStackScreen<'SelectStore'>> = ({ route }) => {
  const friendUserId = route?.params?.friendUserId ?? null;
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {},
  );

  const businessTypeApi = useGetApi<BusinessType[]>(
    apiEndpoints.GET_BUSINESS_TYPE,
    {
      transformData: (data: any) => data.Data.Items || [],
    },
  );

  // Create filter options from business types
  const filterOptions = useMemo(() => {
    const allOption = { id: 'all', title: getString('FAV_ALL') };
    if (!businessTypeApi.data || businessTypeApi.data.length === 0) {
      return [allOption];
    }
    const businessTypeOptions = businessTypeApi.data.map(businessType => ({
      id: String(businessType.BusinessTypeId),
      title: langCode === 'ar' ? businessType.NameAr : businessType.NameEn,
    }));
    return [allOption, ...businessTypeOptions];
  }, [businessTypeApi.data, getString, langCode]);

  const handleStoreSelect = (item: Store | any) => {
    const store = item as Store;
    const brandLogo = store.Documents.find(
      doc => doc.DocumentType === 'BrandLogo',
    )?.FileUrl;
    const brandLogoAttachment = store.Documents.find(
      doc => doc.DocumentType === 'BrandLogoAttachment',
    )?.FileUrl;

    // Use placeholder fallback pattern - pass null if URLs are missing or empty
    const validBrandLogo = brandLogo && brandLogo.trim() ? brandLogo : null;
    const validBrandLogoAttachment =
      brandLogoAttachment && brandLogoAttachment.trim()
        ? brandLogoAttachment
        : null;

    navigation.navigate('StoreProducts', {
      store: {
        id: store.StoreId,
        storeId: store.StoreId,
        title: store.NameEn,
        subtitle: store.BusinessTypeName,
        imageLogo: validBrandLogo,
        imageCover: validBrandLogoAttachment || validBrandLogo,
      },
      storeId: store.StoreId ?? null,
      friendUserId: friendUserId ?? undefined,
    });
  };

  const storeListApi = useGetApi<Store[]>(apiEndpoints.GET_STORE_LIST, {
    transformData: (data: any) => data.Data.Items || [],
  });

  // Initialize favorite states from API data
  useEffect(() => {
    if (storeListApi.data) {
      const initialState: Record<number, boolean> = {};
      storeListApi.data.forEach(store => {
        initialState[store.StoreId] = store.isFavourite ?? false;
      });
      setFavoriteStates(initialState);
    }
  }, [storeListApi.data]);

  const handleFavoritePress = async (store: Store) => {
    const storeId = store.StoreId;
    // Default to 1 if StoreBranchID is not available in the Store type
    const storeBranchId = 1;

    const previousFavoriteState =
      favoriteStates[storeId] ?? store.isFavourite ?? false;
    const newFavoriteState = !previousFavoriteState;

    // Optimistically update the favorite state
    setFavoriteStates(prev => ({
      ...prev,
      [storeId]: newFavoriteState,
    }));

    try {
      const res = await api.post<any>(apiEndpoints.HANDLE_FAVORITE_STORE, {
        StoreID: storeId,
        StoreBranchID: storeBranchId,
        IsFavorite: newFavoriteState,
      });
      if (res.success) {
      } else {
        // Revert the state change on error
        setFavoriteStates(prev => ({
          ...prev,
          [storeId]: previousFavoriteState,
        }));
        notify.error(res.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      // Revert the state change on error
      setFavoriteStates(prev => ({
        ...prev,
        [storeId]: previousFavoriteState,
      }));
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    }
  };

  // Filter stores based on selected business type
  const filteredStores = useMemo(() => {
    if (!storeListApi.data) return [];
    if (selectedFilter === 'all') return storeListApi.data;
    const businessTypeId = Number(selectedFilter);
    return storeListApi.data.filter(
      store => store.BusinessTypeID === businessTypeId,
    );
  }, [storeListApi.data, selectedFilter]);

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
                data={filteredStores}
                extraData={favoriteStates}
                renderItem={({ item }) => (
                  <View style={styles.favoriteItemContainer} key={item.StoreId}>
                    <FavoriteItemCard
                      key={item.StoreId}
                      item={item}
                      onPress={handleStoreSelect}
                      showFavorite={true}
                      isFavorite={
                        favoriteStates[item.StoreId] ??
                        item.isFavourite ??
                        false
                      }
                      onFavoritePress={() => handleFavoritePress(item)}
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
