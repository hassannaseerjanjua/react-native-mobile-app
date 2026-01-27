import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ScrollView,
  Platform,
  Share,
  TouchableOpacity,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import SkeletonLoader from '../../../components/SkeletonLoader';
import useStyles from './style';
import { useLocaleStore } from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';
import SearchUserItem from '../../../components/app/SearchUserItem';
import MemberSelectionModal from '../../../components/global/MemberSelectionModal';
import GroupTabs from '../../../components/global/GroupTabs';
import TabItem from '../../../components/global/TabItem';
import { ActiveUser, ActiveUsersApiResponse, City } from '../../../types';
import {
  SvgAddGroup,
  SvgFindFriendsIcon,
  SvgSearchFindFriendsIcon,
  ArrowDownIcon,
} from '../../../assets/icons';
import CityPickerModal from '../../../components/global/CityPickerModal';
import { DropdownOption } from '../../../components/global/DropdownField';
import apiEndpoints from '../../../constants/api-endpoints';
import { useListingApi } from '../../../hooks/useListingApi';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';
import { scaleWithMax } from '../../../utils';
import CustomButton from '../../../components/global/Custombutton';
import fonts from '../../../assets/fonts';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../../utils/api';
import useGetApi from '../../../hooks/useGetApi';
import { CartResponse } from '../../../types';
import notify from '../../../utils/notify';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> { }

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation, route }) => {

  const isGiftOneGetOne = route.params?.routeTo === 'GiftOneGetOne';
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
  const { user, token } = useAuthStore();
  const isMerchant = user?.isMerchant === 1;
  const [activeTab, setActiveTab] = useState(isMerchant ? 'employees' : 'friends');
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    user?.CityId || null,
  );
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set(),
  );

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
        cityid: isMerchant && activeTab === 'others' ? selectedCityId : undefined,
      },
    },
  );


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

  const employeesApi = useListingApi<ActiveUser>(
    isMerchant ? apiEndpoints.GET_EMPLOYEES : '',
    token,
    {
      idExtractor: (item: ActiveUser) => item.UserId,
      transformData: (data: ActiveUsersApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
    },
  );

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: (data: any) => data?.Data?.cities ?? [],
  });

  const cityOptions: DropdownOption[] = useMemo(
    () =>
      (citiesApi.data || []).map(city => ({
        label:
          langCode === 'ar'
            ? city.CityNameAr || city.CityName
            : city.CityNameEn || city.CityName,
        value: city.CityID,
      })),
    [citiesApi.data, langCode],
  );

  const selectedCityOption: DropdownOption | null = useMemo(
    () => cityOptions.find(option => option.value === selectedCityId) || null,
    [cityOptions, selectedCityId],
  );

  useEffect(() => {
    if (activeTab !== 'group' && !isMerchant) {
      // Clear search when switching tabs to avoid stale filtered data
      if (activeUsersApi.search) {
        activeUsersApi.setSearch('');
      }
      // Update params - the useListingApi hook will automatically refetch when extraParams change
      activeUsersApi.setExtraParams({
        // userId: user?.UserId,
        friends: activeTab === 'friends',
      });
    } else if (isMerchant && activeTab === 'others') {
      // For merchant on others tab, update cityId param
      activeUsersApi.setExtraParams({
        cityid: selectedCityId,
        friends: false,

      });
    }
  }, [activeTab, user?.UserId, isMerchant, selectedCityId]);

  useFocusEffect(
    useCallback(() => {
      // Reset to appropriate tab when screen comes into focus
      setActiveTab(isMerchant ? 'employees' : 'friends');

      // Cleanup: Reset to appropriate tab when screen loses focus (navigating away)
      return () => {
        setActiveTab(isMerchant ? 'employees' : 'friends');
      };
    }, [isMerchant]),
  );

  const handleTabChange = (tabId: string) => {
    // Clear search when switching tabs to ensure fresh data
    if (activeUsersApi.search) {
      activeUsersApi.setSearch('');
    }
    setActiveTab(tabId);
    // Reset selection mode when switching tabs
    setIsSelectionMode(false);
    setSelectedUserIds(new Set());
  };

  const navigateWithSelectedUsers = (friendIds: number[]) => {
    if (friendIds.length === 0) return;

    // Navigate to the next screen
    if (
      route.params?.routeTo === 'SelectStore' ||
      !route.params?.routeTo
    ) {
      navigation.navigate('SelectStore', {
        friendUserId: isMerchant ? null : friendIds[0],
        FriendIds: isMerchant ? friendIds : undefined,
        friendName: null,
        CityId: user?.CityId || null,
        sendType: 1,
      });
    } else {
      navigation.navigate('CatchScreen', {
        type: 'GiftOneGetOne',
        friendUserId: isMerchant ? null : friendIds[0],
        FriendIds: isMerchant ? friendIds : undefined,
        cityId: null,
      });
    }
    // Reset selection mode after navigation
    setIsSelectionMode(false);
    setSelectedUserIds(new Set());
  };

  const handleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleFriendPress = async (item: ActiveUser) => {
    if (isMerchant && isSelectionMode) {
      handleUserSelection(item.UserId);
      return;
    }

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
      const response = await api.put(apiEndpoints.CLEAR_CART, {});
      if (!response.success) {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
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
        friendName: item.FullName.replace(getString('SG_ME'), '') || null,
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
  };

  const tabs = isMerchant
    ? [
      {
        id: 'employees',
        title: 'My Employees',
        onPress: () => {
          handleTabChange('employees');
        },
      },
      {
        id: 'others',
        title: getString('SG_OTHERS'),
        onPress: () => {
          handleTabChange('others');
        },
      },
    ]
    : [
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
  // Only for friends tab with no search
  const getFrequentlySentFriends = useCallback(() => {
    if (activeTab !== 'friends' || activeUsersApi.search) {
      return [];
    }
    const baseData = activeUsersApi.data || [];
    return baseData
      .filter(
        (friend: ActiveUser) =>
          friend.OrdersCount !== null &&
          friend.OrdersCount !== undefined &&
          friend.OrdersCount >= 1,
      )
      .slice(0, 3);
  }, [activeTab, activeUsersApi.data, activeUsersApi.search]);

  const frequentlySentFriends = getFrequentlySentFriends();

  const getDisplayData = () => {
    if (isMerchant && activeTab === 'employees') {
      return employeesApi.data || [];
    }

    const baseData = activeUsersApi.data || [];

    // Get frequently sent friend IDs to exclude from main list
    const frequentlySentFriendIds = new Set(
      frequentlySentFriends.map((friend: ActiveUser) => friend.UserId),
    );

    // Filter out frequently sent friends from base data to avoid duplicates
    const remainingFriends = baseData.filter(
      (friend: ActiveUser) => !frequentlySentFriendIds.has(friend.UserId),
    );

    // Build the final list (excluding frequently sent friends as they're in a separate section)
    let finalData: ActiveUser[] = [];

    // Add current user first if applicable
    if (
      !activeUsersApi.search &&
      activeTab === 'friends' &&
      user &&
      (route.params?.routeTo === 'SelectStore' || !route.params?.routeTo)
    ) {
      const currentUser: ActiveUser = {
        UserId: user.UserId,
        FullName: `${user.FullNameEn || user.FullNameAr || getString('SG_USER_ME')
          }${getString('SG_ME')}`,
        Email: user.Email,
        PhoneNo: user.PhoneNo,
        ProfileUrl: user.ProfileUrl,
        RelationStatus: 1,
        CityId: user.CityId,
        IsVerified: user.IsVerified,
      };
      finalData.push(currentUser);
    }

    // Add remaining friends (frequently sent friends are shown in separate section)
    finalData.push(...remainingFriends);

    return finalData;
  };

  const displayData = getDisplayData();
  const isLoading = isMerchant && activeTab === 'employees'
    ? employeesApi.loading
    : activeUsersApi.loading;
  const searchQuery = isMerchant && activeTab === 'employees'
    ? employeesApi.search
    : activeUsersApi.search;
  const setSearchQuery = isMerchant && activeTab === 'employees'
    ? employeesApi.setSearch
    : activeUsersApi.setSearch;

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
          !isMerchant && activeTab === 'friends' ? getString('SG_NEW_GROUP') : ''
        }
        rightSideTitlePress={() => {
          if (!isMerchant && activeTab === 'friends') {
            friendsForGroupApi.recall();
            setIsMemberSelectionOpen(true);
          }
        }}
        rightSideIcon={
          !isMerchant && activeTab === 'friends' ? <SvgAddGroup /> : undefined
        }
        rightSideView={
          isMerchant && activeTab === 'others' ? (
            <TouchableOpacity
              onPress={() => setShowCityPicker(true)}
              style={{
                width: theme.sizes.WIDTH * 0.48,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingHorizontal: theme.sizes.PADDING * 0.4,
                gap: scaleWithMax(4, 6),
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.FONTSIZE,
                  color: theme.colors.PRIMARY,
                  fontFamily: selectedCityOption
                    ? fonts.Quicksand.medium
                    : fonts.Quicksand.regular,
                }}
                numberOfLines={1}
              >
                {selectedCityOption
                  ? selectedCityOption.label
                  : getString('SELECT_STORE_SELECT_CITY') || 'Select City'}
              </Text>
              <ArrowDownIcon
                width={scaleWithMax(12, 14)}
                height={scaleWithMax(12, 14)}
                fill={theme.colors.PRIMARY}
              />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.content}>
        <ScrollView
          style={styles.scrollableContentContainer}
          contentContainerStyle={[
            {
              paddingHorizontal: theme.sizes.PADDING,
            },
            isMerchant && isSelectionMode
              ? { paddingBottom: scaleWithMax(60, 65) }
              : undefined,
          ]}
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
              <View>
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
                        isGeneralSearchScreen={false}
                        onPress={() => handleFriendPress(item)}
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            )}

          {displayData.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.sectionTitle}>
                {isMerchant && activeTab === 'employees'
                  ? 'My Employees'
                  : activeTab === 'friends'
                    ? getString('SG_FRIENDS')
                    : activeTab === 'group'
                      ? getString('SG_GROUP')
                      : getString('SG_OTHERS')}
              </Text>
              {isMerchant && (
                <TouchableOpacity
                  onPress={() => {
                    if (isSelectionMode) {
                      setIsSelectionMode(false);
                      setSelectedUserIds(new Set());
                    } else {
                      setIsSelectionMode(true);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: theme.sizes.FONTSIZE,
                      color: theme.colors.PRIMARY,
                      fontFamily: fonts.Quicksand.bold,
                    }}
                  >
                    {isSelectionMode ? 'Cancel' : 'Select'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {isLoading ? (
            <View style={styles.listCard}>
              <SkeletonLoader screenType="sendAGift" />
            </View>
          ) : displayData.length > (isGiftOneGetOne ? 0 : 1) ? (
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
                    showSelection={isMerchant && isSelectionMode}
                    isSelected={selectedUserIds.has(item.UserId)}
                    onSelectionPress={() => handleUserSelection(item.UserId)}
                    onPress={() => handleFriendPress(item)}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                onEndReached={
                  isMerchant && activeTab === 'employees'
                    ? employeesApi.loadMore
                    : activeUsersApi.loadMore
                }
                onEndReachedThreshold={0.5}
              />
            </View>
          ) : isMerchant ? (
            <View style={{ height: theme.sizes.HEIGHT * 0.5 }}>
              <PlaceholderLogoText text="No Users Found" />
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
        onSave={() => { }}
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

      <CityPickerModal
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        options={cityOptions}
        selectedValue={selectedCityId}
        onSelect={(value) => {
          setSelectedCityId(value as number | null);
          setShowCityPicker(false);
        }}
        title={getString('SELECT_STORE_SELECT_CITY') || 'Select City'}
      />

      {isMerchant && isSelectionMode && (
        <View
          style={{
            position: 'absolute',
            bottom: scaleWithMax(25, 30),
            left: theme.sizes.PADDING,
            right: theme.sizes.PADDING,
          }}
        >
          <CustomButton
            title={
              getString("NG_NEXT")
            }
            onPress={() => {
              const friendIds = Array.from(selectedUserIds);
              if (friendIds.length > 0) {
                // Check if there's a cart for a different user
                const existingCart = cartApi.data;
                if (
                  existingCart &&
                  existingCart.FriendId !== null &&
                  existingCart.Items &&
                  existingCart.Items.length > 0
                ) {
                  // Clear the cart for the previous user to start fresh flow
                  api.put(apiEndpoints.CLEAR_CART, {}).then(
                    response => {
                      if (response.success) {
                        navigateWithSelectedUsers(friendIds);
                      } else {
                        notify.error(
                          response.error ||
                          getString('AU_ERROR_OCCURRED'),
                        );
                      }
                    },
                  );
                } else {
                  navigateWithSelectedUsers(friendIds);
                }
              } else {
                notify.error('Please select at least one user');
              }
            }}
            type="primary"
            disabled={selectedUserIds.size === 0}
            buttonStyle={{
              opacity: selectedUserIds.size === 0 ? 0.5 : 1,
            }}
          />
        </View>
      )}
    </ParentView>
  );
};

export default SendAGiftScreen;
