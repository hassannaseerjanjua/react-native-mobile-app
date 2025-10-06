import React, { useState } from 'react';
import { View, Text, StatusBar, FlatList } from 'react-native';
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
import { ActiveUser } from '../../../types';
import { SvgAddGroup } from '../../../assets/icons';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> {}

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);

  const handleUserSelection = (userId: number) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

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

  const friendsUsers: ActiveUser[] = [
    {
      UserId: 4,
      FullName: 'Sarah Wilson',
      Email: 'sarah.wilson@example.com',
      PhoneNo: '+1234567893',
      ProfileUrl: 'https://i.pravatar.cc/150?img=4',
      RelationStatus: 1,
    },
    {
      UserId: 5,
      FullName: 'David Brown',
      Email: 'david.brown@example.com',
      PhoneNo: '+1234567894',
      ProfileUrl: 'https://i.pravatar.cc/150?img=5',
      RelationStatus: 1,
    },
    {
      UserId: 6,
      FullName: 'Emily Davis',
      Email: 'emily.davis@example.com',
      PhoneNo: '+1234567895',
      ProfileUrl: 'https://i.pravatar.cc/150?img=6',
      RelationStatus: 1,
    },
    {
      UserId: 7,
      FullName: 'Chris Miller',
      Email: 'chris.miller@example.com',
      PhoneNo: '+1234567896',
      ProfileUrl: 'https://i.pravatar.cc/150?img=7',
      RelationStatus: 1,
    },
    {
      UserId: 8,
      FullName: 'Lisa Anderson',
      Email: 'lisa.anderson@example.com',
      PhoneNo: '+1234567897',
      ProfileUrl: 'https://i.pravatar.cc/150?img=8',
      RelationStatus: 1,
    },
  ];

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
        rightSideTitle="New Group"
        rightSideTitlePress={handleOpenMemberSelection}
        rightSideIcon={<SvgAddGroup />}
      />

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TabItem
            title="Send through a link"
            onPress={() => {}}
            isLink={true}
          />
        </View>
        <View style={styles.tabContainer}>
          <GroupTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Frequently Sent</Text>
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
          </View>

          <Text style={styles.sectionTitle}>Friends</Text>
          <View style={styles.listCard}>
            <FlatList
              data={friendsUsers}
              keyExtractor={item => item.UserId.toString()}
              renderItem={({ item, index }) => (
                <SearchUserItem
                  item={item}
                  index={index}
                  isLast={index === friendsUsers.length - 1}
                  showAddButton={false}
                  showSelection={false}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={false}
            />
          </View>
        </View>
      </View>
      <MemberSelectionModal
        visible={isMemberSelectionOpen}
        onClose={handleCloseMemberSelection}
        existingMembers={[]}
        onSave={handleSaveMembers}
        title="Add Members"
        onNavigateToGroup={handleNavigateToGroup}
      />
    </ParentView>
  );
};

export default SendAGiftScreen;
