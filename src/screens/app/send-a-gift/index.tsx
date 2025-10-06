import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import { useLocaleStore } from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';
import SearchUserItem from '../../../components/app/SearchUserItem';
import GroupTabs from '../../../components/global/GroupTabs';
import TabItem from '../../../components/global/TabItem';
import { ActiveUser } from '../../../types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import { SvgPhoneIcon } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { SvgEmail, SvgSelectedCheck } from '../../../assets/icons';
import CustomButton from '../../../components/global/Custombutton';
import BottomSheetHeader from '../../../components/app/BottomSheetHeader';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> {}

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  // Handle user selection
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

  // Tab configuration
  const tabs = [
    { id: 'friends', title: 'Friends' },
    { id: 'group', title: 'Group' },
    { id: 'others', title: 'Others' },
  ];

  // Mock data for frequently sent users (3 items)
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

  // Mock data for friends (5 items)
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

  // Get selected users data
  const getSelectedUsersData = () => {
    const allUsers = [...frequentlySentUsers, ...friendsUsers];
    return allUsers.filter(user => selectedUsers.has(user.UserId));
  };

  // Selected Users Display Component
  const SelectedUsersDisplay = () => {
    const selectedUsersData = getSelectedUsersData();

    if (selectedUsersData.length === 0) {
      return null;
    }

    return (
      <View style={styles.selectedUsersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedUsersList}
        >
          {selectedUsersData.map(user => (
            <View key={user.UserId} style={styles.selectedUserItem}>
              <Image
                source={{ uri: user.ProfileUrl || '' }}
                style={styles.selectedUserAvatar}
              />
              <Text style={styles.selectedUserName} numberOfLines={1}>
                {user.FullName.split(' ')[0]}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Reusable User List Component with optional selection
  const UserListComponent = ({ enableSelection = false }) => (
    <View>
      {/* Frequently Sent Section */}
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
              showSelection={enableSelection}
              isSelected={
                enableSelection ? selectedUsers.has(item.UserId) : false
              }
              onSelectionPress={
                enableSelection
                  ? () => handleUserSelection(item.UserId)
                  : undefined
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      </View>

      {/* Friends Section */}
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
              showSelection={enableSelection}
              isSelected={
                enableSelection ? selectedUsers.has(item.UserId) : false
              }
              onSelectionPress={
                enableSelection
                  ? () => handleUserSelection(item.UserId)
                  : undefined
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      </View>
    </View>
  );

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
        rightSideTitlePress={() => {
          setIsBottomSheetOpen(true);
        }}
      />

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TabItem title="Send through a link" onPress={() => {}} />
        </View>
        {/* Frequently Sent Section */}
        <View style={styles.tabContainer}>
          <GroupTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={setActiveTab}
          />
        </View>
        <UserListComponent enableSelection={false} />
      </View>
      <AppBottomSheet
        blurAmount={100}
        blurType="light"
        // height={theme.sizes.HEIGHT * 0.45}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        fullHeight={true}
      >
        <View style={styles.bottomSheetContainer}>
          <BottomSheetHeader
            leftSideTitle="Cancel"
            title="Add Members"
            subTitle="0/1,023"
            rightSideTitle="Next"
            showSearchBar={true}
            searchPlaceholder="Search"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <SelectedUsersDisplay />
          <UserListComponent enableSelection={true} />
        </View>
      </AppBottomSheet>
    </ParentView>
  );
};

export default SendAGiftScreen;
