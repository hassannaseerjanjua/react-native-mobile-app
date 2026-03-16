import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ScrollView,
  Platform,
  Share,
  TouchableOpacity,
  ActivityIndicator,
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
import ShadowView from '../../../components/global/ShadowView';
import {
  ActiveUser,
  ActiveUsersApiResponse,
  City,
  getGroupsDataApiResponse,
  GroupData,
} from '../../../types';
import {
  SvgAddGroup,
  SvgEditGroup,
  SvgFindFriendsIcon,
  SvgSearchFindFriendsIcon,
  ArrowDownIcon,
  SvgCancelIcon,
} from '../../../assets/icons';
import CityPickerModal from '../../../components/global/CityPickerModal';
import { DropdownOption } from '../../../components/global/DropdownField';
import apiEndpoints from '../../../constants/api-endpoints';
import { useListingApi } from '../../../hooks/useListingApi';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';
import { scaleWithMax } from '../../../utils';
import CustomButton from '../../../components/global/Custombutton';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../../utils/api';
import useGetApi from '../../../hooks/useGetApi';
import { CartResponse } from '../../../types';
import notify from '../../../utils/notify';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> { }

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation, route }) => {
  const isGiftOneGetOne = route.params?.routeTo === 'GiftOneGetOne';
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
  const { user, token } = useAuthStore();
  const isMerchant = user?.isMerchant === 1;
  const [activeTab, setActiveTab] = useState(
    isMerchant ? 'employees' : 'friends',
  );
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    user?.CityId || null,
  );
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<
    ActiveUser[]
  >([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(
    null,
  );
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch cart to check if there's an existing cart for a different user
  const cartApi = useGetApi<CartResponse>(apiEndpoints.GET_CART_ITEMS, {
    transformData: (data: any) => (data?.Data || data) as CartResponse,
  });

  const activeUsersApi = useListingApi<ActiveUser>(
    apiEndpoints.GET_ACTIVE_USERS,
    token,
    {
      pageSize: 30,
      idExtractor: (item: ActiveUser) => item.UserId,
      transformData: (data: ActiveUsersApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      extraParams: {
        // userId: user?.UserId,
        friends: activeTab === 'friends',
        cityid:
          isMerchant && activeTab === 'others' ? selectedCityId : undefined,
      },
    },
  );

  const friendsForGroupApi = useListingApi<ActiveUser>(
    apiEndpoints.GET_ACTIVE_USERS,
    token,
    {
      pageSize: 30,
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

  const getGroupsData = useListingApi<GroupData>(
    apiEndpoints.GET_GROUPS,
    token,
    {
      pageSize: 30,
      transformData: (data: getGroupsDataApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      idExtractor: (item: GroupData) => item.UserGroupId,
    },
  );

  const employeesApi = useListingApi<ActiveUser>(
    isMerchant ? apiEndpoints.GET_EMPLOYEES : '',
    token,
    {
      pageSize: 30,
      idExtractor: (item: ActiveUser) => item.UserId,
      transformData: (data: ActiveUsersApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      extraParams: {
        cityId: selectedCityId,
      },
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

  // Update employees API extraParams when city changes or when switching to employees tab
  useEffect(() => {
    if (isMerchant && activeTab === 'employees') {
      employeesApi.setExtraParams({
        cityId: selectedCityId,
      });
    }
  }, [selectedCityId, isMerchant, activeTab]);

  const handleTabChange = (tabId: string) => {
    // Clear search when switching tabs to ensure fresh data
    if (activeUsersApi.search) {
      activeUsersApi.setSearch('');
    }
    if (tabId !== 'group') {
      setSelectedGroupMembers([]);
      setSelectedGroupName(null);
      setSelectedGroup(null);
      setIsEditGroupOpen(false);
    }
    setActiveTab(tabId);
    // Reset selection mode when switching tabs
    setIsSelectionMode(false);
    setSelectedUserIds(new Set());
  };

  const getGroupMembersData = (): ActiveUser[] => {
    if (!selectedGroup) return [];
    return selectedGroup.UserGroupMembersList.map(member => ({
      UserId: member.UserId,
      FullName: member.FullName,
      Email: '',
      PhoneNo: '',
      ProfileUrl: member.ProfileUrl,
      CityId: member.CityId,
      RelationStatus: member.RelationStatus ?? 0,
      IsVerified: member.IsVerified || false,
    }));
  };

  const handleEditGroup = (group: GroupData) => {
    setSelectedGroup(group);
    friendsForGroupApi.recall();
    setIsMemberSelectionOpen(true);
  };

  const handleDeleteGroup = (group: GroupData) => {
    setGroupToDelete(group);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;
    const group = groupToDelete;
    setShowDeleteModal(false);
    api
      .delete(apiEndpoints.DELETE_GROUP, {
        params: {
          groupId: group.UserGroupId,
        },
      })
      .then(async response => {
        if (response.success) {
          setGroupToDelete(null);
          setIsEditGroupOpen(false);
          getGroupsData.setData([]);
          getGroupsData.recall();
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(error => {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      });
  };

  const handleCreateGroup = (
    selectedMembers: ActiveUser[],
    groupName?: string,
    groupImage?: { uri: string; type: string; name: string } | null,
  ) => {
    getGroupsData.recall();
  };

  const handleSaveGroupMembers = (
    selectedMembers: ActiveUser[],
    groupName?: string,
    groupImage?: { uri: string; type: string; name: string } | null,
  ) => {
    if (!selectedGroup) return;

    const originalMemberIds = getGroupMembersData().map(m => m.UserId);
    const newMemberIds = selectedMembers.map(m => m.UserId);
    const addedMemberIds = newMemberIds.filter(
      id => !originalMemberIds.includes(id),
    );
    const removedMemberIds = originalMemberIds.filter(
      id => !newMemberIds.includes(id),
    );

    const formData = new FormData();
    formData.append('UserGroupId', selectedGroup.UserGroupId.toString());
    formData.append('NameEn', groupName || selectedGroup.GroupName);

    if (groupImage) {
      formData.append('File', {
        uri: groupImage.uri,
        type: groupImage.type,
        name: groupImage.name,
      } as any);
    }

    addedMemberIds.forEach(id => {
      formData.append('MemberUserIds', id.toString());
    });

    removedMemberIds.forEach(id => {
      formData.append('RemovedMemberUserIds', id.toString());
    });

    api
      .put(apiEndpoints.EDIT_GROUP_MEMBERS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(response => {
        if (response.success) {
          getGroupsData.recall();
          setIsEditGroupOpen(false);
          setIsMemberSelectionOpen(false);
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(error => {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      });
  };

  const navigateWithSelectedUsers = (friendIds: number[]) => {
    if (friendIds.length === 0) return;

    // Navigate to the next screen
    if (route.params?.routeTo === 'SelectStore' || !route.params?.routeTo) {
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

  const MAX_SELECTION_LIMIT = 10;

  const handleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        // Selecting - check limit
        if (newSet.size >= MAX_SELECTION_LIMIT) {
          notify.error(
            getString('SEND_GIFT_MAX_SELECTION_LIMIT').replace(
              '{count}',
              String(MAX_SELECTION_LIMIT),
            ),
          );
          return prev;
        }
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
    if (route.params?.routeTo === 'SelectStore' || !route.params?.routeTo) {
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
        title: getString('SEND_GIFT_MY_EMPLOYEES'),
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
        onPress: () => {
          handleTabChange('group');
        },
      },
      {
        id: 'others',
        title: getString('SG_OTHERS'),
        onPress: () => {
          handleTabChange('others');
        },
      },
    ];

  // Get frequently sent friends (first 3 with OrdersCount >= 1, in API order)
  const filterFrequentlySentFriends = useCallback((baseData: ActiveUser[]) => {
    return baseData
      .filter(
        (friend: ActiveUser) =>
          friend.OrdersCount !== null &&
          friend.OrdersCount !== undefined &&
          friend.OrdersCount >= 1,
      )
      .slice(0, 3);
  }, []);

  const frequentlySentFriends =
    activeTab === 'friends' && !activeUsersApi.search && !activeUsersApi.loading
      ? filterFrequentlySentFriends(activeUsersApi.data || [])
      : [];

  const frequentlySentFriendsForGroupModal = filterFrequentlySentFriends(
    friendsForGroupApi.data || [],
  );

  // Delay "search applied" by 400ms to avoid flicker - keeps "me" and empty state text in sync until search completes
  const [effectiveSearchForHideMe, setEffectiveSearchForHideMe] = useState('');
  const effectiveSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  useEffect(() => {
    const search = activeUsersApi.search;
    if (search) {
      if (effectiveSearchTimerRef.current) {
        clearTimeout(effectiveSearchTimerRef.current);
      }
      effectiveSearchTimerRef.current = setTimeout(() => {
        setEffectiveSearchForHideMe(search);
        effectiveSearchTimerRef.current = null;
      }, 400);
    } else {
      if (effectiveSearchTimerRef.current) {
        clearTimeout(effectiveSearchTimerRef.current);
        effectiveSearchTimerRef.current = null;
      }
      setEffectiveSearchForHideMe('');
    }
    return () => {
      if (effectiveSearchTimerRef.current) {
        clearTimeout(effectiveSearchTimerRef.current);
      }
    };
  }, [activeUsersApi.search]);

  // Only use effectiveSearchForHideMe - don't use loading, else "me" briefly appears when modifying an existing search
  const keepMeVisibleForSearch = !effectiveSearchForHideMe;

  const getDisplayData = () => {
    if (!isMerchant && activeTab === 'group') {
      return [];
    }
    if (isMerchant && activeTab === 'employees') {
      return employeesApi.data || [];
    }

    const baseData = activeUsersApi.data || [];

    // Determine if "me" should be shown (keep visible during debounce + loading)
    const shouldShowMe =
      keepMeVisibleForSearch &&
      activeTab === 'friends' &&
      user &&
      (route.params?.routeTo === 'SelectStore' || !route.params?.routeTo);

    // Build the final list
    let finalData: ActiveUser[] = [];

    // Add current user first if applicable
    if (shouldShowMe) {
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

    // Add all friends (including frequently sent friends)
    finalData.push(...baseData);

    return finalData;
  };

  const displayData = getDisplayData();

  const isLoading =
    activeTab === 'group'
      ? getGroupsData.loading
      : isMerchant && activeTab === 'employees'
        ? employeesApi.loading
        : activeUsersApi.loading;
  const getRelevantApi = () =>
    activeTab === 'group'
      ? getGroupsData
      : isMerchant && activeTab === 'employees'
        ? employeesApi
        : activeUsersApi;
  const searchQuery =
    activeTab === 'group'
      ? getGroupsData.search
      : isMerchant && activeTab === 'employees'
        ? employeesApi.search
        : activeUsersApi.search;
  const setSearchQuery =
    activeTab === 'group'
      ? getGroupsData.setSearch
      : isMerchant && activeTab === 'employees'
        ? employeesApi.setSearch
        : activeUsersApi.setSearch;

  // Determine if "me" should be shown (same logic as in getDisplayData)
  const shouldShowMe =
    keepMeVisibleForSearch &&
    activeTab === 'friends' &&
    user &&
    (route.params?.routeTo === 'SelectStore' || !route.params?.routeTo);

  // Get base friends count (excluding "me")
  const baseFriendsCount =
    isMerchant && activeTab === 'employees'
      ? (employeesApi.data || []).length
      : (activeUsersApi.data || []).length;

  // Check if we should show the list (has friends OR "me" is shown)
  const shouldShowList = activeTab !== 'group' && displayData.length > 0;

  // Check if we should show empty state
  // Show empty state when: not merchant, not loading, no data to display, and on friends tab
  // Require isInitialLoad so we don't flash "no friends" before data has loaded (like checkout)
  const shouldShowEmptyState =
    !isMerchant &&
    !isLoading &&
    !shouldShowList &&
    activeTab === 'friends' &&
    activeUsersApi.isInitialLoad;

  // Show no friends container on Others tab when search result is empty
  const shouldShowOthersEmptyState =
    !isMerchant &&
    !isLoading &&
    !shouldShowList &&
    activeTab === 'others' &&
    activeUsersApi.isInitialLoad &&
    (activeUsersApi.data || []).length === 0;

  // Text for empty state: use effectiveSearchForHideMe to sync with "me" visibility - no immediate text change
  const noFriendsEmptyText =
    shouldShowOthersEmptyState ||
      (shouldShowEmptyState && !!effectiveSearchForHideMe)
      ? getString('SEARCH_NO_RESULTS_FOUND')
      : getString('SG_NO_FRIENDS_YET');

  // Don't show skeleton during search loading on friends tab - keep "me" / empty state visible until API returns
  const skipSkeletonForSearchTransition =
    !isMerchant &&
    activeTab === 'friends' &&
    !!activeUsersApi.search &&
    activeUsersApi.loading;

  const shouldRefetchFriendsRef = useRef(false);

  const handleFindFriendsPress = useCallback(() => {
    shouldRefetchFriendsRef.current = true;
    navigation.navigate('Search', {
      title: getString('SG_FIND_FRIENDS'),
    });
  }, [navigation, getString]);

  useFocusEffect(
    useCallback(() => {
      if (shouldRefetchFriendsRef.current) {
        shouldRefetchFriendsRef.current = false;
        activeUsersApi.recall();
        friendsForGroupApi.recall();
      }
    }, [activeUsersApi, friendsForGroupApi]),
  );

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
          !isMerchant && (activeTab === 'friends' || activeTab === 'group')
            ? getString('SG_NEW_GROUP')
            : ''
        }
        rightSideTitlePress={() => {
          if (
            !isMerchant &&
            (activeTab === 'friends' || activeTab === 'group')
          ) {
            friendsForGroupApi.recall();
            setIsCreateGroupOpen(true);
          }
        }}
        rightSideIcon={
          !isMerchant && (activeTab === 'friends' || activeTab === 'group') ? (
            <SvgAddGroup />
          ) : undefined
        }
        rightSideView={
          isMerchant ? (
            <TouchableOpacity
              onPress={() => setShowCityPicker(true)}
              style={{
                width: theme.sizes.WIDTH * 0.48,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                // paddingHorizontal: theme.sizes.PADDING * 0.4,
                gap: scaleWithMax(4, 6),
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.FONTSIZE,
                  color: theme.colors.PRIMARY,
                  fontFamily: selectedCityOption
                    ? theme.fonts.medium
                    : theme.fonts.regular,
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
          contentContainerStyle={{
            paddingHorizontal: theme.sizes.PADDING,
            paddingBottom:
              isMerchant && isSelectionMode
                ? scaleWithMax(60, 65)
                : theme.sizes.HEIGHT * 0.025,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={300}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const threshold = layoutMeasurement.height * 0.5;
            const nearBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - threshold;
            if (!nearBottom) return;
            if (activeTab === 'group') {
              getGroupsData.loadMore();
              return;
            }
            if (isMerchant && activeTab === 'employees') {
              employeesApi.loadMore();
            } else {
              activeUsersApi.loadMore();
            }
          }}
        >
          <View>
            <GroupTabs
              tabStyle={{ paddingVertical: 0 }}
              tabs={tabs}
              activeTab={activeTab}
              onTabPress={(tabId: string) => {
                const tab = tabs.find(t => t.id === tabId);
                tab?.onPress?.();
              }}
            />
          </View>

          {!isMerchant && activeTab === 'group' && (
            <View style={{ marginHorizontal: -theme.sizes.PADDING }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: theme.sizes.PADDING,
                }}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      paddingBottom: 0,
                    },
                  ]}
                >
                  {getString('SG_GROUP')}
                </Text>
                {(getGroupsData.data || []).length > 0 && (
                  <TouchableOpacity
                    onPress={() => setIsEditGroupOpen(prev => !prev)}
                    activeOpacity={0.7}
                    hitSlop={8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.sizes.PADDING * 0.1,
                    }}
                  >
                    {!isEditGroupOpen ? (
                      <SvgEditGroup
                        width={scaleWithMax(13, 15)}
                        height={scaleWithMax(13, 15)}
                      />
                    ) : (
                      <SvgCancelIcon
                        width={scaleWithMax(13, 15)}
                        height={scaleWithMax(13, 15)}
                      />
                    )}
                    {/* <Text
                      style={{
                        fontFamily: theme.fonts.semibold,
                        fontSize: theme.sizes.FONTSIZE_MEDIUM,
                        color: theme.colors.PRIMARY,
                        marginStart: theme.sizes.PADDING * 0.1,
                      }}
                    >
                      {isEditGroupOpen
                        ? getString('NG_CANCEL')
                        : getString('STG_EDIT_GROUP')}
                    </Text> */}
                  </TouchableOpacity>
                )}
              </View>

              {getGroupsData.loading ? (
                <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
                  <SkeletonLoader screenType="sendToGroup" />
                </View>
              ) : (
                <FlatList
                  data={getGroupsData.data || []}
                  keyExtractor={item => item.UserGroupId.toString()}
                  renderItem={({ item: group }) => (
                    <TabItem
                      isGroupImage={
                        group.ImageUrl ||
                        require('../../../assets/images/img-placeholder.png')
                      }
                      title={group.GroupName}
                      onPress={
                        isEditGroupOpen
                          ? () => handleEditGroup(group)
                          : () => {
                            setSelectedGroup(group);
                            setSelectedGroupName(group.GroupName);
                            setIsViewMembersOpen(true);
                          }
                      }
                      isEditGroup={isEditGroupOpen}
                      TabItemStyles={styles.TabItem}
                      onDeletePress={() => handleDeleteGroup(group)}
                      onEditPress={() => handleEditGroup(group)}
                    />
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.tabSpacing} />
                  )}
                  ListEmptyComponent={
                    <View style={{ height: theme.sizes.HEIGHT * 0.63 }}>
                      <PlaceholderLogoText
                        text={getString('STG_NO_GROUP_FOUND')}
                      />
                    </View>
                  }
                  ListFooterComponent={
                    getGroupsData.loadingMore ? (
                      <View
                        style={{
                          paddingVertical: theme.sizes.HEIGHT * 0.02,
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
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: theme.sizes.PADDING,
                    marginTop: theme.sizes.HEIGHT * 0.008,
                    paddingBottom: theme.sizes.HEIGHT * 0.02,
                  }}
                />
              )}
            </View>
          )}
          {(route.params?.routeTo === 'SelectStore' ||
            !route.params?.routeTo) &&
            activeTab !== 'group' && (
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
                <ShadowView preset="listItem">
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
                </ShadowView>
              </View>
            )}

          {activeTab !== 'group' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.sectionTitle}>
                {isMerchant && activeTab === 'employees'
                  ? getString('SEND_GIFT_MY_EMPLOYEES')
                  : activeTab === 'friends'
                    ? getString('SG_FRIENDS')
                    : activeTab === 'group'
                      ? getString('SG_GROUP')
                      : activeTab === 'others'
                        ? getString('SG_OTHERS')
                        : ''}
              </Text>
              {isMerchant &&
                employeesApi?.data &&
                employeesApi?.data?.length > 1 && (
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
                        fontFamily: theme.fonts.semibold,
                      }}
                    >
                      {isSelectionMode
                        ? getString('SEND_GIFT_CANCEL')
                        : getString('SEND_GIFT_SELECT')}
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          )}
          {activeTab !== 'group' &&
            (isLoading || !getRelevantApi()?.isInitialLoad) &&
            !skipSkeletonForSearchTransition ? (
            <ShadowView preset="listItem">
              <View style={[styles.listCard]}>
                <SkeletonLoader screenType="sendAGift" />
              </View>
            </ShadowView>
          ) : shouldShowList ? (
            <>
              <ShadowView
                preset="listItem"
                style={[
                  styles.listCard,
                  {
                    marginBottom: theme.sizes.HEIGHT * 0.025,
                  },
                ]}
              >
                <View>
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
                        onSelectionPress={() =>
                          handleUserSelection(item.UserId)
                        }
                        onPress={() => handleFriendPress(item)}
                        selectionDisabled={
                          isMerchant &&
                          isSelectionMode &&
                          selectedUserIds.size >= MAX_SELECTION_LIMIT &&
                          !selectedUserIds.has(item.UserId)
                        }
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    scrollEnabled={false}
                  />
                </View>
              </ShadowView>
              {!isMerchant &&
                activeTab === 'friends' &&
                !effectiveSearchForHideMe &&
                baseFriendsCount === 0 &&
                shouldShowMe && (
                  <View
                    style={[
                      styles.noFriendsFooter,
                      {
                        marginTop: theme.sizes.HEIGHT * 0.1,
                      },
                    ]}
                  >
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
                      onPress={handleFindFriendsPress}
                      type="primary"
                    />
                  </View>
                )}
            </>
          ) : isMerchant ? (
            <View style={{ height: theme.sizes.HEIGHT * 0.6 }}>
              <PlaceholderLogoText
                text={getString('SEND_GIFT_NO_USERS_FOUND')}
              />
            </View>
          ) : shouldShowEmptyState || shouldShowOthersEmptyState ? (
            <View
              style={[
                styles.noFriendsContainer,
                isGiftOneGetOne && {
                  paddingTop: theme.sizes.HEIGHT * 0.22,
                },
              ]}
            >
              <SvgFindFriendsIcon
                width={scaleWithMax(36, 40)}
                height={scaleWithMax(36, 40)}
              />
              <Text style={styles.noFriendsText}>{noFriendsEmptyText}</Text>

              <CustomButton
                icon={<SvgSearchFindFriendsIcon />}
                title={getString('SG_FIND_FRIENDS')}
                onPress={handleFindFriendsPress}
                type="primary"
              />
            </View>
          ) : null}
        </ScrollView>
      </View>

      <MemberSelectionModal
        visible={isMemberSelectionOpen}
        onClose={() => setIsMemberSelectionOpen(false)}
        existingMembers={getGroupMembersData()}
        onSave={handleSaveGroupMembers}
        title={getString('STG_EDIT_GROUP_MEMBERS')}
        existingGroupImage={selectedGroup?.ImageUrl}
        existingGroupName={selectedGroup?.GroupName}
        listings={[
          {
            users: [
              ...getGroupMembersData(),
              ...(friendsForGroupApi?.data || []),
            ].filter(
              (user, index, self) =>
                index === self.findIndex(u => u.UserId === user.UserId),
            ),
          },
        ]}
      />

      <MemberSelectionModal
        visible={isViewMembersOpen}
        onClose={() => setIsViewMembersOpen(false)}
        existingMembers={getGroupMembersData()}
        onSave={() => { }}
        title={selectedGroup?.GroupName || getString('STG_GROUP_MEMBERS')}
        listings={[
          {
            users: getGroupMembersData(),
          },
        ]}
        viewOnly={true}
        routeTo={route.params?.routeTo}
      />

      <MemberSelectionModal
        visible={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        existingMembers={[]}
        onSave={handleCreateGroup}
        title={getString('NG_ADD_MEMBERS')}
        onFindFriendsNavigate={() => {
          shouldRefetchFriendsRef.current = true;
        }}
        listings={[
          ...(frequentlySentFriendsForGroupModal.length > 0
            ? [
              {
                title: getString('SG_FREQUENTLY_GIFTED'),
                users: frequentlySentFriendsForGroupModal,
              },
            ]
            : []),
          {
            title: getString('NG_TITLE_FRIENDS'),
            users: friendsForGroupApi.data || [],
            emptyState: 'noFriends' as const,
          },
        ]}
        isSendAGift={true}
      />

      <ConfirmationPopup
        visible={showDeleteModal}
        title={getString('STG_DELETE_GROUP')}
        message={getString('STG_DELETE_GROUP_CONFIRM').replace(
          '{value}',
          groupToDelete?.GroupName || '',
        )}
        confirmText={getString('STG_DELETE')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={confirmDeleteGroup}
        onCancel={() => {
          setShowDeleteModal(false);
          setTimeout(() => setGroupToDelete(null), 300);
        }}
      />

      <CityPickerModal
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        options={cityOptions}
        selectedValue={selectedCityId}
        onSelect={value => {
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
            title={`${getString('NG_NEXT')} (${selectedUserIds.size
              }/${MAX_SELECTION_LIMIT})`}
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
                  api.put(apiEndpoints.CLEAR_CART, {}).then(response => {
                    if (response.success) {
                      navigateWithSelectedUsers(friendIds);
                    } else {
                      notify.error(
                        response.error || getString('AU_ERROR_OCCURRED'),
                      );
                    }
                  });
                } else {
                  navigateWithSelectedUsers(friendIds);
                }
              } else {
                notify.error(getString('SEND_GIFT_SELECT_AT_LEAST_ONE_USER'));
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
