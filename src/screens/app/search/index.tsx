import React, { useEffect, useState } from 'react';
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
import {
  ActiveUser,
  ActiveUsersApiResponse,
  SearchFriendsApiResponse,
} from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useAuthStore } from '../../../store/reducer/auth';
import api from '../../../utils/api';

interface SearchProps extends AppStackScreen<'Search'> {}

const SearchScreen: React.FC<SearchProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const [updatedUsers, setUpdatedUsers] = useState<Record<number, number>>({});
  const { user } = useAuthStore();

  const activeUsersApi = useGetApi<ActiveUser[]>(
    apiEndpoints.GET_ACTIVE_USERS(user?.UserId, pageIndex, pageSize),
    {
      transformData: (data: ActiveUsersApiResponse) => data.Data.Items || [],
    },
  );

  const searchFriendsApi = useGetApi<ActiveUser[]>(
    apiEndpoints.SEARCH_FRIENDS(searchQuery, user?.UserId),
    {
      transformData: (data: SearchFriendsApiResponse) => data.Data,
    },
  );

  console.log('searchFriendsApi', searchFriendsApi.data);

  useEffect(() => {
    if (searchQuery) {
      searchFriendsApi.refetch();
    }
  }, [searchQuery]);

  const addFriend = (userId: number) => {
    // Optimistically update the local state immediately
    setUpdatedUsers(prev => ({
      ...prev,
      [userId]: 1, // Set as added
    }));

    api
      .post(apiEndpoints.ADD_FRIEND(user?.UserId), {
        friendUserId: userId,
      })
      .then(res => {
        console.log('Add friend success:', res);
      })
      .catch(err => {
        console.log('Add friend error:', err);
        // Revert the optimistic update on error
        setUpdatedUsers(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      });
  };

  const unfriendUser = (userId: number) => {
    // Optimistically update the local state immediately
    setUpdatedUsers(prev => ({
      ...prev,
      [userId]: 2, // Set as not added
    }));

    api
      .put(apiEndpoints.UNFRIEND_USER(user?.UserId), {
        friendUserId: userId,
      })
      .then(res => {
        console.log('Unfriend success:', res);
      })
      .catch(err => {
        console.log('Unfriend error:', err);
        // Revert the optimistic update on error
        setUpdatedUsers(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      });
  };

  const handleAddUser = (userId: number) => {
    // Get current status (updated or original)
    const currentStatus =
      updatedUsers[userId] ??
      displayData.find(user => user.UserId === userId)?.RelationStatus ??
      2;
    const isCurrentlyAdded = currentStatus === 1;

    if (isCurrentlyAdded) {
      unfriendUser(userId);
    } else {
      addFriend(userId);
    }
  };

  const handleLoadMore = () => {
    if (!activeUsersApi.loading) {
      setPageIndex(prev => prev + 1);
    }
  };

  // Determine which data to display and loading state
  const displayData = searchQuery
    ? searchFriendsApi.data || []
    : activeUsersApi.data || [];
  const isLoading = searchQuery
    ? searchFriendsApi.loading
    : activeUsersApi.loading;

  const renderItem = ({ item, index }: { item: ActiveUser; index: number }) => {
    const isLast = index === displayData.length - 1;
    // Use updated status if available, otherwise use original status
    const currentStatus = updatedUsers[item.UserId] ?? item.RelationStatus;
    const isAdded = currentStatus === 1;

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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={displayData}
              keyExtractor={item => item.UserId.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              onEndReached={searchQuery ? undefined : handleLoadMore}
              onEndReachedThreshold={0.5}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default SearchScreen;
