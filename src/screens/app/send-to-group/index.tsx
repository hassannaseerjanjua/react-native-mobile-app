import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import HomeHeader from '../../../components/global/HomeHeader';
import TabItem from '../../../components/global/TabItem';
import MemberSelectionModal from '../../../components/global/MemberSelectionModal';
import { SvgEditGroup, SvgAddGroup } from '../../../assets/icons';
import {
  ActiveUser,
  ActiveUsersApiResponse,
  getGroupsDataApiResponse,
  GroupData,
} from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import { useListingApi } from '../../../hooks/useListingApi';
import api from '../../../utils/api';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';
import notify from '../../../utils/notify';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';

interface SendToGroupProps extends AppStackScreen<'SendToGroup'> { }

const SendToGroupScreen: React.FC<SendToGroupProps> = ({
  navigation,
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user, token } = useAuthStore();

  const activeUsersApi = useListingApi<ActiveUser>(
    apiEndpoints.GET_ACTIVE_USERS,
    token,
    {
      idExtractor: (item: ActiveUser) => item.UserId,
      transformData: (data: ActiveUsersApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      extraParams: {
        userId: user?.UserId,
        friends: true,
      },
    },
  );

  const getGroupsData = useListingApi<GroupData>(
    apiEndpoints.GET_GROUPS,
    token,
    {
      transformData: (data: getGroupsDataApiResponse) => ({
        data: data.Data?.Items || [],
        totalCount: data.Data?.TotalCount || 0,
      }),
      idExtractor: (item: GroupData) => item.UserGroupId,
    },
  );

  const getGroupMembersData = (): ActiveUser[] => {
    if (!selectedGroup) return [];

    return selectedGroup.UserGroupMembersList.map(member => ({
      UserId: member.UserId,
      FullName: member.FullName,
      Email: '',
      PhoneNo: '',
      ProfileUrl: member.ProfileUrl,
      RelationStatus: member.RelationStatus,
      IsVerified: member.IsVerified || false,
    }));
  };

  const handleEditGroup = (group: GroupData) => {
    setSelectedGroup(group);
    setIsMemberSelectionOpen(true);
  };

  const handleDeleteGroup = (group: GroupData) => {
    setGroupToDelete(group);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;

    const group = groupToDelete;

    // Close modal immediately
    setShowDeleteModal(false);

    api
      .delete(apiEndpoints.DELETE_GROUP, {
        params: {
          groupId: group.UserGroupId,
        },
      })
      .then(async response => {
        if (response.success) {
          setGroupToDelete(null);
          setIsEditGroupOpen(false);
          // Clear data immediately to show "New Group" button
          getGroupsData.setData([]);
          // Then refresh from API
          getGroupsData.recall();
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(error => {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      });
  };

  useEffect(() => {
    if (isRefreshing && !getGroupsData.loading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, getGroupsData.loading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    getGroupsData.recall();
  };

  const handleCreateGroup = (
    selectedMembers: ActiveUser[],
    groupName?: string,
    groupImage?: { uri: string; type: string; name: string } | null,
  ) => {
    // Refresh data after group creation (handled by MemberSelectionModal)
    getGroupsData.recall();
  };

  const handleSaveGroupMembers = (
    selectedMembers: ActiveUser[],
    groupName?: string,
    groupImage?: { uri: string; type: string; name: string } | null,
  ) => {
    if (!selectedGroup) return;

    const originalMemberIds = getGroupMembersData().map(m => m.UserId);
    const newMemberIds = selectedMembers.map(m => m.UserId);

    const addedMemberIds = newMemberIds.filter(
      id => !originalMemberIds.includes(id),
    );

    const removedMemberIds = originalMemberIds.filter(
      id => !newMemberIds.includes(id),
    );

    const formData = new FormData();
    formData.append('UserGroupId', selectedGroup.UserGroupId.toString());
    formData.append('NameEn', groupName || selectedGroup.GroupName);

    if (groupImage) {
      formData.append('File', {
        uri: groupImage.uri,
        type: groupImage.type,
        name: groupImage.name,
      } as any);
    }

    addedMemberIds.forEach(id => {
      formData.append('MemberUserIds', id.toString());
    });

    removedMemberIds.forEach(id => {
      formData.append('RemovedMemberUserIds', id.toString());
    });

    api
      .put(apiEndpoints.EDIT_GROUP_MEMBERS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(response => {
        if (response.success) {
          getGroupsData.recall();
          setIsEditGroupOpen(false);
          setIsMemberSelectionOpen(false);
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(error => {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      });
  };

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={getString('STG_SEND_TO_GROUP')}
        showBackButton
        onBackPress={() => {
          isEditGroupOpen ? setIsEditGroupOpen(false) : navigation.goBack();
        }}
        showSearch={false}
        showSearchBar
        rightSideTitle={
          isEditGroupOpen
            ? ''
            : (getGroupsData?.data || []).length !== 0
              ? getString('STG_EDIT_GROUP')
              : getString('SG_NEW_GROUP') || 'New Group'
        }
        rightSideTitlePress={() => {
          if ((getGroupsData?.data || []).length !== 0) {
            setIsEditGroupOpen(true);
          } else {
            activeUsersApi.recall();
            setIsCreateGroupOpen(true);
          }
        }}
        rightSideIcon={
          (getGroupsData?.data || []).length !== 0 ? (
            <SvgEditGroup />
          ) : (
            <SvgAddGroup />
          )
        }
        searchValue={getGroupsData.search}
        onSearchChange={getGroupsData.setSearch}
        searchPlaceholder={getString('STG_SEARCH_GROUP')}
      />
      {getGroupsData.loading && !isRefreshing ? (
        <View style={styles.content}>
          <SkeletonLoader screenType="sendToGroup" />
        </View>
      ) : (
        <FlatList
          data={getGroupsData.data || []}
          keyExtractor={item => item.UserGroupId.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.PRIMARY}
              colors={[theme.colors.PRIMARY]}
            />
          }
          renderItem={({ item: group }) => (
            <TabItem
              isGroupImage={
                group.ImageUrl ||
                require('../../../assets/images/img-placeholder.png')
              }
              title={group.GroupName}
              onPress={
                isEditGroupOpen
                  ? () => handleEditGroup(group)
                  : () => {
                    setSelectedGroup(group);
                    setIsViewMembersOpen(true);
                    setTimeout(() => {
                      setIsEditGroupOpen(false);
                    }, 300);
                  }
              }
              isEditGroup={isEditGroupOpen}
              TabItemStyles={styles.TabItem}
              onDeletePress={() => {
                handleDeleteGroup(group);
              }}
              onEditPress={() => handleEditGroup(group)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.tabSpacing} />}
          onEndReached={
            getGroupsData.hasMore ? getGroupsData.loadMore : undefined
          }
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={{ height: theme.sizes.HEIGHT * 0.67 }}>
              <PlaceholderLogoText
                text={getString('STG_NO_GROUP_FOUND')}
              />
            </View>
          }
          ListFooterComponent={
            getGroupsData.loadingMore ? (
              <View
                style={{
                  paddingVertical: theme.sizes.HEIGHT * 0.02,
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="small" color={theme.colors.PRIMARY} />
              </View>
            ) : null
          }
          contentContainerStyle={[
            styles.content,
            (getGroupsData.data || []).length === 0 && { flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <MemberSelectionModal
        visible={isViewMembersOpen}
        onClose={() => setIsViewMembersOpen(false)}
        existingMembers={getGroupMembersData()}
        onSave={() => { }}
        title={selectedGroup?.GroupName || getString('STG_GROUP_MEMBERS')}
        listings={[
          {
            users: getGroupMembersData(),
          },
        ]}
        viewOnly={true}
        routeTo={route.params?.routeTo}
      />

      <MemberSelectionModal
        visible={isMemberSelectionOpen}
        onClose={() => setIsMemberSelectionOpen(false)}
        existingMembers={getGroupMembersData()}
        onSave={handleSaveGroupMembers}
        title={getString('STG_EDIT_GROUP_MEMBERS')}
        existingGroupImage={selectedGroup?.ImageUrl}
        existingGroupName={selectedGroup?.GroupName}
        listings={[
          {
            users: [
              ...getGroupMembersData(),
              ...(activeUsersApi?.data || []),
            ].filter(
              (user, index, self) =>
                index === self.findIndex(u => u.UserId === user.UserId),
            ),
          },
        ]}
      />

      <MemberSelectionModal
        visible={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        existingMembers={[]}
        onSave={handleCreateGroup}
        title={getString('NG_ADD_MEMBERS') || 'Add Members'}
        listings={[
          {
            title: getString('NG_TITLE_FRIENDS') || 'Friends',
            users: activeUsersApi.data || [],
          },
        ]}
        isSendAGift={true}
      />

      <ConfirmationPopup
        visible={showDeleteModal}
        title={getString('STG_DELETE_GROUP')}
        message={
          groupToDelete?.GroupName
            ? `${getString('STG_DELETE_GROUP_CONFIRM')} "${
                groupToDelete.GroupName
              }"?`
            : getString('STG_DELETE_GROUP_CONFIRM')
        }
        confirmText={getString('STG_DELETE')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={confirmDeleteGroup}
        onCancel={() => {
          setShowDeleteModal(false);
          setTimeout(() => setGroupToDelete(null), 300);
        }}
      />
    </ParentView>
  );
};

export default SendToGroupScreen;
