import React, { useState, useMemo, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheetHeader from '../app/BottomSheetHeader';
import SearchUserItem from '../app/SearchUserItem';
import { SvgCrossIcon, SvgImageIcon } from '../../assets/icons';
import { ActiveUser } from '../../types';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';
import api from '../../utils/api';
import apiEndpoints from '../../constants/api-endpoints';
import { useNavigation } from '@react-navigation/native';

const dummyImage = require('../../assets/images/user.png');

interface UserListing {
  title?: string;
  users: ActiveUser[];
}

interface MemberSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  existingMembers: ActiveUser[];
  onSave: (selectedMembers: ActiveUser[], groupName?: string) => void;
  title: string;
  listings: UserListing[];
  isSendAGift?: boolean;
  viewOnly?: boolean;
}

const MemberSelectionModal: React.FC<MemberSelectionModalProps> = ({
  visible,
  onClose,
  existingMembers,
  onSave,
  title,
  listings = [],
  isSendAGift = false,
  viewOnly = false,
}) => {
  const { styles } = useStyles();
  const [modalAnimation] = useState(new Animated.Value(0));
  const [modalStep, setModalStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [groupName, setGroupName] = useState('');

  const theme = useTheme();
  const navigation = useNavigation();

  // Get all users from all listings for filtering and selection
  const getAllUsers = () => {
    return listings?.flatMap(listing => listing.users || []) || [];
  };

  const openModal = () => {
    setModalStep(1);
    setSearchQuery('');
    setGroupName('');
    setSelectedUsers(
      new Set(existingMembers?.map(member => member.UserId) || []),
    );
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
        const allUsers = getAllUsers();
        const removedUser = allUsers.find(user => user.UserId === userId);
        console.log('Removed member:', removedUser);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleNextStep = () => {
    if (modalStep === 1 && selectedUsers.size > 0) {
      setModalStep(2);
    }
  };

  const handleBackStep = () => {
    if (modalStep === 2) {
      setModalStep(1);
    }
  };

  const handleSave = () => {
    const allUsers = getAllUsers();
    const selectedMembers = allUsers.filter(user =>
      selectedUsers.has(user.UserId),
    );

    if (isSendAGift) {
      api
        .post(
          apiEndpoints.CREATE_GROUP,
          {
            Name: groupName,
            MemberUserIds: Array.from(selectedUsers),
          },
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        )
        .then(response => {
          console.log('response', response.data);
          onSave(selectedMembers, groupName);
          closeModal();
          navigation.navigate('SendToGroup' as never);
        })
        .catch(error => {
          console.log('error', error);
        });
    } else {
      onSave(selectedMembers);
      closeModal();
    }
  };

  const getSelectedUsersData = () => {
    const allUsers = getAllUsers();
    return allUsers.filter(user => selectedUsers.has(user.UserId));
  };

  const selectedUsersData = getSelectedUsersData();

  const SelectedUsersDisplay = () => {
    if (selectedUsersData.length === 0) {
      return null;
    }

    return (
      <View
        style={
          !viewOnly
            ? styles.selectedUsersContainer
            : {
                ...styles.selectedUsersContainer,
                shadowColor: '',
                shadowOpacity: 0,
                shadowRadius: 0,
                shadowOffset: { width: 0, height: 0 },
                elevation: 0,
              }
        }
      >
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

                {!viewOnly && (
                  <TouchableOpacity
                    style={styles.selectedUserCrossIcon}
                    onPress={() => handleUserSelection(user.UserId)}
                  >
                    <SvgCrossIcon width={12} height={12} />
                  </TouchableOpacity>
                )}
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
      {listings.map((listing, listingIndex) => (
        <View key={listingIndex}>
          {listing.title ? (
            <Text style={styles.sectionTitle}>{listing.title}</Text>
          ) : (
            <View
              style={{
                paddingVertical: theme.sizes.HEIGHT * 0.009,
              }}
            />
          )}
          <View style={styles.listCard}>
            {(listing.users || []).length > 0 ? (
              <FlatList
                data={listing.users || []}
                keyExtractor={item => item.UserId.toString()}
                renderItem={({ item, index }) => (
                  <SearchUserItem
                    item={item}
                    index={index}
                    isLast={index === (listing.users || []).length - 1}
                    showAddButton={false}
                    showSelection={!viewOnly}
                    isSelected={selectedUsers.has(item.UserId)}
                    onSelectionPress={() => handleUserSelection(item.UserId)}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No users to show</Text>
              </View>
            )}
          </View>
        </View>
      ))}
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
    console.log('memberRows', memberRows);

    return (
      <View style={styles.membersGridContainer}>
        {memberRows.map((rowData, index) => renderMemberRow(rowData, index))}
      </View>
    );
  };

  useEffect(() => {
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
          <SafeAreaView style={styles.modalContent} edges={['top']}>
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {modalStep === 1 ? (
                <>
                  <BottomSheetHeader
                    leftSideTitle="Cancel"
                    title={viewOnly ? title : 'Edit Group Members'}
                    subTitle={
                      viewOnly
                        ? `${getAllUsers().length} members`
                        : `${selectedUsers.size}/${getAllUsers().length}`
                    }
                    rightSideTitle={viewOnly ? '' : 'Next'}
                    showSearchBar={true}
                    searchPlaceholder="Search"
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    leftSideTitlePress={closeModal}
                    rightSideTitlePress={viewOnly ? undefined : handleNextStep}
                  />
                  <SelectedUsersDisplay />
                  {!viewOnly && <UserListComponent />}
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
                    <View style={styles.groupNameContainer}>
                      <View style={styles.groupNameInputContainer}>
                        <View style={styles.groupNameIconWrapper}>
                          <SvgImageIcon />
                        </View>
                        <TextInput
                          style={styles.groupNameInput}
                          placeholder="Enter group name"
                          placeholderTextColor="#A0A0A0EE"
                          value={groupName}
                          onChangeText={setGroupName}
                        />
                      </View>
                    </View>
                    <Text style={styles.membersHeading}>
                      Members: {selectedUsers.size} out of{' '}
                      {getAllUsers().length}
                    </Text>
                    <SelectedMembersGrid />
                  </View>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
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
        height: sizes.HEIGHT * 0.9,
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
        // paddingHorizontal: sizes.WIDTH * 0.04,
      },
      groupNameContainer: {
        marginBottom: sizes.HEIGHT * 0.02,
      },
      groupNameInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.HEIGHT * 0.018,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
      groupNameIconWrapper: {
        marginRight: sizes.PADDING * 0.8,
      },
      groupNameInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: fonts.Quicksand.regular,
        color: colors.PRIMARY_TEXT,
        padding: 0,
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
      emptyStateContainer: {
        paddingVertical: sizes.HEIGHT * 0.03,
        paddingHorizontal: sizes.PADDING,
        alignItems: 'center',
        justifyContent: 'center',
      },
      emptyStateText: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 14,
        color: colors.SECONDARY_GRAY,
        textAlign: 'center',
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default MemberSelectionModal;
