import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import SkeletonLoader from '../../../components/SkeletonLoader';
import useStyles from './style';
import { useLocaleStore } from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';
import SearchUserItem from '../../../components/app/SearchUserItem';
import {
  GroupTabs,
  MemberSelectionModal,
} from '../../../components/send-a-gift';
import TabItem from '../../../components/global/TabItem';
import { ActiveUser, ActiveUsersApiResponse } from '../../../types';
import {
  SvgAddGroup,
  SvgFindFriendsIcon,
  SvgSearchFindFriendsIcon,
} from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import { useListingApi } from '../../../hooks/useListingApi';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';
import { scaleWithMax } from '../../../utils';
import CustomButton from '../../../components/global/Custombutton';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../../utils/api';
import useGetApi from '../../../hooks/useGetApi';
import { CartResponse } from '../../../types';
import notify from '../../../utils/notify';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> {}

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation, route }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [activeTab, setActiveTab] = useState('friends');
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const { user, token } = useAuthStore();

  // Fetch cart to check if there's an existing cart for a different user
  const cartApi = useGetApi<CartResponse>(apiEndpoints.GET_CART_ITEMS, {
    transformData: (data: any) => (data?.Data || data) as CartResponse,
  });

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
        // userId: user?.UserId,
        friends: activeTab === 'friends',
      },
    },
  );

  // Separate API for group creation modal - always uses friends: true
  const friendsForGroupApi = useListingApi<ActiveUser>(
    apiEndpoints.GET_ACTIVE_USERS,
    token,
    {
      idExtractor: (item: ActiveUser) => item.UserId,
      transformData: (data: ActiveUsersApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      extraParams: {
        // userId: user?.UserId,
        friends: true,
      },
    },
  );

  useEffect(() => {
    if (activeTab !== 'group') {
      // Clear search when switching tabs to avoid stale filtered data
      if (activeUsersApi.search) {
        activeUsersApi.setSearch('');
      }
      // Update params - the useListingApi hook will automatically refetch when extraParams change
      activeUsersApi.setExtraParams({
        // userId: user?.UserId,
        friends: activeTab === 'friends',
      });
    }
  }, [activeTab, user?.UserId]);

  useFocusEffect(
    useCallback(() => {
      // Reset to friends tab when screen comes into focus
      setActiveTab('friends');

      // Cleanup: Reset to friends tab when screen loses focus (navigating away)
      return () => {
        setActiveTab('friends');
      };
    }, []),
  );

  const handleTabChange = (tabId: string) => {
    // Clear search when switching tabs to ensure fresh data
    if (activeUsersApi.search) {
      activeUsersApi.setSearch('');
    }
    setActiveTab(tabId);
  };

  const tabs = [
    {
      id: 'friends',
      title: getString('SG_FRIENDS'),
      onPress: () => {
        handleTabChange('friends');
      },
    },
    {
      id: 'group',
      title: getString('SG_GROUP'),
      onPress: () =>
        navigation.navigate('SendToGroup' as any, {
          routeTo: route.params?.routeTo || 'SelectStore',
        }),
    },
    {
      id: 'others',
      title: getString('SG_OTHERS'),
      onPress: () => {
        handleTabChange('others');
      },
    },
  ];

  // Get frequently sent friends (first 3 from response with OrdersCount >= 1, in API order)
  const getFrequentlySentFriends = useCallback(() => {
    if (activeTab !== 'friends' || activeUsersApi.search) {
      return [];
    }

    const baseData = activeUsersApi.data || [];

    // Filter friends with OrdersCount >= 1, keep API response order, take first 3
    const frequentlySent = baseData
      .filter(
        (friend: ActiveUser) =>
          friend.OrdersCount !== null &&
          friend.OrdersCount !== undefined &&
          friend.OrdersCount >= 1,
      )
      .slice(0, 3);

    return frequentlySent;
  }, [activeTab, activeUsersApi.data, activeUsersApi.search]);

  const frequentlySentFriends = getFrequentlySentFriends();

  const getDisplayData = () => {
    const baseData = activeUsersApi.data || [];

    if (
      !activeUsersApi.search &&
      activeTab === 'friends' &&
      user &&
      (route.params?.routeTo === 'SelectStore' || !route.params?.routeTo)
    ) {
      const currentUser: ActiveUser = {
        UserId: user.UserId,
        FullName: `${
          user.FullNameEn || user.FullNameAr || getString('SG_USER_ME')
        }${getString('SG_ME')}`,
        Email: user.Email,
        PhoneNo: user.PhoneNo,
        ProfileUrl: user.ProfileUrl,
        RelationStatus: 1,
        CityId: user.CityId,
        IsVerified: user.IsVerified,
      };

      return [currentUser, ...baseData];
    }

    return baseData;
  };

  const displayData = getDisplayData();
  const isLoading = activeUsersApi.loading;
  const searchQuery = activeUsersApi.search;
  const setSearchQuery = activeUsersApi.setSearch;

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={
          route.params?.routeTo === 'SelectStore' || !route.params?.routeTo
            ? getString('HOME_SEND_A_GIFT')
            : getString('HOME_GIFT_ONE_GET_ONE')
        }
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={getString('HOME_SEARCH')}
        rightSideTitle={
          activeTab === 'friends' ? getString('SG_NEW_GROUP') : ''
        }
        rightSideTitlePress={() => {
          if (activeTab === 'friends') {
            friendsForGroupApi.recall();
            setIsMemberSelectionOpen(true);
          }
        }}
        rightSideIcon={activeTab === 'friends' ? <SvgAddGroup /> : undefined}
      />

      <View style={styles.content}>
        <ScrollView
          style={styles.scrollableContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <GroupTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={(tabId: string) => {
              const tab = tabs.find(t => t.id === tabId);
              tab?.onPress?.();
            }}
          />
          {(route.params?.routeTo === 'SelectStore' ||
            !route.params?.routeTo) && (
            <View style={[styles.tabContainer]}>
              <TabItem
                title={getString('SG_SEND_THROUGH_LINK')}
                TabTextStyles={{
                  color: theme.colors.PRIMARY,
                  maxWidth: '90%',
                }}
                onPress={() => {
                  navigation.navigate('SelectCity', {
                    sendType: 2,
                  });
                }}
                isLink={true}
              />
            </View>
          )}
          {/* Frequently Sent Section - Only show for friends tab with no search */}
          {frequentlySentFriends.length > 0 &&
            activeTab === 'friends' &&
            !activeUsersApi.search && (
              <View style={{ marginBottom: theme.sizes.HEIGHT * 0.016 }}>
                <Text style={styles.sectionTitle}>
                  {getString('SG_FREQUENTLY_GIFTED')}
                </Text>
                <View style={styles.listCard}>
                  <FlatList
                    data={frequentlySentFriends}
                    keyExtractor={item => `frequent-${item.UserId}`}
                    renderItem={({ item, index }) => (
                      <SearchUserItem
                        item={item}
                        index={index}
                        isLast={index === frequentlySentFriends.length - 1}
                        showAddButton={false}
                        showSelection={false}
                        onPress={async () => {
                          const selectedFriendUserId = item.UserId;

                          // Check if there's a cart for a different user
                          const existingCart = cartApi.data;
                          if (
                            existingCart &&
                            existingCart.FriendId !== null &&
                            existingCart.FriendId !== selectedFriendUserId &&
                            existingCart.Items &&
                            existingCart.Items.length > 0
                          ) {
                            // Clear the cart for the previous user to start fresh flow
                            const response = await api.put(
                              apiEndpoints.CLEAR_CART,
                              {},
                            );
                            if (!response.success) {
                              notify.error(
                                response.error ||
                                  getString('AU_ERROR_OCCURRED'),
                              );
                              return;
                            }
                          }

                          // Navigate to the next screen
                          if (
                            route.params?.routeTo === 'SelectStore' ||
                            !route.params?.routeTo
                          ) {
                            navigation.navigate('SelectStore', {
                              friendUserId: selectedFriendUserId,
                              friendName:
                                item.FullName.replace(getString('SG_ME'), '') ||
                                null,
                              CityId: item.CityId || user?.CityId || null,
                              sendType: 1,
                            });
                          } else {
                            navigation.navigate('CatchScreen', {
                              type: 'GiftOneGetOne',
                              friendUserId: selectedFriendUserId,
                              cityId: item?.CityId || null,
                            });
                          }
                        }}
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            )}

          <Text style={styles.sectionTitle}>
            {activeTab === 'friends'
              ? getString('SG_FRIENDS')
              : activeTab === 'group'
              ? getString('SG_GROUP')
              : getString('SG_OTHERS')}
          </Text>
          {isLoading ? (
            <View style={styles.listCard}>
              <SkeletonLoader screenType="sendAGift" />
            </View>
          ) : displayData.length > 1 ? (
            <View
              style={[
                styles.listCard,
                {
                  marginBottom:
                    route.params?.routeTo === 'SelectStore' ||
                    !route.params?.routeTo
                      ? theme.sizes.HEIGHT * 0.04
                      : theme.sizes.HEIGHT * 0.04,
                },
              ]}
            >
              <FlatList
                data={displayData}
                keyExtractor={item => item.UserId.toString()}
                renderItem={({ item, index }) => (
                  <SearchUserItem
                    item={item}
                    index={index}
                    isLast={index === displayData.length - 1}
                    showAddButton={false}
                    showSelection={false}
                    onPress={async () => {
                      const selectedFriendUserId = item.UserId;

                      // Check if there's a cart for a different user
                      const existingCart = cartApi.data;
                      if (
                        existingCart &&
                        existingCart.FriendId !== null &&
                        existingCart.FriendId !== selectedFriendUserId &&
                        existingCart.Items &&
                        existingCart.Items.length > 0
                      ) {
                        // Clear the cart for the previous user to start fresh flow
                        const response = await api.put(
                          apiEndpoints.CLEAR_CART,
                          {},
                        );
                        if (!response.success) {
                          notify.error(
                            response.error || getString('AU_ERROR_OCCURRED'),
                          );
                          return;
                        }
                      }

                      // Navigate to the next screen
                      if (
                        route.params?.routeTo === 'SelectStore' ||
                        !route.params?.routeTo
                      ) {
                        navigation.navigate('SelectStore', {
                          friendUserId: selectedFriendUserId,
                          friendName:
                            item.FullName.replace(getString('SG_ME'), '') ||
                            null,
                          CityId: item.CityId || user?.CityId || null,
                          sendType: 1,
                        });
                      } else {
                        navigation.navigate('CatchScreen', {
                          type: 'GiftOneGetOne',
                          friendUserId: selectedFriendUserId,
                          cityId: item?.CityId || null,
                        });
                      }
                    }}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                onEndReached={activeUsersApi.loadMore}
                onEndReachedThreshold={0.5}
              />
            </View>
          ) : (
            <View style={styles.noFriendsContainer}>
              <SvgFindFriendsIcon
                width={scaleWithMax(36, 40)}
                height={scaleWithMax(36, 40)}
              />
              <Text style={styles.noFriendsText}>
                {getString('SG_NO_FRIENDS_YET')}
              </Text>

              <CustomButton
                icon={<SvgSearchFindFriendsIcon />}
                title={getString('SG_FIND_FRIENDS')}
                onPress={() => {
                  navigation.navigate('Search', {
                    title: getString('SG_FIND_FRIENDS'),
                    // showConnectOnly: true,
                  });
                }}
                type="primary"
              />
            </View>
          )}
        </ScrollView>
      </View>

      <MemberSelectionModal
        visible={isMemberSelectionOpen}
        onClose={() => {
          setIsMemberSelectionOpen(false);
        }}
        existingMembers={[]}
        onSave={() => {}}
        title={getString('NG_ADD_MEMBERS')}
        listings={[
          {
            title: getString('SG_FREQUENTLY_GIFTED'),
            users: frequentlySentFriends,
          },
          {
            title: getString('NG_TITLE_FRIENDS'),
            users: friendsForGroupApi.data || [],
          },
        ]}
        isSendAGift={true}
      />
    </ParentView>
  );
};

export default SendAGiftScreen;
