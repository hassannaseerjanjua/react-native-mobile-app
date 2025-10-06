import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import BottomSheetHeader from '../app/BottomSheetHeader';
import SearchUserItem from '../app/SearchUserItem';
import { SvgCrossIcon } from '../../assets/icons';
import { ActiveUser } from '../../types';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';

const dummyImage = require('../../assets/images/user.png');

interface MemberSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  existingMembers: ActiveUser[];
  onSave: (selectedMembers: ActiveUser[]) => void;
  title: string;
  onNavigateToGroup?: (groupName: string, selectedUserIds: number[]) => void;
}

const MemberSelectionModal: React.FC<MemberSelectionModalProps> = ({
  visible,
  onClose,
  existingMembers,
  onSave,
  title,
  onNavigateToGroup,
}) => {
  const { styles, theme } = useStyles();
  const [modalAnimation] = useState(new Animated.Value(0));
  const [modalStep, setModalStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [groupName, setGroupName] = useState('');

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

  const openModal = () => {
    setModalStep(1);
    setSearchQuery('');
    setGroupName('');
    setSelectedUsers(new Set(existingMembers.map(member => member.UserId)));
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
      setModalStep(1);
      setSearchQuery('');
      setGroupName('');
      setSelectedUsers(new Set());
      modalAnimation.setValue(0);
      onClose();
    });
  };

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

  const handleNextStep = () => {
    if (modalStep === 1) {
      setModalStep(2);
    }
  };

  const handleBackStep = () => {
    if (modalStep === 2) {
      setModalStep(1);
    }
  };

  const handleSave = () => {
    const allUsers = [...frequentlySentUsers, ...friendsUsers];
    const selectedMembers = allUsers.filter(user =>
      selectedUsers.has(user.UserId),
    );

    if (onNavigateToGroup) {
      // For send-a-gift flow: navigate to SendToGroup screen
      const selectedUserIds = selectedMembers.map(user => user.UserId);
      onNavigateToGroup(groupName || 'New Group', selectedUserIds);
      closeModal();
    } else {
      // For edit group flow: just save and close
      onSave(selectedMembers);
      closeModal();
    }
  };

  const getFilteredUsers = () => {
    const allUsers = [...frequentlySentUsers, ...friendsUsers];
    if (!searchQuery.trim()) {
      return allUsers;
    }
    return allUsers.filter(user =>
      user.FullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const getSelectedUsersData = () => {
    const allUsers = [...frequentlySentUsers, ...friendsUsers];
    return allUsers.filter(user => selectedUsers.has(user.UserId));
  };

  const selectedUsersData = getSelectedUsersData();

  const SelectedUsersDisplay = () => {
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
              <View style={styles.selectedUserImageContainer}>
                <Image
                  source={
                    user.ProfileUrl ? { uri: user.ProfileUrl } : dummyImage
                  }
                  style={styles.selectedUserAvatar}
                />
                <TouchableOpacity
                  style={styles.selectedUserCrossIcon}
                  onPress={() => handleUserSelection(user.UserId)}
                >
                  <SvgCrossIcon width={12} height={12} />
                </TouchableOpacity>
              </View>
              <Text style={styles.selectedUserName} numberOfLines={1}>
                {user.FullName.split(' ')[0]}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const UserListComponent = () => (
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
              showSelection={true}
              isSelected={selectedUsers.has(item.UserId)}
              onSelectionPress={() => handleUserSelection(item.UserId)}
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
              showSelection={true}
              isSelected={selectedUsers.has(item.UserId)}
              onSelectionPress={() => handleUserSelection(item.UserId)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      </View>
    </View>
  );

  const SelectedMembersGrid = () => {
    const renderMemberRow = (rowData: ActiveUser[], rowIndex: number) => (
      <View key={rowIndex} style={styles.memberRow}>
        {rowData.map((user, index) => (
          <View key={user.UserId} style={styles.memberGridItem}>
            <View style={styles.memberGridImageContainer}>
              <Image
                source={user.ProfileUrl ? { uri: user.ProfileUrl } : dummyImage}
                style={styles.memberGridAvatar}
              />
              <TouchableOpacity
                style={styles.memberGridCrossIcon}
                onPress={() => handleUserSelection(user.UserId)}
              >
                <SvgCrossIcon width={12} height={12} />
              </TouchableOpacity>
            </View>
            <Text style={styles.memberGridName} numberOfLines={1}>
              {user.FullName.split(' ')[0]}
            </Text>
          </View>
        ))}
      </View>
    );

    const chunkArray = (array: ActiveUser[], chunkSize: number) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    };

    const memberRows = chunkArray(selectedUsersData, 4);

    return (
      <View style={styles.membersGridContainer}>
        {memberRows.map((rowData, index) => renderMemberRow(rowData, index))}
      </View>
    );
  };

  React.useEffect(() => {
    if (visible) {
      openModal();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
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
              {modalStep === 1 ? (
                <>
                  <BottomSheetHeader
                    leftSideTitle="Cancel"
                    title="Edit Group Members"
                    subTitle={`${selectedUsers.size}/${
                      frequentlySentUsers.length + friendsUsers.length
                    }`}
                    rightSideTitle="Next"
                    showSearchBar={true}
                    searchPlaceholder="Search"
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    leftSideTitlePress={closeModal}
                    rightSideTitlePress={handleNextStep}
                  />
                  <SelectedUsersDisplay />
                  <UserListComponent />
                </>
              ) : (
                <>
                  <BottomSheetHeader
                    leftSideTitle="Back"
                    title="Review Members"
                    subTitle=""
                    rightSideTitle="Save"
                    showSearchBar={false}
                    leftSideTitlePress={handleBackStep}
                    rightSideTitlePress={handleSave}
                  />
                  <View style={styles.step2Container}>
                    <Text style={styles.membersHeading}>
                      Members: {selectedUsers.size} out of{' '}
                      {frequentlySentUsers.length + friendsUsers.length}
                    </Text>
                    <SelectedMembersGrid />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { colors, sizes } = theme;
    return StyleSheet.create({
      modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      modalContainer: {
        backgroundColor: colors.WHITE,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: sizes.HEIGHT,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
      },
      modalContent: {
        flex: 1,
        height: sizes.HEIGHT,
        width: '100%',
        paddingTop: sizes.HEIGHT * 0.01,
        paddingHorizontal: sizes.PADDING,
      },
      modalScrollView: {
        flex: 1,
        height: sizes.HEIGHT * 0.85,
        width: '100%',
        overflow: 'visible',
      },
      step2Container: {
        paddingVertical: sizes.HEIGHT * 0.02,
        paddingHorizontal: sizes.WIDTH * 0.04,
      },
      membersHeading: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        marginBottom: sizes.HEIGHT * 0.015,
      },
      membersGridContainer: {
        paddingTop: sizes.HEIGHT * 0.01,
      },
      memberRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: sizes.HEIGHT * 0.02,
      },
      memberGridItem: {
        alignItems: 'center',
        width: 80,
        marginRight: 12,
      },
      memberGridImageContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      },
      memberGridCrossIcon: {
        position: 'absolute',
        top: 0,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F8F8F6',
        alignItems: 'center',
        justifyContent: 'center',
      },
      memberGridAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 6,
      },
      memberGridName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 12,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: 80,
      },
      selectedUsersContainer: {
        marginVertical: sizes.HEIGHT * 0.01,
        paddingVertical: 12,
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      },
      selectedUsersList: {
        flexDirection: 'row',
      },
      selectedUserItem: {
        alignItems: 'center',
        width: 80,
      },
      selectedUserImageContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      },
      selectedUserAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 6,
      },
      selectedUserCrossIcon: {
        position: 'absolute',
        top: 0,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F8F8F6',
        alignItems: 'center',
        justifyContent: 'center',
      },
      selectedUserName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 12,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: 80,
      },
      listCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        marginBottom: sizes.HEIGHT * 0.018,
      },
      listContainer: {
        paddingVertical: 0,
      },
      sectionTitle: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: 18,
        color: colors.PRIMARY_TEXT,
        paddingBottom: sizes.HEIGHT * 0.01,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default MemberSelectionModal;
