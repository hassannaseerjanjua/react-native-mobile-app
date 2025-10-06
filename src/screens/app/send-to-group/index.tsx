import React, { useState } from 'react';
import {
  View,
  StatusBar,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  Text,
  FlatList,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import TabItem from '../../../components/global/TabItem';
import BottomSheetHeader from '../../../components/app/BottomSheetHeader';
import SearchUserItem from '../../../components/app/SearchUserItem';
import { MemberSelectionModal } from '../../../components/send-a-gift';
import { SvgCrossIcon, SvgEditGroup } from '../../../assets/icons';
import { ActiveUser } from '../../../types';

interface SendToGroupProps extends AppStackScreen<'SendToGroup'> {}

const SendToGroupScreen: React.FC<SendToGroupProps> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<ActiveUser[]>([]);

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
      setModalSearchQuery('');
      modalAnimation.setValue(0);
    });
  };

  const getGroupMembersData = (): ActiveUser[] => {
    if (groupMembers.length > 0) {
      return groupMembers;
    }

    // Use route params if available, otherwise fallback to hardcoded data
    if (route.params?.selectedUserIds) {
      const allUsers = [
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

      return allUsers.filter(user =>
        route.params.selectedUserIds.includes(user.UserId),
      );
    }

    return [
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
  };

  const getFilteredMembers = (): ActiveUser[] => {
    const members = getGroupMembersData();
    if (!modalSearchQuery.trim()) {
      return members;
    }
    return members.filter(user =>
      user.FullName.toLowerCase().includes(modalSearchQuery.toLowerCase()),
    );
  };

  const handleEditGroup = () => {
    setIsMemberSelectionOpen(true);
  };

  const handleSaveMembers = (selectedMembers: ActiveUser[]) => {
    setGroupMembers(selectedMembers);
    setIsMemberSelectionOpen(false);
  };

  const handleCloseMemberSelection = () => {
    setIsMemberSelectionOpen(false);
  };

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={'Send to Group'}
        showBackButton
        onBackPress={() => {
          isEditGroupOpen ? setIsEditGroupOpen(false) : navigation.goBack();
        }}
        showSearch={false}
        showSearchBar
        rightSideTitle={isEditGroupOpen ? '' : 'Edit Group'}
        rightSideTitlePress={() => setIsEditGroupOpen(true)}
        rightSideIcon={<SvgEditGroup />}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Group"
      />
      <View style={styles.content}>
        <TabItem
          isGroup={true}
          title={route.params?.groupName || 'My Group'}
          onPress={isEditGroupOpen ? handleEditGroup : openModal}
          isEditGroup={isEditGroupOpen}
          styles={styles.TabItem}
          onDeletePress={() => {}}
          onEditPress={handleEditGroup}
        />
        <View style={styles.tabSpacing} />
        <TabItem
          isGroup={true}
          title="Work Group"
          onPress={isEditGroupOpen ? handleEditGroup : openModal}
          isEditGroup={isEditGroupOpen}
          styles={styles.TabItem}
          onDeletePress={() => {}}
          onEditPress={handleEditGroup}
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
              <ScrollView style={styles.modalScrollView}>
                <BottomSheetHeader
                  leftSideTitle="Cancel"
                  title="Group Members"
                  subTitle={`${getFilteredMembers().length} members`}
                  rightSideTitle=""
                  showSearchBar={true}
                  searchPlaceholder="Search members"
                  searchValue={modalSearchQuery}
                  onSearchChange={setModalSearchQuery}
                  leftSideTitlePress={closeModal}
                />
                <View style={styles.membersContainer}>
                  <View style={styles.listCard}>
                    <FlatList
                      data={getFilteredMembers()}
                      keyExtractor={item => item.UserId.toString()}
                      renderItem={({ item, index }) => (
                        <SearchUserItem
                          item={item}
                          index={index}
                          isLast={index === getFilteredMembers().length - 1}
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
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <MemberSelectionModal
        visible={isMemberSelectionOpen}
        onClose={handleCloseMemberSelection}
        existingMembers={getGroupMembersData()}
        onSave={handleSaveMembers}
        title="Edit Group Members"
      />
    </ParentView>
  );
};

export default SendToGroupScreen;
