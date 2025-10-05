import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import ParentView from '../../../components/app/ParentView';
import { useLocaleStore } from '../../../store/reducer/locale';

interface SearchProps extends AppStackScreen<'Search'> {}

const SearchScreen: React.FC<SearchProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const [updatedUsers, setUpdatedUsers] = useState<Record<number, number>>({});
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const { user } = useAuthStore();
  const { getString } = useLocaleStore();

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
    setLoadingUsers(prev => ({ ...prev, [userId]: true }));
    setUpdatedUsers(prev => ({
      ...prev,
      [userId]: 1,
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
        setUpdatedUsers(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      })
      .finally(() => {
        setLoadingUsers(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      });
  };

  const unfriendUser = (userId: number) => {
    setLoadingUsers(prev => ({ ...prev, [userId]: true }));
    setUpdatedUsers(prev => ({
      ...prev,
      [userId]: 2,
    }));

    api
      .put(apiEndpoints.UNFRIEND_USER(user?.UserId, userId))
      .then(res => {
        console.log('Unfriend success:', res);
      })
      .catch(err => {
        console.log('Unfriend error:', err);
        setUpdatedUsers(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      })
      .finally(() => {
        setLoadingUsers(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      });
  };

  const handleAddUser = (userId: number) => {
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

  const displayData = searchQuery
    ? searchFriendsApi.data || []
    : activeUsersApi.data || [];
  const isLoading = searchQuery
    ? searchFriendsApi.loading
    : activeUsersApi.loading;

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={getString('HOME_SEARCH')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={getString('HOME_SEARCH')}
      />

      <View style={styles.content}>
        <View style={styles.listCard}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : searchQuery && displayData.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>No results found</Text>
            </View>
          ) : (
            <FlatList
              data={displayData}
              keyExtractor={item => item.UserId.toString()}
              renderItem={({ item, index }) => (
                <SearchUserItem
                  item={item}
                  index={index}
                  isLast={index === displayData.length - 1}
                  updatedUsers={updatedUsers}
                  loadingUsers={loadingUsers}
                  handleAddUser={handleAddUser}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              onEndReached={searchQuery ? undefined : handleLoadMore}
              onEndReachedThreshold={0.5}
            />
          )}
        </View>
      </View>
      {/* </View> */}
    </ParentView>
  );
};

export default SearchScreen;
interface SearchUserItemProps {
  item: ActiveUser;
  index: number;
  isLast: boolean;
  updatedUsers: Record<number, number>;
  loadingUsers: Record<number, boolean>;
  handleAddUser: (userId: number) => void;
}

const SearchUserItem = ({
  item,
  index,
  isLast,
  updatedUsers,
  loadingUsers,
  handleAddUser,
}: SearchUserItemProps) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const currentStatus = updatedUsers[item.UserId] ?? item.RelationStatus;
  const isAdded = currentStatus === 1;
  const isLoading = loadingUsers[item.UserId] || false;

  return (
    <View style={[styles.userRow, !isLast && styles.userRowDivider]}>
      <View style={styles.userInfo}>
        <View style={styles.avatarWrapper}>
          {/* <SvgDummyAvatar width={36} height={36} /> */}
          <Image
            source={{ uri: item?.ProfileUrl ?? '' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.userName}>{item.FullName}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.addButton, isAdded && styles.addedButton]}
        onPress={() => handleAddUser(item.UserId)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.PRIMARY} />
        ) : (
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
              {isAdded ? getString('SEARCH_ADDED') : getString('SEARCH_ADD')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
