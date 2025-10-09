import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
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
import { SvgAddGroup } from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> {}

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
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

  const displayData = searchQuery
    ? searchFriendsApi.data || []
    : activeUsersApi.data || [];
  const isLoading = searchQuery
    ? searchFriendsApi.loading
    : activeUsersApi.loading;

  return (
    <ParentView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          overflow: 'visible',
        }}
        contentContainerStyle={{
          flex: 1,
        }}
      >
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
          rightSideTitle="New Group"
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
          <View style={styles.tabContainer}>
            <TabItem
              title="Send through a link"
              onPress={() => {}}
              isLink={true}
            />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Friends</Text>
            <View style={styles.listCard}>
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={theme.colors.PRIMARY}
                  style={{
                    paddingVertical: theme.sizes.HEIGHT * 0.02,
                  }}
                />
              ) : displayData.length > 0 ? (
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
              ) : (
                <Text style={styles.errorText}>
                  {searchQuery ? 'No results found' : 'No friends found'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

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
        title="Add Members"
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
