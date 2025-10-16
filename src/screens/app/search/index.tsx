import React, { useEffect, useState } from 'react';
import { View, StatusBar, FlatList, ScrollView } from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import {
  ActiveUser,
  ActiveUsersApiResponse,
  SearchFriendsApiResponse,
} from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useAuthStore } from '../../../store/reducer/auth';
import api from '../../../utils/api';
import ParentView from '../../../components/app/ParentView';
import { useLocaleStore } from '../../../store/reducer/locale';
import SearchUserItem from '../../../components/app/SearchUserItem';
import ConfirmationModal from '../../../components/global/ConfirmationModal';
import { Text } from '../../../utils/elements';

interface SearchProps extends AppStackScreen<'Search'> {}

const SearchScreen: React.FC<SearchProps> = ({ navigation, route }) => {
  const { styles, theme } = useStyles();
  const { user } = useAuthStore();
  const { getString } = useLocaleStore();

  // Get parameters from route
  const {
    title,
    showFriendsOnly = false,
    showConnectOnly = false,
  } = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [updatedUsers, setUpdatedUsers] = useState<Record<number, number>>({});
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const [unfriendModal, setUnfriendModal] = useState({
    visible: false,
    loading: false,
    userId: null as number | null,
    isLinkedToGroup: false,
  });

  const activeUsersApi = useGetApi<ActiveUser[]>(
    apiEndpoints.GET_ACTIVE_USERS(
      user?.UserId,
      pageIndex,
      20,
      showFriendsOnly,
      searchQuery || undefined,
    ),
    {
      transformData: (data: ActiveUsersApiResponse) => data.Data.Items || [],
    },
  );

  useEffect(() => {
    activeUsersApi.refetch();
  }, [searchQuery]);

  const updateLoadingState = (userId: number, isLoading: boolean) => {
    setLoadingUsers(prev => {
      const newState = { ...prev };
      isLoading ? (newState[userId] = true) : delete newState[userId];
      return newState;
    });
  };

  const updateUserStatus = (userId: number, status: number | null) => {
    setUpdatedUsers(prev => {
      const newState = { ...prev };
      status ? (newState[userId] = status) : delete newState[userId];
      return newState;
    });
  };

  const addFriend = async (userId: number) => {
    updateLoadingState(userId, true);
    updateUserStatus(userId, 1);

    try {
      await api.post(apiEndpoints.ADD_FRIEND(user?.UserId), {
        friendUserId: userId,
      });
    } catch (err) {
      console.log('Add friend error:', err);
      updateUserStatus(userId, null);
    } finally {
      updateLoadingState(userId, false);
    }
  };

  const checkUserLinkedWithGroup = async (userId: number) => {
    updateLoadingState(userId, true);

    try {
      const res = await api.get(
        apiEndpoints.CHECK_USER_LINKED_WITH_GROUP(userId),
      );
      const isLinked = (res.data as any)?.Data || false;

      setUnfriendModal({
        visible: true,
        loading: false,
        userId,
        isLinkedToGroup: isLinked,
      });
    } catch (err) {
      console.log('Check user linked with group error:', err);
    } finally {
      updateLoadingState(userId, false);
    }
  };

  const unfriendUser = async (userId: number) => {
    setUnfriendModal(prev => ({ ...prev, loading: true }));
    updateUserStatus(userId, 2);

    try {
      await api.put(apiEndpoints.UNFRIEND_USER(user?.UserId, userId));
      setUnfriendModal({
        visible: false,
        loading: false,
        userId: null,
        isLinkedToGroup: false,
      });
    } catch (err) {
      console.log('Unfriend error:', err);
      updateUserStatus(userId, null);
    } finally {
      setUnfriendModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAddUser = (userId: number) => {
    const currentStatus =
      updatedUsers[userId] ??
      activeUsersApi.data?.find((user: any) => user.UserId === userId)
        ?.RelationStatus ??
      2;

    currentStatus === 1 ? checkUserLinkedWithGroup(userId) : addFriend(userId);
  };

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={title || getString('HOME_SEARCH')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={getString('HOME_SEARCH')}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listCard}>
          {activeUsersApi.loading ||
          (searchQuery && activeUsersApi.data?.length === 0) ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {activeUsersApi.loading ? 'Loading...' : 'No results found'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={
                showConnectOnly
                  ? activeUsersApi.data?.filter(
                      (user: any) => user.RelationStatus === 2,
                    )
                  : activeUsersApi?.data
              }
              keyExtractor={item => item.UserId.toString()}
              renderItem={({ item, index }) => (
                <SearchUserItem
                  item={item}
                  index={index}
                  isLast={index === (activeUsersApi.data?.length ?? 0) - 1}
                  updatedUsers={updatedUsers}
                  loadingUsers={loadingUsers}
                  handleAddUser={handleAddUser}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              // onEndReached={
              //   searchQuery ? undefined : () => setPageIndex(prev => prev + 1)
              // }
              onEndReachedThreshold={0.5}
            />
          )}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={unfriendModal.visible}
        title="Unfriend User"
        message={
          unfriendModal.isLinkedToGroup
            ? 'This user is linked to one or more groups, would you like to continue?'
            : 'Are you sure you want to unfriend this user?'
        }
        confirmText="Yes"
        cancelText="Cancel"
        onConfirm={() =>
          unfriendModal.userId && unfriendUser(unfriendModal.userId)
        }
        onCancel={() =>
          setUnfriendModal({
            visible: false,
            loading: false,
            userId: null,
            isLinkedToGroup: false,
          })
        }
        loading={unfriendModal.loading}
      />
    </ParentView>
  );
};

export default SearchScreen;
