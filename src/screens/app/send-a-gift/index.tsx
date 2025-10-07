import React, { useState } from 'react';
import { View, Text, StatusBar, FlatList, ScrollView } from 'react-native';
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
import { ActiveUser, ActiveUsersApiResponse } from '../../../types';
import { SvgAddGroup } from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useAuthStore } from '../../../store/reducer/auth';

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
  const activeUsersApi = useGetApi<ActiveUser[]>(
    apiEndpoints.GET_ACTIVE_USERS(user?.UserId, pageIndex, pageSize, true),
    {
      transformData: (data: ActiveUsersApiResponse) => data.Data.Items || [],
    },
  );

  console.log('activeUsersApi', activeUsersApi?.data);

  const tabs = [
    { id: 'friends', title: 'Friends' },
    { id: 'group', title: 'Group' },
    { id: 'others', title: 'Others' },
  ];

  const handleTabPress = (tabId: string) => {
    if (tabId === 'group') {
      navigation.navigate('SendToGroup' as any, {
        groupName: 'My Group',
        selectedUserIds: [],
      });
    } else {
      setActiveTab(tabId);
    }
  };

  const handleOpenMemberSelection = () => {
    setIsMemberSelectionOpen(true);
  };

  const handleSaveMembers = (selectedMembers: ActiveUser[]) => {
    const selectedUserIds = selectedMembers.map(user => user.UserId);
    setSelectedUsers(new Set(selectedUserIds));
    setIsMemberSelectionOpen(false);
  };

  const handleNavigateToGroup = (
    groupName: string,
    selectedUserIds: number[],
  ) => {
    setIsMemberSelectionOpen(false);
    navigation.navigate('SendToGroup' as any, {
      groupName,
      selectedUserIds,
    });
  };

  const handleCloseMemberSelection = () => {
    setIsMemberSelectionOpen(false);
  };

  const frequentlySentUsers: ActiveUser[] = [
    {
      UserId: 1,
      FullName: 'John Doe',
      Email: 'john.doe@example.com',
      PhoneNo: '+1234567890',
      ProfileUrl: 'https://i.pravatar.cc/150?img=1',
      RelationStatus: 1,
    },
    {
      UserId: 2,
      FullName: 'Jane Smith',
      Email: 'jane.smith@example.com',
      PhoneNo: '+1234567891',
      ProfileUrl: 'https://i.pravatar.cc/150?img=2',
      RelationStatus: 1,
    },
    {
      UserId: 3,
      FullName: 'Mike Johnson',
      Email: 'mike.johnson@example.com',
      PhoneNo: '+1234567892',
      ProfileUrl: 'https://i.pravatar.cc/150?img=3',
      RelationStatus: 1,
    },
  ];

  return (
    <ParentView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
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
          rightSideTitlePress={handleOpenMemberSelection}
          rightSideIcon={<SvgAddGroup />}
        />

        <View style={styles.content}>
          <View style={styles.tabContainer}>
            <GroupTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabPress={handleTabPress}
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
            {/* <Text style={styles.sectionTitle}>Frequently Sent</Text>
            <View style={styles.listCard}>
              <FlatList
                data={frequentlySentUsers}
                keyExtractor={item => item.UserId.toString()}
                renderItem={({ item, index }) => (
                  <SearchUserItem
                    item={item}
                    index={index}
                    isLast={index === frequentlySentUsers.length - 1}
                    showAddButton={false}
                    showSelection={false}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
              />
            </View> */}

            <Text style={styles.sectionTitle}>Friends</Text>
            <View style={styles.listCard}>
              {activeUsersApi?.data && activeUsersApi.data.length > 0 ? (
                <FlatList
                  data={activeUsersApi.data}
                  keyExtractor={item => item.UserId.toString()}
                  renderItem={({ item, index }) => (
                    <SearchUserItem
                      item={item}
                      index={index}
                      isLast={index === (activeUsersApi?.data?.length || 0) - 1}
                      showAddButton={false}
                      showSelection={false}
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.errorText}>No friends found</Text>
              )}
            </View>
          </View>
        </View>
        <MemberSelectionModal
          visible={isMemberSelectionOpen}
          onClose={handleCloseMemberSelection}
          existingMembers={[]}
          onSave={handleSaveMembers}
          title="Add Members"
          listings={[
            {
              title: 'Frequently Sent',
              users: frequentlySentUsers,
            },
            {
              title: 'Friends',
              users: activeUsersApi?.data || [],
            },
          ]}
          onNavigateToGroup={handleNavigateToGroup}
        />
      </ScrollView>
    </ParentView>
  );
};

export default SendAGiftScreen;
