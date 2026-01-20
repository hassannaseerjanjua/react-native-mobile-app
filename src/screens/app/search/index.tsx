import React, { useEffect, useState } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  Share,
  Platform,
  TouchableOpacity,
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
import fonts from '../../../assets/fonts';
import { scaleWithMax } from '../../../utils';
import useTheme from '../../../styles/theme';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';

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
    isLinkedToGroup: false,
  });
  const [tempAddedUserIds, setTempAddedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const { globalStyles } = useTheme();
  const [mobileContacts, setMobileContacts] = useState<ContactInfo[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState<
    Record<string, VerifiedUser>
  >({});
  const [verifyingContacts, setVerifyingContacts] = useState(false);

  const activeUsersApi = useListingApi<ActiveUser>(
    showEmployeesOnly ? '' : apiEndpoints.GET_ACTIVE_USERS,
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

  const employeesApi = useListingApi<ActiveUser>(
    showEmployeesOnly ? apiEndpoints.GET_EMPLOYEES : '',
    token,
    {
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
      loadMobileContacts();
    } else {
      setMobileContacts([]);
    }
  }, [showConnectOnly]);

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
    setVerifyingContacts(true);
    try {
      const contacts = await getContactsWithPhoneNumbers();
      setMobileContacts(contacts);

      // Extract and format phone numbers
      const phoneNumbers = contacts
        .flatMap(contact => contact.phoneNumbers)
        .map(formatPhoneNumber)
        .filter((phone, index, self) => self.indexOf(phone) === index); // Remove duplicates

      // Verify users
      if (phoneNumbers.length > 0) {
        const verified = await verifyUsers(phoneNumbers);
        setVerifiedUsers(verified);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      notify.error(getString('AU_ERROR_OCCURRED'));
    } finally {
      setLoadingContacts(false);
      setVerifyingContacts(false);
    }
  };

  const handleInviteContact = async (
    phoneNumber: string,
    contactName?: string,
  ) => {
    try {
      const formattedPhone = phoneNumber.replace(/[^\d]/g, ''); // Remove + and other chars

      // Generate invite message
      const inviteMessage = `🎁 Join me on Giftee! Download the app and let's exchange gifts.\n\nhttps://admin.giftee.hostinger.bitscollision.net/select-store?friendUserId=${user?.UserId || ''
        }&CityId=${user?.CityId || ''}&sendType=1`;

      // Use Share API to show bottom sheet with all sharing options
      const shareOptions = Platform.select({
        ios: {
          message: inviteMessage,
        },
        android: {
          message: inviteMessage,
          title: contactName
            ? `Invite ${contactName} to Giftee`
            : getString('C_INVITE') || 'Invite to Giftee',
        },
      }) || {
        message: inviteMessage,
        title: contactName
          ? `Invite ${contactName} to Giftee`
          : getString('C_INVITE') || 'Invite to Giftee',
      };

      await Share.share(shareOptions);
    } catch (error: any) {
      // Only show error if user didn't dismiss the share sheet
      if (error.message !== 'User did not share') {
        notify.error(
          getString('O_UNABLE_TO_OPEN_WHATSAPP') ||
          'Unable to share. Please try again.',
        );
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
        title={title || getString('FIND_PEOPLE')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={getString('HOME_SEARCH')}
        rightSideView={
          showFriendsOnly && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Search', {
                  showConnectOnly: true,
                })
              }
              style={{
                backgroundColor: theme.colors.SECONDARY,
                paddingHorizontal: scaleWithMax(10, 12),
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

      <View style={[styles.content, styles.contentContainer]}>
        <View style={styles.listCard}>
          {activeUsersApi.loading ||
            employeesApi.loading ||
            (showConnectOnly && (loadingContacts || verifyingContacts)) ? (
            <SkeletonLoader screenType="search" />
          ) : (
            (() => {
              // In connect mode, only show mobile contacts
              if (showConnectOnly) {
                // Map mobile contacts to ActiveUser format for display
                const mappedContacts: ActiveUser[] = mobileContacts.map(
                  (contact, index) => {
                    const phoneNo = contact.phoneNumbers[0] || '';
                    const formattedPhone = formatPhoneNumber(phoneNo);
                    const verified = verifiedUsers[formattedPhone];

                    return {
                      UserId:
                        verified?.IsAppUser && verified.UserID
                          ? verified.UserID
                          : -(index + 1), // Negative IDs for non-app users
                      FullName: contact.name,
                      PhoneNo: phoneNo,
                      Email: contact.emails[0] || '',
                      ProfileUrl: contact.thumbnail || null,
                      RelationStatus: verified?.IsAppUser ? 2 : 0, // 2 = not friend, 0 = not a user
                      IsVerified: verified?.IsAppUser ? true : false,
                    };
                  },
                );

                // Filter contacts by search query if needed
                const filteredContacts = mappedContacts.filter(contact => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    contact.FullName?.toLowerCase().includes(query) ||
                    contact.PhoneNo?.includes(query) ||
                    contact.Email?.toLowerCase().includes(query)
                  );
                });

                // const isEmpty =
                //   !filteredContacts || filteredContacts.length === 0;

                // if (isEmpty) {
                //   return (
                //     <View style={styles.loadingContainer}>
                //       <Text style={styles.loadingText}>
                //         {getString('SEARCH_NO_USERS_FOUND_TO_CONNECT')}
                //       </Text>
                //     </View>
                //   );
                // }

                return (
                  <FlatList
                    data={filteredContacts}
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
                          isLast={index === (filteredContacts?.length ?? 0) - 1}
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
                          // Pass custom button text for invite
                          customButtonText={!isAppUser ? 'Invite' : undefined}
                          onCustomButtonPress={
                            !isAppUser
                              ? () => handleContactAction(item)
                              : undefined
                          }
                        />
                      );
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <View style={styles.loadingContainer}>
                        <PlaceholderLogoText text={getString('SEARCH_NO_USERS_FOUND')} />
                      </View>
                    }
                    contentContainerStyle={styles.listContainer}
                    ListFooterComponent={
                      loadingContacts || verifyingContacts ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                          <Text>
                            {verifyingContacts
                              ? 'Verifying contacts...'
                              : 'Loading contacts...'}
                          </Text>
                        </View>
                      ) : null
                    }
                  />
                );
              }

              // For other modes, show API users (employees or active users)
              const filteredData = showEmployeesOnly
                ? employeesApi?.data
                : activeUsersApi?.data;
              // const isEmpty = !filteredData || filteredData.length === 0;

              // if (isEmpty) {
              //   return (
              //     <View style={styles.loadingContainer}>
              //       <Text style={styles.loadingText}>
              //         {searchQuery
              //           ? getString('SEARCH_NO_RESULTS_FOUND')
              //           : getString('SEARCH_NO_USERS_FOUND')}
              //       </Text>
              //     </View>
              //   );
              // }

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
                      handleAddUser={showEmployeesOnly ? undefined : handleAddUser}
                      showAddButton={!showEmployeesOnly}
                      tempAddedUserIds={tempAddedUserIds}
                      isGeneralSearchScreen={
                        !showFriendsOnly && !showConnectOnly && !showEmployeesOnly
                      }
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                  ListEmptyComponent={
                    <View style={styles.loadingContainer}>
                      <PlaceholderLogoText text={getString('SEARCH_NO_USERS_FOUND')} />
                    </View>
                  }
                  onEndReached={
                    showEmployeesOnly
                      ? employeesApi.loadMore
                      : activeUsersApi.loadMore
                  }
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
