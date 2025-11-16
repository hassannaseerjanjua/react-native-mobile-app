import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Modal,
  Animated,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  StatusBar,
  Keyboard,
  Dimensions,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import BottomSheetHeader from '../app/BottomSheetHeader';
import SearchUserItem from '../app/SearchUserItem';
import { SvgCrossIcon, SvgImageIcon } from '../../assets/icons';
import { ActiveUser } from '../../types';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';
import api from '../../utils/api';
import apiEndpoints from '../../constants/api-endpoints';
import { useNavigation } from '@react-navigation/native';
import { isIOSThen, scaleWithMax, rtlTextAlign } from '../../utils';
import { Text } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';

const dummyImage = require('../../assets/images/user.png');

interface UserListing {
  title?: string;
  users: ActiveUser[];
}

interface MemberSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  existingMembers: ActiveUser[];
  onSave: (
    selectedMembers: ActiveUser[],
    groupName?: string,
    groupImage?: { uri: string; type: string; name: string } | null,
  ) => void;
  title: string;
  listings: UserListing[];
  isSendAGift?: boolean;
  viewOnly?: boolean;
  existingGroupName?: string;
  existingGroupImage?: string | null;
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
  existingGroupName = '',
  existingGroupImage,
}) => {
  const { styles } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const [modalAnimation] = useState(new Animated.Value(0));
  const [modalStep, setModalStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(
    existingGroupImage
      ? {
          uri: existingGroupImage,
          type: 'image/jpeg',
          name: 'group-image.jpg',
        }
      : null,
  );

  const [groupError, setGroupError] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const theme = useTheme();
  const navigation = useNavigation();

  // Memoize all users to avoid recalculation on every render
  const allUsers = useMemo(
    () => listings?.flatMap(listing => listing.users || []) || [],
    [listings],
  );

  // Memoize selected users data
  const selectedUsersData = useMemo(
    () => allUsers.filter(user => selectedUsers.has(user.UserId)),
    [allUsers, selectedUsers],
  );

  // Centralized state reset function
  const resetModalState = useCallback(
    (prefillGroupName = false) => {
      setModalStep(1);
      setSearchQuery('');
      setGroupName(prefillGroupName ? existingGroupName : '');
      setGroupImage(
        prefillGroupName && existingGroupImage
          ? {
              uri: existingGroupImage,
              type: 'image/jpeg',
              name: 'group-image.jpg',
            }
          : null,
      );
      setGroupError('');
      setSelectedUsers(
        prefillGroupName
          ? new Set(existingMembers?.map(member => member.UserId) || [])
          : new Set(),
      );
    },
    [existingGroupName, existingMembers, existingGroupImage],
  );

  const openModal = useCallback(() => {
    resetModalState(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [modalAnimation, resetModalState]);

  const closeModal = useCallback(() => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      resetModalState(false);
      onClose();
    });
  }, [modalAnimation, resetModalState, onClose]);

  const handleUserSelection = useCallback((userId: number) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const handleNextStep = useCallback(() => {
    if (modalStep === 1 && selectedUsers.size > 0) {
      setModalStep(2);
    }
  }, [modalStep, selectedUsers.size]);

  const handleBackStep = useCallback(() => {
    if (modalStep === 2) {
      setModalStep(1);
    }
  }, [modalStep]);

  const handleImageSelect = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setGroupImage({
            uri:
              Platform.OS === 'ios'
                ? asset.uri?.replace('file://', '') || ''
                : asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `group_image_${Date.now()}.jpg`,
          });
          if (groupError) setGroupError('');
        }
      },
    );
  }, [groupError]);

  const handleSave = useCallback(() => {
    if (isSendAGift) {
      setGroupError('');

      if (!groupImage && !groupName.trim()) {
        setGroupError(getString('VE_PLEASE_ENTER_GROUP_NAME_AND_IMAGE'));
        return;
      }
      if (!groupName.trim()) {
        setGroupError(getString('VE_PLEASE_ENTER_GROUP_NAME'));
        return;
      }
      if (!groupImage) {
        setGroupError(getString('VE_PLEASE_ENTER_IMAGE'));
        return;
      }

      const formData = new FormData();
      formData.append('Name', groupName);

      if (groupImage) {
        formData.append('File', {
          uri: groupImage.uri,
          type: groupImage.type,
          name: groupImage.name,
        });
      }

      Array.from(selectedUsers).forEach(userId => {
        formData.append('MemberUserIds', userId.toString());
      });

      api
        .post(apiEndpoints.CREATE_GROUP, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(() => {
          onSave(selectedUsersData, groupName, groupImage);
          closeModal();
          navigation.navigate('SendToGroup' as never);
        })
        .catch(error => {
        });
    } else {
      onSave(selectedUsersData, groupName, groupImage);
      closeModal();
    }
  }, [
    isSendAGift,
    groupName,
    groupImage,
    selectedUsers,
    selectedUsersData,
    onSave,
    closeModal,
    navigation,
  ]);

  // Memoize style for viewOnly to avoid recreation
  const selectedUsersContainerStyle = useMemo(
    () =>
      viewOnly
        ? [styles.selectedUsersContainer, { shadowOpacity: 0, elevation: 0 }]
        : styles.selectedUsersContainer,
    [styles.selectedUsersContainer, viewOnly],
  );

  const SelectedUsersDisplay = () => {
    if (selectedUsersData.length === 0) {
      return null;
    }

    // Horizontal scroll view for selected users
    return (
      <View style={selectedUsersContainerStyle}>
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

  // Memoize filtered listings
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) {
      return listings;
    }

    const lowerSearchQuery = searchQuery.toLowerCase();
    return listings
      .map(listing => ({
        ...listing,
        users: (listing.users || []).filter(user =>
          user.FullName.toLowerCase().includes(lowerSearchQuery),
        ),
      }))
      .filter(listing => listing.users.length > 0);
  }, [searchQuery, listings]);

  const UserListComponent = ({ isSelected }: { isSelected: boolean }) => {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: theme.sizes.PADDING,
          paddingBottom: theme.sizes.HEIGHT * 0.02,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredListings.length > 0 ? (
          filteredListings.map((listing, listingIndex) => (
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
                        onSelectionPress={() =>
                          handleUserSelection(item.UserId)
                        }
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                  />
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>{getString('EMPTY_NO_USERS_TO_SHOW')}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.listCard}>
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>{getString('EMPTY_NO_RESULTS_FOUND')}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  // Memoize member rows to avoid recalculation
  const memberRows = useMemo(() => {
    const chunks: ActiveUser[][] = [];
    for (let i = 0; i < selectedUsersData.length; i += 4) {
      chunks.push(selectedUsersData.slice(i, i + 4));
    }
    return chunks;
  }, [selectedUsersData]);

  const SelectedMembersGrid = () => {
    const renderMemberRow = (rowData: ActiveUser[], rowIndex: number) => (
      <View key={rowIndex} style={styles.memberRow}>
        {rowData.map(user => (
          <View key={user.UserId} style={styles.memberGridItem}>
            <View style={styles.memberGridImageContainer}>
              <Image
                source={user.ProfileUrl ? { uri: user.ProfileUrl } : dummyImage}
                style={styles.memberGridAvatar}
              />
              {!viewOnly && (
                <TouchableOpacity
                  style={styles.memberGridCrossIcon}
                  onPress={() => handleUserSelection(user.UserId)}
                >
                  <SvgCrossIcon width={12} height={12} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.memberGridName} numberOfLines={1}>
              {user.FullName.split(' ')[0]}
            </Text>
          </View>
        ))}
      </View>
    );

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

  // Handle keyboard events for Android
  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) {
      return;
    }

    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [visible, modalStep]);

  // Get screen dimensions for Android to prevent modal shift
  const screenDimensions = useMemo(() => {
    return Dimensions.get('screen');
  }, []);

  // Use screen dimensions (which don't change with keyboard) for Android to prevent shift
  const modalContainerStyle = useMemo(() => {
    if (Platform.OS === 'android') {
      const screenHeight = screenDimensions.height;
      const statusBarOffset =
        (StatusBar.currentHeight || 0) + scaleWithMax(3, 5);
      const modalHeight = screenHeight - statusBarOffset;
      return [
        styles.modalContainer,
        {
          height: modalHeight,
          // Use explicit top positioning instead of bottom: 0 to prevent shift
          bottom: undefined,
          top: statusBarOffset,
        },
      ];
    }
    return styles.modalContainer;
  }, [screenDimensions, styles.modalContainer]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeModal}
    >
      <View
        style={[
          styles.modalOverlay,
          Platform.OS === 'android' && {
            height: screenDimensions.height,
            width: screenDimensions.width,
          },
        ]}
      >
        <Animated.View
          style={[
            modalContainerStyle,
            {
              transform: [
                {
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      Platform.OS === 'android'
                        ? screenDimensions.height
                        : theme.sizes.HEIGHT,
                      0,
                    ],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalContent}>
            {modalStep === 1 ? (
              <>
                <BottomSheetHeader
                  leftSideTitle={getString('NG_CANCEL')}
                  title={
                    viewOnly
                      ? title
                      : isSendAGift
                      ? getString('NG_ADD_MEMBERS')
                      : getString('NG_EDIT_GROUP_MEMBERS')
                  }
                  subTitle={
                    viewOnly
                      ? `${allUsers.length} ${getString('NG_MEMBERS')}`
                      : `${selectedUsers.size}/${allUsers.length}`
                  }
                  rightSideTitle={viewOnly ? '' : getString('NG_NEXT')}
                  showSearchBar={true}
                  searchPlaceholder={getString('STG_SEARCH')}
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                  leftSideTitlePress={closeModal}
                  rightSideTitlePress={viewOnly ? undefined : handleNextStep}
                />

                <>
                  {!viewOnly && <SelectedUsersDisplay />}
                  <UserListComponent
                    isSelected={selectedUsersData.length > 0}
                  />
                </>
              </>
            ) : (
              <>
                <BottomSheetHeader
                  leftSideTitle={getString('NG_BACK')}
                  title={
                    isSendAGift ? getString('NG_NEW_GROUP') : getString('NG_REVIEW_MEMBERS')
                  }
                  subTitle=""
                  rightSideTitle={getString('NG_SAVE')}
                  showSearchBar={false}
                  leftSideTitlePress={handleBackStep}
                  rightSideTitlePress={handleSave}
                />
                <ScrollView
                  ref={scrollViewRef}
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    paddingHorizontal: theme.sizes.PADDING,
                    paddingBottom:
                      theme.sizes.HEIGHT * 0.02 +
                      (Platform.OS === 'android' && keyboardHeight > 0
                        ? keyboardHeight
                        : 0),
                  }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.step2Container}>
                    <View
                      style={[
                        styles.groupNameInputContainer,
                        groupError && styles.groupNameInputError,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.groupNameIconWrapper}
                        onPress={handleImageSelect}
                      >
                        {groupImage ? (
                          <Image
                            source={{ uri: groupImage.uri }}
                            style={styles.groupImagePreview}
                          />
                        ) : (
                          <SvgImageIcon
                            width={scaleWithMax(15, 17)}
                            height={scaleWithMax(15, 17)}
                          />
                        )}
                      </TouchableOpacity>
                      <TextInput
                        ref={textInputRef}
                        allowFontScaling={false}
                        style={[
                          styles.groupNameInput,
                          { textAlign: rtlTextAlign(isRtl) },
                        ]}
                        placeholder={getString('NG_ENTER_GROUP_NAME')}
                        placeholderTextColor={theme.colors.SECONDARY_GRAY}
                        value={groupName}
                        onChangeText={text => {
                          setGroupName(text);
                          if (groupError) setGroupError('');
                        }}
                        onFocus={() => {
                          if (Platform.OS === 'android') {
                            setTimeout(() => {
                              scrollViewRef.current?.scrollTo({
                                y: 100,
                                animated: true,
                              });
                            }, 300);
                          }
                        }}
                      />
                    </View>
                    {groupError ? (
                      <Text style={styles.errorText}>{groupError}</Text>
                    ) : null}
                    <Text style={styles.membersHeading}>
                      {getString('NG_MEMBERS')}: {selectedUsers.size}{' '}
                      {getString('NG_OUT_OF')} {allUsers.length}
                    </Text>
                    <SelectedMembersGrid />
                  </View>
                </ScrollView>
              </>
            )}
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

    // Shared shadow style
    const shadowStyle = {
      shadowColor: colors.BLACK,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: scaleWithMax(4, 6),
      elevation: 2,
    };

    const avatarSize = scaleWithMax(60, 60);
    const crossIconSize = scaleWithMax(20, 20);
    const userItemWidth = scaleWithMax(80, 80);

    return StyleSheet.create({
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'flex-end',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      modalContainer: {
        backgroundColor: colors.WHITE,
        borderTopLeftRadius: sizes.BORDER_RADIUS_HIGH,
        borderTopRightRadius: sizes.BORDER_RADIUS_HIGH,
        height:
          sizes.HEIGHT -
          isIOSThen(
            scaleWithMax(45, 55),
            (StatusBar.currentHeight || 0) + scaleWithMax(3, 5),
          ),
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
      },
      modalScrollView: {
        flex: 1,
        height: sizes.HEIGHT * 0.85,
        width: '100%',
        overflow: 'visible',
      },
      step2Container: {
        paddingVertical: sizes.HEIGHT * 0.02,
      },
      groupNameInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS_MID,
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.HEIGHT * 0.015,
        ...shadowStyle,
      },
      groupNameIconWrapper: {
        width: scaleWithMax(28, 28),
        height: scaleWithMax(28, 28),
        borderRadius: 999,
        backgroundColor: colors.SECONDARY,
        alignItems: 'center',
        justifyContent: 'center',
      },
      groupImagePreview: {
        width: scaleWithMax(28, 28),
        height: scaleWithMax(28, 28),
        borderRadius: 999,
      },
      groupNameInputError: {
        borderColor: colors.RED,
        borderWidth: 1,
      },
      errorText: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.RED,
        marginTop: scaleWithMax(4, 4),
      },
      groupNameInput: {
        flex: 1,
        fontSize: sizes.FONTSIZE,
        fontFamily: fonts.Quicksand.regular,
        color: colors.PRIMARY_TEXT,
        marginLeft: sizes.PADDING * 0.6,
        padding: 0,
      },
      membersHeading: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_LESS_HIGH,
        color: colors.PRIMARY_TEXT,
        marginTop: sizes.HEIGHT * 0.02,
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
        width: userItemWidth,
        marginRight: sizes.WIDTH * 0.01,
      },
      memberGridImageContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      },
      memberGridCrossIcon: {
        position: 'absolute',
        top: 0,
        right: scaleWithMax(-5, -5),
        width: crossIconSize,
        height: crossIconSize,
        borderRadius: crossIconSize / 2,
        backgroundColor: colors.LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center',
      },
      memberGridAvatar: {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
        marginBottom: scaleWithMax(6, 6),
      },
      memberGridName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: userItemWidth,
      },
      selectedUsersContainer: {
        marginHorizontal: sizes.PADDING,
        marginVertical: sizes.HEIGHT * 0.01,
        paddingVertical: sizes.BORDER_RADIUS_MID,
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS_MID,
        ...shadowStyle,
        elevation: 3,
      },
      selectedUsersList: {
        flexDirection: 'row',
      },
      selectedUserItem: {
        alignItems: 'center',
        width: userItemWidth,
      },
      selectedUserImageContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      },
      selectedUserAvatar: {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
        marginBottom: scaleWithMax(6, 6),
      },
      selectedUserCrossIcon: {
        position: 'absolute',
        top: 0,
        right: scaleWithMax(-5, -5),
        width: crossIconSize,
        height: crossIconSize,
        borderRadius: crossIconSize / 2,
        backgroundColor: colors.LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center',
      },
      selectedUserName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: userItemWidth,
      },
      listCard: {
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS_HIGH,
        ...shadowStyle,
        elevation: 3,
        marginBottom: sizes.HEIGHT * 0.018,
      },
      sectionTitle: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_MED_HIGH,
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
        fontSize: sizes.FONTSIZE,
        color: colors.SECONDARY_GRAY,
        textAlign: 'center',
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default MemberSelectionModal;
