import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import { SvgDummyAvatar, SvgSearchAdd } from '../../../assets/icons';
import { ActiveUser, ActiveUsersApiResponse } from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useAuthStore } from '../../../store/reducer/auth';

interface SearchProps extends AppStackScreen<'Search'> {}

const SearchScreen: React.FC<SearchProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const { user } = useAuthStore();

  const activeUsersApi = useGetApi<ActiveUser[]>(
    apiEndpoints.GET_ACTIVE_USERS(user?.UserId, pageIndex, pageSize),
    {
      transformData: (data: ActiveUsersApiResponse) => data.Data.Items || [],
    },
  );

  const handleAddUser = (userId: number) => {
    // TODO: Call API to add/remove user
    console.log('Add/Remove user:', userId);
  };

  const handleLoadMore = () => {
    if (!activeUsersApi.loading) {
      setPageIndex(prev => prev + 1);
    }
  };

  const renderItem = ({ item, index }: { item: ActiveUser; index: number }) => {
    const users = activeUsersApi.data || [];
    const isLast = index === users.length - 1;
    const isAdded = item.RelationStatus === 1;

    return (
      <View style={[styles.userRow, !isLast && styles.userRowDivider]}>
        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>
            <SvgDummyAvatar width={36} height={36} />
          </View>
          <Text style={styles.userName}>{item.FullName}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.addButton, isAdded && styles.addedButton]}
          onPress={() => handleAddUser(item.UserId)}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            {!isAdded && <SvgSearchAdd width={16} height={16} />}
            <Text
              style={[styles.addButtonText, isAdded && styles.addedButtonText]}
            >
              {isAdded ? 'Added' : 'Add'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title="Search"
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search"
      />

      <View style={styles.content}>
        <View style={styles.listCard}>
          <FlatList
            data={activeUsersApi.data || []}
            keyExtractor={item => item.UserId.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        </View>
      </View>
    </View>
  );
};

export default SearchScreen;
