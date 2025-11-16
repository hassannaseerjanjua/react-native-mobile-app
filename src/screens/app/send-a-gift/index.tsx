import React, { useState, useEffect, useRef } from 'react';
import { View, StatusBar, FlatList, ScrollView } from 'react-native';
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
import {
  ActiveUser,
  ActiveUsersApiResponse,
  SearchFriendsApiResponse,
} from '../../../types';
import {
  SvgAddGroup,
  SvgFindFriendsIcon,
  SvgSearchFindFriendsIcon,
} from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';
import { scaleWithMax } from '../../../utils';
import CustomButton from '../../../components/global/Custombutton';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> {}

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const { user } = useAuthStore();
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const [isFetchingFriends, setIsFetchingFriends] = useState(true);

  // Use refs to access current values in the focus listener
  const activeTabRef = useRef(activeTab);
  const searchQueryRef = useRef(searchQuery);

  const activeUsersApi = useGetApi<ActiveUser[]>(
    apiEndpoints.GET_ACTIVE_USERS(
      user?.UserId,
      pageIndex,
      pageSize,
      isFetchingFriends,
    ),
    {
      transformData: (data: ActiveUsersApiResponse) => data.Data.Items || [],
    },
  );

  const activeUsersApiRefetchRef = useRef(activeUsersApi.refetch);

  // Update refs when values change
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    activeUsersApiRefetchRef.current = activeUsersApi.refetch;
  }, [activeUsersApi.refetch]);

  const searchFriendsApi = useGetApi<ActiveUser[]>(
    apiEndpoints.SEARCH_FRIENDS(searchQuery, user?.UserId),
    {
      transformData: (data: SearchFriendsApiResponse) => data.Data,
    },
  );

  console.log('activeUsersApi', activeUsersApi?.data);

  useEffect(() => {
    if (searchQuery) {
      searchFriendsApi.refetch();
    }
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery('');
    if (activeTab === 'friends') {
      setIsFetchingFriends(true);
    } else if (activeTab === 'others') {
      setIsFetchingFriends(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'group') {
      activeUsersApi.refetch();
    }
  }, [isFetchingFriends]);

  // Refetch friends list when screen comes into focus (e.g., after adding friends from Search screen)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refetch if not searching (search has its own refetch logic) and not on group tab
      // Use refs to access current values since listener closure captures initial values
      if (!searchQueryRef.current && activeTabRef.current !== 'group') {
        activeUsersApiRefetchRef.current();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const tabs = [
    {
      id: 'friends',
      title: getString('SG_FRIENDS'),
      onPress: () => {
        setActiveTab('friends');
      },
    },
    {
      id: 'group',
      title: getString('SG_GROUP'),
      onPress: () => navigation.navigate('SendToGroup' as any),
    },
    {
      id: 'others',
      title: getString('SG_OTHERS'),
      onPress: () => {
        setActiveTab('others');
      },
    },
  ];

  // Create display data with current user at the top
  const getDisplayData = () => {
    const baseData = searchQuery
      ? searchFriendsApi.data || []
      : activeUsersApi.data || [];

    // Only add current user to the top if we're not searching and user data is available
    if (!searchQuery && user) {
      const currentUser: ActiveUser = {
        UserId: user.UserId,
        FullName: `${
          user.FullNameEn || user.FullNameAr || getString('SG_USER_ME')
        }${getString('SG_ME')}`,
        Email: user.Email,
        PhoneNo: user.PhoneNo,
        ProfileUrl: user.ProfileUrl,
        RelationStatus: 1, // Set as already "added" since it's the current user
      };

      return [currentUser, ...baseData];
    }

    return baseData;
  };

  const displayData = getDisplayData();
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
        title={getString('HOME_SEND_A_GIFT')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={getString('HOME_SEARCH')}
        rightSideTitle={getString('SG_NEW_GROUP')}
        rightSideTitlePress={() => {
          setIsMemberSelectionOpen(true);
        }}
        rightSideIcon={<SvgAddGroup />}
      />

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <GroupTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={(tabId: string) => {
              const tab = tabs.find(t => t.id === tabId);
              tab?.onPress?.();
            }}
          />
        </View>
        <View
          style={[
            styles.tabContainer,
            { paddingHorizontal: theme.sizes.PADDING },
          ]}
        >
          <TabItem
            title={getString('SG_SEND_THROUGH_LINK')}
            onPress={() => {}}
            isLink={true}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollableContentContainer}
          contentContainerStyle={styles.scrollableContent}
        >
          <Text style={styles.sectionTitle}>{getString('SG_FRIENDS')}</Text>
          {isLoading ? (
            <View style={styles.listCard}>
              <SkeletonLoader screenType="sendAGift" />
            </View>
          ) : displayData.length > 1 ? (
            <View style={styles.listCard}>
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
                    onPress={() => {
                      navigation.navigate('SelectStore' as never);
                    }}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
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
                    title: getString('C_CONNECT'),
                    showConnectOnly: true,
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
        onSave={() => {
          // setIsMemberSelectionOpen(false);
          // navigation.navigate('SendToGroup' as any);
          console.log('Hellooo');
        }}
        title={getString('NG_ADD_MEMBERS')}
        listings={[
          {
            title: getString('NG_TITLE_FRIENDS'),
            users: activeUsersApi?.data || [],
          },
        ]}
        isSendAGift={true}
      />
    </ParentView>
  );
};

export default SendAGiftScreen;
