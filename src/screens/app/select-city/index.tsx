import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import { Text } from '../../../utils/elements';

import { AppStackScreen } from '../../../types/navigation.types';
import useGetApi from '../../../hooks/useGetApi';
import { City } from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import useStyles from './style';
import { scaleWithMax } from '../../../utils';
import TabItem from '../../../components/global/TabItem';
import { useListingApi } from '../../../hooks/useListingApi';
import SkeletonLoader from '../../../components/SkeletonLoader';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
import { useLocaleStore } from '../../../store/reducer/locale';

interface SelectCityProps extends AppStackScreen<'SelectCity'> { }

const SelectCity: React.FC<SelectCityProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const citiesApi = useListingApi<City>(apiEndpoints.GET_CITY_LISTING, '', {
    transformData(data) {
      return {
        data: data?.Data?.cities ?? [],
        totalCount: data?.Data?.Total ?? 0,
      };
    },
  });

  const onSelectCity = (city: City) => {
    navigation.navigate('SelectStore', {
      sendType: 2,
      CityId: city.CityID,
    });
  };

  useEffect(() => {
    if (isRefreshing && !citiesApi.loading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, citiesApi.loading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    citiesApi.recall();
  };

  return (
    <ParentView>
      <HomeHeader
        title={getString('SELECT_CITY_TITLE')}
        showBackButton
        searchValue={citiesApi.search}
        showSearchBar
        onSearchChange={search => citiesApi.setSearch(search)}
      />

      {citiesApi.loading && !isRefreshing ? (
        <View style={{ flex: 1, paddingVertical: scaleWithMax(10, 12) }}>
          <SkeletonLoader screenType="tabItemCity" />
        </View>
      ) : (
        <FlatList
          data={citiesApi.data}
          keyExtractor={item => item.CityID.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.PRIMARY}
              colors={[theme.colors.PRIMARY]}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: scaleWithMax(14, 16),
            paddingTop: scaleWithMax(10, 12),
            paddingBottom: scaleWithMax(10, 12),

            gap: scaleWithMax(10, 12),
          }}
          ListEmptyComponent={
            <View style={{ height: theme.sizes.HEIGHT * 0.68 }}>
              <PlaceholderLogoText text={getString('SELECT_CITY_NO_CITIES_FOUND')} />
            </View>
          }
          renderItem={({ item }) => (
            <TabItem
              title={item.CityName}
              onPress={() => onSelectCity(item)}
            />
          )}
        />
      )}
    </ParentView>
  );
};

export default SelectCity;
