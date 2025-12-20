import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
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

interface SelectCityProps extends AppStackScreen<'SelectCity'> {}

const SelectCity: React.FC<SelectCityProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();

  const citiesApi = useListingApi<City>(apiEndpoints.GET_CITY_LISTING, '', {
    transformData(data) {
      return {
        data: data?.Data?.cities ?? [],
        totalCount: data?.Data?.Total ?? 0,
      };
    },
  });
  console.log('citiesApi', citiesApi);

  const onSelectCity = (city: City) => {
    navigation.navigate('SelectStore', {
      sendType: 2,
      CityId: city.CityID,
    });
  };

  return (
    <ParentView>
      <HomeHeader
        title="Select City"
        showBackButton
        searchValue={citiesApi.search}
        showSearchBar
        onSearchChange={search => citiesApi.setSearch(search)}
      />

      {citiesApi.loading ? (
        <View style={{ flex: 1, paddingVertical: scaleWithMax(10, 12) }}>
          <SkeletonLoader screenType="tabItemCity" />
        </View>
      ) : (
        <FlatList
          data={citiesApi.data}
          keyExtractor={item => item.CityID.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: scaleWithMax(14, 16),
            paddingTop: scaleWithMax(10, 12),
            paddingBottom: scaleWithMax(10, 12),

            gap: scaleWithMax(10, 12),
          }}
          renderItem={({ item }) => (
            <TabItem
              TabItemStyles={theme.globalStyles.SHADOW_STYLE}
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
