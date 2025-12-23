import React, { useEffect, useState } from 'react';
import { View, StatusBar, FlatList } from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import SkeletonLoader from '../../../components/SkeletonLoader';
import useStyles from './style';
import { ActiveUser, ActiveUsersApiResponse } from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import { useListingApi } from '../../../hooks/useListingApi';
import { useAuthStore } from '../../../store/reducer/auth';
import api from '../../../utils/api';
import ParentView from '../../../components/app/ParentView';
import { useLocaleStore } from '../../../store/reducer/locale';
import SearchUserItem from '../../../components/app/SearchUserItem';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import { Text } from '../../../utils/elements';
import notify from '../../../utils/notify';

interface SearchProps extends AppStackScreen<'Search'> {}

const SearchScreen: React.FC<SearchProps> = ({ navigation, route }) => {
  const { styles, theme } = useStyles();
  const { user, token } = useAuthStore();
  const { getString } = useLocaleStore();

  const {
    title,
    showFriendsOnly = false,
    showConnectOnly = false,
  } = route.params || {};

  const [updatedUsers, setUpdatedUsers] = useState<Record<number, number>>({});
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const [unfriendModal, setUnfriendModal] = useState({
    visible: false,
    loading: false,
    userId: null as number | null,
    isLinkedToGroup: false,
  });
  const [tempAddedUserIds, setTempAddedUserIds] = useState<Set<number>>(
    new Set(),
  );

  const activeUsersApi = useListingApi<ActiveUser>(
    apiEndpoints.GET_ACTIVE_USERS,
    token,
    {
      idExtractor: (item: ActiveUser) => item.UserId,
      transformData: (data: ActiveUsersApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      extraParams: {
        userId: user?.UserId,
        friends: showFriendsOnly,
      },
    },
  );

  useEffect(() => {
    activeUsersApi.setExtraParams({
      userId: user?.UserId,
      friends: showFriendsOnly,
    });
  }, [showFriendsOnly, user?.UserId]);

  const searchQuery = activeUsersApi.search;
  const setSearchQuery = activeUsersApi.setSearch;

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
      if (!showFriendsOnly && !showConnectOnly) {
        setTempAddedUserIds(prev => new Set(prev).add(userId));

        setTimeout(() => {
          setTempAddedUserIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }, 3000);
      }
    } catch (err: any) {
      updateUserStatus(userId, null);
      notify.error(err?.error || getString('AU_ERROR_OCCURRED'));
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
    } catch (err: any) {
      notify.error(err?.error || getString('AU_ERROR_OCCURRED'));
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

      activeUsersApi.recall();
    } catch (err: any) {
      updateUserStatus(userId, null);
      notify.error(err?.error || getString('AU_ERROR_OCCURRED'));
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

      <View style={[styles.content, styles.contentContainer]}>
        <View style={styles.listCard}>
          {activeUsersApi.loading ? (
            <SkeletonLoader screenType="search" />
          ) : (
            (() => {
              const filteredData = showConnectOnly
                ? activeUsersApi.data?.filter(
                    (user: any) => user.RelationStatus === 2,
                  )
                : activeUsersApi?.data;

              const isEmpty = !filteredData || filteredData.length === 0;

              if (isEmpty) {
                return (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                      {showConnectOnly
                        ? getString('SEARCH_NO_USERS_FOUND_TO_CONNECT')
                        : searchQuery
                        ? getString('SEARCH_NO_RESULTS_FOUND')
                        : getString('SEARCH_NO_USERS_FOUND')}
                    </Text>
                  </View>
                );
              }

              return (
                <FlatList
                  data={filteredData}
                  keyExtractor={item => item.UserId.toString()}
                  renderItem={({ item, index }) => (
                    <SearchUserItem
                      item={item}
                      index={index}
                      isLast={index === (filteredData?.length ?? 0) - 1}
                      updatedUsers={updatedUsers}
                      loadingUsers={loadingUsers}
                      handleAddUser={handleAddUser}
                      tempAddedUserIds={tempAddedUserIds}
                      isGeneralSearchScreen={
                        !showFriendsOnly && !showConnectOnly
                      }
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                  onEndReached={activeUsersApi.loadMore}
                  onEndReachedThreshold={0.5}
                />
              );
            })()
          )}
        </View>
      </View>

      <ConfirmationPopup
        visible={unfriendModal.visible}
        title={getString('SEARCH_UNFRIEND_USER')}
        message={
          unfriendModal.isLinkedToGroup
            ? getString('SEARCH_USER_LINKED_TO_GROUPS_MESSAGE')
            : getString('SEARCH_ARE_YOU_SURE_UNFRIEND')
        }
        confirmText={getString('SEARCH_YES')}
        cancelText={getString('NG_CANCEL')}
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
