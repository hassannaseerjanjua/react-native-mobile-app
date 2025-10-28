import React, { useState, useEffect } from 'react';
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

  const tabs = [
    {
      id: 'friends',
      title: 'Friends',
      onPress: () => {
        setActiveTab('friends');
      },
    },
    {
      id: 'group',
      title: 'Group',
      onPress: () => navigation.navigate('SendToGroup' as any),
    },
    {
      id: 'others',
      title: 'Others',
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
        FullName: `${user.FullNameEn || user.FullNameAr || 'User'} (Me)`,
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
            title="Send through a link"
            onPress={() => {}}
            isLink={true}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollableContent}
          contentContainerStyle={styles.scrollableContentContainer}
        >
          <Text style={styles.sectionTitle}>Friends</Text>
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
              <Text style={styles.noFriendsText}>No Friends yet</Text>

              <CustomButton
                icon={<SvgSearchFindFriendsIcon />}
                title="Find Friends"
                onPress={() => {
                  navigation.navigate('Search', {
                    title: 'Connect',
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
            title: 'Friends',
            users: activeUsersApi?.data || [],
          },
        ]}
        isSendAGift={true}
      />
    </ParentView>
  );
};

export default SendAGiftScreen;
