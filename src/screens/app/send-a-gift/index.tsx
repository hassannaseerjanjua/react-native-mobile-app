import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [modalAnimation] = useState(new Animated.Value(0));

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

  const openModal = () => {
    setIsModalOpen(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsModalOpen(false);
      modalAnimation.setValue(0);
    });
  };

  const tabs = [
    { id: 'friends', title: 'Friends' },
    { id: 'group', title: 'Group' },
    { id: 'others', title: 'Others' },
  ];

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
        rightSideTitlePress={openModal}
      />

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TabItem title="Send through a link" onPress={() => {}} />
        </View>
        <View style={styles.tabContainer}>
          <GroupTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={setActiveTab}
          />
        </View>
        <UserListComponent
          enableSelection={false}
          frequentlySentUsers={frequentlySentUsers}
          friendsUsers={friendsUsers}
          selectedUsers={selectedUsers}
          handleUserSelection={handleUserSelection}
          styles={styles}
        />
      </View>
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [Dimensions.get('window').height, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalContent}>
              <BottomSheetHeader
                leftSideTitle="Cancel"
                title="Add Members"
                subTitle={`${selectedUsers.size}/${
                  frequentlySentUsers.length + friendsUsers.length
                }`}
                rightSideTitle="Next"
                showSearchBar={true}
                searchPlaceholder="Search"
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                leftSideTitlePress={closeModal}
              />
              <ScrollView style={styles.modalScrollView}>
                <SelectedUsersDisplay
                  selectedUsers={selectedUsers}
                  frequentlySentUsers={frequentlySentUsers}
                  friendsUsers={friendsUsers}
                  styles={styles}
                />
                <UserListComponent
                  enableSelection={true}
                  frequentlySentUsers={frequentlySentUsers}
                  friendsUsers={friendsUsers}
                  selectedUsers={selectedUsers}
                  handleUserSelection={handleUserSelection}
                  styles={styles}
                />
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ParentView>
  );
};

const getSelectedUsersData = (
  frequentlySentUsers: ActiveUser[],
  friendsUsers: ActiveUser[],
  selectedUsers: Set<number>,
) => {
  const allUsers = [...frequentlySentUsers, ...friendsUsers];
  return allUsers.filter(user => selectedUsers.has(user.UserId));
};

const SelectedUsersDisplay: React.FC<{
  selectedUsers: Set<number>;
  frequentlySentUsers: ActiveUser[];
  friendsUsers: ActiveUser[];
  styles: any;
}> = ({ selectedUsers, frequentlySentUsers, friendsUsers, styles }) => {
  const selectedUsersData = getSelectedUsersData(
    frequentlySentUsers,
    friendsUsers,
    selectedUsers,
  );

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

const UserListComponent: React.FC<{
  enableSelection: boolean;
  frequentlySentUsers: ActiveUser[];
  friendsUsers: ActiveUser[];
  selectedUsers: Set<number>;
  handleUserSelection: (userId: number) => void;
  styles: any;
}> = ({
  enableSelection,
  frequentlySentUsers,
  friendsUsers,
  selectedUsers,
  handleUserSelection,
  styles,
}) => (
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

export default SendAGiftScreen;
