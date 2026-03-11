import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ScrollView,
  Share,
  Platform,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
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
import {
  getContactsWithPhoneNumbers,
  ContactInfo,
} from '../../../utils/contacts';
import { scaleWithMax } from '../../../utils';
import useTheme from '../../../styles/theme';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
import ShadowView from '../../../components/global/ShadowView';

interface VerifiedUser {
  PhoneNo: string;
  IsAppUser: boolean;
  UserID: number | null;
}

interface SearchProps extends AppStackScreen<'Search'> { }

const SearchScreen: React.FC<SearchProps> = ({ navigation, route }) => {
  const { styles, theme } = useStyles();
  const { user, token } = useAuthStore();
  const { getString } = useLocaleStore();

  const {
    title,
    showFriendsOnly = false,
    showConnectOnly = false,
    showEmployeesOnly = false,
  } = route.params || {};

  const [updatedUsers, setUpdatedUsers] = useState<Record<number, number>>({});
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const [unfriendModal, setUnfriendModal] = useState({
    visible: false,
    loading: false,
    userId: null as number | null,
    userName: null as string | null,
    isLinkedToGroup: false,
  });
  const [tempAddedUserIds, setTempAddedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const { globalStyles } = useTheme();
  const CONNECT_PAGE_SIZE = 30;
  const [mobileContacts, setMobileContacts] = useState<ContactInfo[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState<
    Record<string, VerifiedUser>
  >({});
  const [verifyingContacts, setVerifyingContacts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectDisplayedCount, setConnectDisplayedCount] = useState(
    CONNECT_PAGE_SIZE,
  );

  const activeUsersApi = useListingApi<ActiveUser>(
    showEmployeesOnly ? '' : apiEndpoints.GET_ACTIVE_USERS,
    token,
    {
      pageSize: 30,
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

  const employeesApi = useListingApi<ActiveUser>(
    showEmployeesOnly ? apiEndpoints.GET_EMPLOYEES : '',
    token,
    {
      pageSize: 30,
      idExtractor: (item: ActiveUser) => item.UserId,
      transformData: (data: ActiveUsersApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
    },
  );

  useEffect(() => {
    if (!showEmployeesOnly) {
      activeUsersApi.setExtraParams({
        userId: user?.UserId,
        friends: showFriendsOnly,
      });
    }
  }, [showFriendsOnly, showEmployeesOnly, user?.UserId]);

  // Load mobile contacts when in connect mode
  useEffect(() => {
    if (showConnectOnly) {
      setConnectDisplayedCount(CONNECT_PAGE_SIZE);
      setVerifiedUsers({});
      loadMobileContacts();
    } else {
      setMobileContacts([]);
      setVerifiedUsers({});
    }
  }, [showConnectOnly]);

  useEffect(() => {
    if (!isRefreshing) return;
    if (showConnectOnly) {
      if (!loadingContacts && !verifyingContacts) {
        setIsRefreshing(false);
      }
      return;
    }
    if (showEmployeesOnly) {
      if (!employeesApi.loading) {
        setIsRefreshing(false);
      }
      return;
    }
    if (!activeUsersApi.loading) {
      setIsRefreshing(false);
    }
  }, [
    isRefreshing,
    showConnectOnly,
    showEmployeesOnly,
    loadingContacts,
    verifyingContacts,
    employeesApi.loading,
    activeUsersApi.loading,
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (showConnectOnly) {
      loadMobileContacts();
    } else if (showEmployeesOnly) {
      employeesApi.recall();
    } else {
      activeUsersApi.recall();
    }
  };

  const handleConnectLoadMore = () => {
    if (connectDisplayedCount >= connectFilteredContacts.length) return;
    setConnectDisplayedCount(prev =>
      Math.min(prev + CONNECT_PAGE_SIZE, connectFilteredContacts.length),
    );
  };

  const handleScroll = ({ nativeEvent }: { nativeEvent: any }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const threshold = layoutMeasurement.height * 1.5;
    const nearBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (!nearBottom) return;
    if (showConnectOnly) {
      handleConnectLoadMore();
      return;
    }
    if (showEmployeesOnly) {
      employeesApi.loadMore();
    } else {
      activeUsersApi.loadMore();
    }
  };

  // Format phone number with + prefix
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    // Add + if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  };

  // Verify users in batches
  const verifyUsers = async (phoneNumbers: string[]) => {
    const BATCH_SIZE = 50; // Adjust based on API limits
    const results: Record<string, VerifiedUser> = {};

    for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
      const batch = phoneNumbers.slice(i, i + BATCH_SIZE);
      try {
        const response = await api.post<{
          Data: VerifiedUser[];
          ResponseCode: number;
          Success: boolean;
          ResponseMessage: string;
        }>(apiEndpoints.VERIFY_USER, {
          phoneNos: batch,
        });

        if (response.success && response.data?.Data) {
          response.data.Data.forEach(user => {
            results[user.PhoneNo] = user;
          });
        }
      } catch (error: any) {
        console.error('Error verifying users batch:', error);
      }
    }

    return results;
  };

  const loadMobileContacts = async () => {
    setLoadingContacts(true);
    try {
      const contacts = await getContactsWithPhoneNumbers();
      setMobileContacts(contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      notify.error(getString('AU_ERROR_OCCURRED'));
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleInviteContact = async (
    phoneNumber: string,
    contactName?: string,
  ) => {
    try {
      const formattedPhone = phoneNumber.replace(/[^\d]/g, ''); // Remove + and other chars

      // Generate invite message
      const inviteMessage = getString('SEARCH_INVITE_MESSAGE');

      // Use Share API to show bottom sheet with all sharing options
      const shareOptions = Platform.select({
        ios: {
          message: inviteMessage,
        },
        android: {
          message: inviteMessage,
          title: contactName
            ? `${contactName} - ${getString('SEARCH_INVITE_TITLE')}`
            : getString('C_INVITE') || 'Invite to Giftee',
        },
      }) || {
        message: inviteMessage,
        title: contactName
          ? `${contactName} - ${getString('SEARCH_INVITE_TITLE')}`
          : getString('C_INVITE') || 'Invite to Giftee',
      };

      await Share.share(shareOptions);
    } catch (error: any) {
      // Only show error if user didn't dismiss the share sheet
      if (error.message !== 'User did not share') {
        notify.error(getString('SEARCH_UNABLE_TO_SHARE'));
      }
    }
  };

  const handleContactAction = async (contact: ActiveUser) => {
    const phoneNo = contact.PhoneNo;
    if (!phoneNo) return;

    const formattedPhone = formatPhoneNumber(phoneNo);
    const verified = verifiedUsers[formattedPhone];

    if (verified?.IsAppUser && verified.UserID) {
      // User is in app, add as friend
      await addFriend(verified.UserID);
    } else {
      // User not in app, invite via share bottom sheet
      const contactName = contact.FullName || contact.Email || undefined;
      await handleInviteContact(phoneNo, contactName);
    }
  };

  const searchQuery = showEmployeesOnly
    ? employeesApi.search
    : activeUsersApi.search;
  const setSearchQuery = showEmployeesOnly
    ? employeesApi.setSearch
    : activeUsersApi.setSearch;

  // Connect mode: filter and paginate contacts
  const connectFilteredContacts = useMemo(() => {
    if (!showConnectOnly) return [];
    if (!searchQuery?.trim()) return mobileContacts;
    const query = searchQuery.toLowerCase();
    return mobileContacts.filter(
      contact =>
        contact.name?.toLowerCase().includes(query) ||
        contact.phoneNumbers?.some(p => p?.includes(query)) ||
        contact.emails?.some(e => e?.toLowerCase().includes(query)),
    );
  }, [showConnectOnly, mobileContacts, searchQuery]);

  const connectDisplayedContacts = useMemo(
    () => connectFilteredContacts.slice(0, connectDisplayedCount),
    [connectFilteredContacts, connectDisplayedCount],
  );

  const connectHasMore =
    connectDisplayedCount < connectFilteredContacts.length;

  const connectMappedContacts = useMemo<ActiveUser[]>(() => {
    return connectDisplayedContacts.map((contact, index) => {
      const phoneNo = contact.phoneNumbers[0] || '';
      const formattedPhone = formatPhoneNumber(phoneNo);
      const verified = verifiedUsers[formattedPhone];

      return {
        UserId:
          verified?.IsAppUser && verified.UserID
            ? verified.UserID
            : -(index + 1),
        FullName: contact.name,
        PhoneNo: phoneNo,
        Email: contact.emails[0] || '',
        ProfileUrl: contact.thumbnail || null,
        RelationStatus: verified?.IsAppUser ? 2 : 0,
        IsVerified: verified?.IsAppUser ? true : false,
      } as ActiveUser;
    });
  }, [connectDisplayedContacts, verifiedUsers]);

  // Incrementally verify displayed contacts
  const verifyingBatchRef = useRef(false);
  useEffect(() => {
    if (!showConnectOnly || connectDisplayedContacts.length === 0) return;
    const phoneNumbersToVerify = connectDisplayedContacts
      .flatMap(c => c.phoneNumbers)
      .map(formatPhoneNumber)
      .filter((phone, i, self) => self.indexOf(phone) === i)
      .filter(phone => !verifiedUsers[phone]);

    if (phoneNumbersToVerify.length === 0) return;
    if (verifyingBatchRef.current) return;

    verifyingBatchRef.current = true;
    setVerifyingContacts(true);

    verifyUsers(phoneNumbersToVerify)
      .then(newVerified => {
        setVerifiedUsers(prev => ({ ...prev, ...newVerified }));
      })
      .catch(() => {})
      .finally(() => {
        verifyingBatchRef.current = false;
        setVerifyingContacts(false);
      });
  }, [showConnectOnly, connectDisplayedCount, connectFilteredContacts]);

  // Reset pagination when search changes (connect mode)
  useEffect(() => {
    if (showConnectOnly) {
      setConnectDisplayedCount(CONNECT_PAGE_SIZE);
    }
  }, [searchQuery, showConnectOnly]);

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
      const userName =
        activeUsersApi.data?.find((u: any) => u.UserId === userId)?.FullName ||
        null;

      setUnfriendModal({
        visible: true,
        loading: false,
        userId,
        userName,
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
      setUnfriendModal(prev => ({ ...prev, visible: false, loading: false }));
      setTimeout(
        () =>
          setUnfriendModal({
            visible: false,
            loading: false,
            userId: null,
            userName: null,
            isLinkedToGroup: false,
          }),
        300,
      );

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
        title={title || getString('FIND_PEOPLE')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={getString('HOME_SEARCH')}
        rightSideView={
          !showFriendsOnly &&
          !showConnectOnly &&
          !user?.isMerchant && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Search', {
                  showConnectOnly: true,
                })
              }
              style={{
                backgroundColor: theme.colors.SECONDARY,
                paddingHorizontal: scaleWithMax(10, 10),
                paddingVertical: scaleWithMax(5, 6),
                borderRadius: scaleWithMax(5, 6),
              }}
            >
              <Text
                style={{
                  ...globalStyles.TEXT_STYLE,
                  color: theme.colors.PRIMARY,
                }}
              >
                {getString('C_CONNECT')}
              </Text>
            </TouchableOpacity>
          )
        }
      />

      <View style={styles.content}>
        {activeUsersApi.loading ||
          employeesApi.loading ||
          (showConnectOnly && loadingContacts) ? (
          // true ? (
          // <ShadowView preset="listItem">
          <View
            style={{
              paddingHorizontal: theme.sizes.PADDING,
              paddingVertical: theme.sizes.PADDING,
            }}
          >
            <SkeletonLoader screenType="search" />
          </View>
        ) : showConnectOnly ? (
          <View style={[styles.content, styles.contentContainer]}>
            <ShadowView
              preset="listItem"
              disabled={connectDisplayedContacts.length === 0}
            >
              <View
                style={[
                  styles.listCard,
                  connectDisplayedContacts.length === 0 &&
                    styles.listCardEmpty,
                ]}
              >
                <FlatList
                  data={connectMappedContacts}
                  scrollEnabled={true}
                  keyExtractor={item => item.UserId.toString()}
                  renderItem={({ item, index }) => {
                    const phoneNo = item.PhoneNo || '';
                    const formattedPhone = formatPhoneNumber(phoneNo);
                    const verified = verifiedUsers[formattedPhone];
                    const isAppUser = verified?.IsAppUser || false;

                    return (
                      <SearchUserItem
                        item={item}
                        index={index}
                        isLast={
                          index === connectMappedContacts.length - 1 &&
                          !connectHasMore
                        }
                        updatedUsers={updatedUsers}
                        loadingUsers={loadingUsers}
                        handleAddUser={
                          isAppUser
                            ? () => handleContactAction(item)
                            : undefined
                        }
                        showAddButton={true}
                        tempAddedUserIds={tempAddedUserIds}
                        isGeneralSearchScreen={false}
                        customButtonText={
                          !isAppUser ? getString('SEARCH_INVITE') : undefined
                        }
                        onCustomButtonPress={
                          !isAppUser
                            ? () => handleContactAction(item)
                            : undefined
                        }
                      />
                    );
                  }}
                  initialNumToRender={15}
                  maxToRenderPerBatch={15}
                  windowSize={5}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                  ListEmptyComponent={
                    <View style={{ height: theme.sizes.HEIGHT * 0.6 }}>
                      <PlaceholderLogoText
                        text={getString('SEARCH_NO_USERS_FOUND')}
                      />
                    </View>
                  }
                  ListFooterComponent={
                    verifyingContacts && connectHasMore ? (
                      <View
                        style={{
                          padding: theme.sizes.PADDING,
                          alignItems: 'center',
                        }}
                      >
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.PRIMARY}
                        />
                      </View>
                    ) : null
                  }
                  onEndReached={() => {
                    if (connectHasMore && !verifyingContacts) {
                      handleConnectLoadMore();
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      tintColor={theme.colors.PRIMARY}
                      colors={[theme.colors.PRIMARY]}
                    />
                  }
                />
              </View>
            </ShadowView>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={300}
            onScroll={handleScroll}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.PRIMARY}
                colors={[theme.colors.PRIMARY]}
              />
            }
          >
            {(() => {
              // For other modes, show API users (employees or active users)
              const filteredData = showEmployeesOnly
                ? employeesApi?.data
                : activeUsersApi?.data;
              const isEmpty = !filteredData || filteredData.length === 0;

              return (
                <ShadowView preset="listItem" disabled={isEmpty}>
                  <View
                    style={[styles.listCard, isEmpty && styles.listCardEmpty]}
                  >
                    <FlatList
                      data={filteredData}
                      scrollEnabled={false}
                      keyExtractor={item => item.UserId.toString()}
                      renderItem={({ item, index }) => (
                        <SearchUserItem
                          item={item}
                          index={index}
                          isLast={index === (filteredData?.length ?? 0) - 1}
                          updatedUsers={updatedUsers}
                          loadingUsers={loadingUsers}
                          handleAddUser={
                            showEmployeesOnly ? undefined : handleAddUser
                          }
                          showAddButton={!showEmployeesOnly}
                          tempAddedUserIds={tempAddedUserIds}
                          isGeneralSearchScreen={
                            !showFriendsOnly &&
                            !showConnectOnly &&
                            !showEmployeesOnly
                          }
                        />
                      )}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.listContainer}
                      ListEmptyComponent={
                        <View style={{ height: theme.sizes.HEIGHT * 0.7 }}>
                          <PlaceholderLogoText
                            text={getString('SEARCH_NO_USERS_FOUND')}
                          />
                        </View>
                      }
                    />
                  </View>
                </ShadowView>
              );
            })()}
          </ScrollView>
        )}
      </View>

      <ConfirmationPopup
        visible={unfriendModal.visible}
        title={getString('SEARCH_UNFRIEND_USER')}
        message={
          unfriendModal.isLinkedToGroup
            ? getString('SEARCH_USER_LINKED_TO_GROUPS_MESSAGE')
            : getString('SEARCH_ARE_YOU_SURE_UNFRIEND').replace(
              '{value}',
              unfriendModal.userName || '',
            )
        }
        confirmText={getString('SEARCH_YES')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={() =>
          unfriendModal.userId && unfriendUser(unfriendModal.userId)
        }
        onCancel={() => {
          setUnfriendModal(prev => ({ ...prev, visible: false }));
          setTimeout(
            () =>
              setUnfriendModal({
                visible: false,
                loading: false,
                userId: null,
                userName: null,
                isLinkedToGroup: false,
              }),
            300,
          );
        }}
        loading={unfriendModal.loading}
      />
    </ParentView>
  );
};

export default SearchScreen;
