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
  FlatList,
  SectionList,
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
import ShadowView from './ShadowView';
import SearchUserItem from '../app/SearchUserItem';
import { Image } from '../../utils/elements';
import {
  SvgCrossIcon,
  SvgImageIcon,
  SvgFindFriendsIcon,
  SvgSearchFindFriendsIcon,
} from '../../assets/icons';
import { ActiveUser, fetchApiResponse } from '../../types';
import useTheme from '../../styles/theme';
import api, { getAuthHeader, getAuthHeaderWithFormData } from '../../utils/api';
import apiEndpoints from '../../constants/api-endpoints';
import { useNavigation } from '@react-navigation/native';
import {
  isIOSThen,
  scaleWithMax,
  rtlTextAlign,
  compressImage,
  fileUriWrapper,
} from '../../utils';
import { Text } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';
import notify from '../../utils/notify';
import { useAuthStore } from '../../store/reducer/auth';
import Toast from 'react-native-toast-message';
import CustomButton from './Custombutton';

const dummyImage = require('../../assets/images/user.png');

interface UserListing {
  title?: string;
  users: ActiveUser[];
  emptyState?: 'noFriends';
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
  routeTo?: 'GiftOneGetOne' | 'SelectStore';
  onFindFriendsNavigate?: () => void;
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
  routeTo,
  onFindFriendsNavigate,
}) => {
  const { styles } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const [modalAnimation] = useState(new Animated.Value(0));
  const [modalStep, setModalStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const { token } = useAuthStore();
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
  const [isSaving, setIsSaving] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const theme = useTheme();
  const navigation = useNavigation();

  const allUsers = useMemo(
    () => listings?.flatMap(listing => listing.users || []) || [],
    [listings],
  );
  const uniqueUsers = useMemo(() => {
    const usersMap = new Map<number, ActiveUser>();
    allUsers.forEach(user => {
      if (!usersMap.has(user.UserId)) {
        usersMap.set(user.UserId, user);
      }
    });
    return Array.from(usersMap.values());
  }, [allUsers]);

  const selectedUsersData = useMemo(
    () => uniqueUsers.filter(user => selectedUsers.has(user.UserId)),
    [uniqueUsers, selectedUsers],
  );

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
      setIsSaving(false);
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
    if (modalStep === 1) {
      if (selectedUsers.size === 0) {
        notify.error(getString('SEND_GIFT_SELECT_AT_LEAST_ONE_USER'), 'bottom');
        return;
      }
      setModalStep(2);
    }
  }, [modalStep, selectedUsers.size, getString]);

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
      async response => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const imageUri = fileUriWrapper(asset.uri || '');
          const compressedImage = await compressImage(imageUri || '');

          setGroupImage({
            uri: compressedImage,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `group_image_${Date.now()}.jpg`,
          });
          if (groupError) setGroupError('');
        }
      },
    );
  }, [groupError]);

  const handleSave = useCallback(async () => {
    if (isSaving) return; // Prevent multiple clicks

    if (isSendAGift) {
      setGroupError('');

      if (selectedUsers.size === 0) {
        notify.error(getString('SEND_GIFT_SELECT_AT_LEAST_ONE_USER'), 'bottom');
        return;
      }
      if (!groupName.trim()) {
        setGroupError(getString('VE_PLEASE_ENTER_GROUP_NAME'));
        return;
      }

      setIsSaving(true);
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

      try {
        const res = await api.post(
          apiEndpoints.CREATE_GROUP,
          formData,
          getAuthHeaderWithFormData(token || ''),
        );

        if (res.failed) {
          notify.error(res.error || getString('AU_ERROR_OCCURRED'), 'bottom');
          setIsSaving(false);
          return;
        }

        onSave(selectedUsersData, groupName, groupImage);
        closeModal();
      } catch (error: any) {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'), 'bottom');
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        await onSave(selectedUsersData, groupName, groupImage);
        closeModal();
      } catch (error: any) {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'), 'bottom');
      } finally {
        setIsSaving(false);
      }
    }
  }, [
    isSaving,
    isSendAGift,
    groupName,
    groupImage,
    selectedUsers,
    selectedUsersData,
    onSave,
    closeModal,
    navigation,
    token,
    getString,
  ]);

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

    return (
      <ShadowView preset="listItem" disabled={viewOnly}>
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
      </ShadowView>
    );
  };

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

  const sectionListSections = useMemo(() => {
    if (filteredListings.length === 0) {
      return [
        {
          title: '',
          data: [{ _sectionKey: 'empty-0' }],
          renderMode: 'empty' as const,
        },
      ];
    }
    return filteredListings.map((listing, idx) => {
      if ((listing.users || []).length > 0) {
        return {
          title: listing.title || '',
          data: [{ ...listing, _sectionKey: `users-${idx}` }],
          renderMode: 'users' as const,
        };
      }
      if (listing.emptyState === 'noFriends') {
        return {
          title: listing.title || '',
          data: [{ _sectionKey: `noFriends-${idx}` }],
          renderMode: 'noFriends' as const,
        };
      }
      return {
        title: listing.title || '',
        data: [{ _sectionKey: `empty-${idx}` }],
        renderMode: 'empty' as const,
      };
    });
  }, [filteredListings]);

  const userListJsx = (
    <SectionList
      sections={sectionListSections}
      keyExtractor={(item: any) =>
        item._sectionKey || `section-${Math.random()}`
      }
      renderSectionHeader={({ section: { title } }) =>
        title ? (
          <Text style={styles.sectionTitle}>{title}</Text>
        ) : (
          <View style={{ paddingVertical: theme.sizes.HEIGHT * 0.009 }} />
        )
      }
      renderItem={({ item, section }) => {
        if (section.renderMode === 'noFriends') {
          return (
            <View style={styles.noFriendsContainer}>
              <SvgFindFriendsIcon
                width={scaleWithMax(36, 40)}
                height={scaleWithMax(36, 40)}
              />
              <Text style={styles.noFriendsText}>
                {getString('SG_NO_FRIENDS_YET')}
              </Text>
              <CustomButton
                icon={<SvgSearchFindFriendsIcon />}
                title={getString('SG_FIND_FRIENDS')}
                onPress={() => {
                  onFindFriendsNavigate?.();
                  closeModal();
                  (navigation as any).navigate('Search', {
                    title: getString('SG_FIND_FRIENDS'),
                  });
                }}
                type="primary"
              />
            </View>
          );
        }
        if (section.renderMode === 'empty') {
          return (
            <ShadowView
              preset="listItem"
              containerStyle={styles.listCardContainer}
            >
              <View style={styles.listCard}>
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    {filteredListings.length === 0
                      ? getString('EMPTY_NO_RESULTS_FOUND')
                      : getString('EMPTY_NO_USERS_TO_SHOW')}
                  </Text>
                </View>
              </View>
            </ShadowView>
          );
        }
        const listing = item as UserListing & { _sectionKey?: string };
        const users = listing.users || [];
        return (
          <ShadowView
            preset="listItem"
            containerStyle={styles.listCardContainer}
          >
            <View style={styles.listCard}>
              {users.map((user, index) => (
                <SearchUserItem
                  key={user.UserId}
                  item={user}
                  index={index}
                  isLast={index === users.length - 1}
                  showAddButton={false}
                  showSelection={!viewOnly}
                  isSelected={selectedUsers.has(user.UserId)}
                  onSelectionPress={() => handleUserSelection(user.UserId)}
                  onPress={
                    viewOnly
                      ? () => {
                          closeModal();
                          routeTo === 'SelectStore'
                            ? (navigation as any).navigate('SelectStore', {
                                friendUserId: user.UserId,
                                CityId: user.CityId,
                              })
                            : (navigation as any).navigate('CatchScreen', {
                                type: 'GiftOneGetOne',
                                friendUserId: user.UserId,
                              });
                        }
                      : undefined
                  }
                />
              ))}
            </View>
          </ShadowView>
        );
      }}
      stickySectionHeadersEnabled={false}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: theme.sizes.PADDING,
        paddingBottom: theme.sizes.HEIGHT * 0.02,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );

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

  const screenDimensions = useMemo(() => {
    return Dimensions.get('screen');
  }, []);

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
                      ? `${uniqueUsers.length} ${getString('NG_MEMBERS')}`
                      : `${selectedUsers.size}/${uniqueUsers.length}`
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
                  {userListJsx}
                </>
              </>
            ) : (
              <>
                <BottomSheetHeader
                  leftSideTitle={getString('NG_BACK')}
                  title={
                    isSendAGift
                      ? getString('NG_NEW_GROUP')
                      : getString('NG_REVIEW_MEMBERS')
                  }
                  subTitle=""
                  rightSideTitle={getString('NG_SAVE')}
                  showSearchBar={false}
                  leftSideTitlePress={handleBackStep}
                  rightSideTitlePress={handleSave}
                  rightSideLoading={isSaving}
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
                    <ShadowView preset="searchBar">
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
                          maxLength={50}
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
                    </ShadowView>
                    {groupError ? (
                      <Text style={styles.errorText}>{groupError}</Text>
                    ) : null}
                    <Text style={styles.membersHeading}>
                      {getString('NG_MEMBERS')}: {selectedUsers.size}{' '}
                      {getString('NG_OUT_OF')} {uniqueUsers.length}
                    </Text>
                    <SelectedMembersGrid />
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </Animated.View>
        {/* Toast with high z-index to appear above modal */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
            pointerEvents: 'box-none',
          }}
        >
          <Toast />
        </View>
      </View>
    </Modal>
  );
};

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;

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
        paddingTop: sizes.PADDING * 0.8,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      groupNameInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.HEIGHT * 0.0116,
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.08,
        // shadowRadius: 4,
        // elevation: 2,
      },
      groupNameIconWrapper: {
        width: 30,
        height: 30,
        borderRadius: 99,
        backgroundColor: colors.SECONDARY,
        alignItems: 'center',
        justifyContent: 'center',
      },
      groupImagePreview: {
        width: 30,
        height: 30,
        borderRadius: 99,
      },
      groupNameInputError: {
        borderColor: colors.RED,
        borderWidth: 1,
      },
      errorText: {
        fontFamily: fonts.regular,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.RED,
        marginTop: scaleWithMax(4, 4),
      },
      generalErrorContainer: {
        backgroundColor: colors.RED + '15',
        borderRadius: sizes.BORDER_RADIUS_MID,
        padding: sizes.PADDING * 0.6,
        marginTop: sizes.HEIGHT * 0.015,
        borderWidth: 1,
        borderColor: colors.RED + '40',
      },
      generalErrorText: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.RED,
        textAlign: 'center',
      },
      groupNameInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.PRIMARY_TEXT,
        marginLeft: sizes.PADDING * 0.6,
        padding: 0,
      },
      membersHeading: {
        fontFamily: fonts.semibold,
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
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: userItemWidth,
      },
      selectedUsersContainer: {
        marginHorizontal: sizes.PADDING,
        marginVertical: sizes.HEIGHT * 0.003,
        marginBottom: sizes.HEIGHT * 0.01,
        paddingVertical: sizes.BORDER_RADIUS_MID,
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS_MID,
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
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: userItemWidth,
      },
      listCard: {
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS_HIGH,
      },
      listCardContainer: {
        marginBottom: sizes.HEIGHT * 0.018,
      },
      sectionTitle: {
        fontFamily: fonts.semibold,
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
      noFriendsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: sizes.HEIGHT * 0.26,
        paddingBottom: sizes.HEIGHT * 0.03,
      },
      noFriendsText: {
        ...theme.globalStyles.TEXT_STYLE,
        color: colors.BLACK,
        fontSize: sizes.FONTSIZE_BUTTON,
        paddingVertical: sizes.HEIGHT * 0.007,
        paddingBottom: sizes.HEIGHT * 0.03,
        textAlign: 'center',
      },
      emptyStateText: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.SECONDARY_GRAY,
        textAlign: 'center',
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default MemberSelectionModal;
