import React, { useState } from 'react';
import { View, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import HomeHeader from '../../../components/global/HomeHeader';
import TabItem from '../../../components/global/TabItem';
import { MemberSelectionModal } from '../../../components/send-a-gift';
import { SvgEditGroup } from '../../../assets/icons';
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

interface SendToGroupProps extends AppStackScreen<'SendToGroup'> {}

const SendToGroupScreen: React.FC<SendToGroupProps> = ({
  navigation,
  route,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupData | null>(null);

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
    }));
  };

  const handleEditGroup = (group: GroupData) => {
    setSelectedGroup(group);
    setIsMemberSelectionOpen(true);
  };

  const handleDeleteGroup = (group: GroupData) => {
    setGroupToDelete(group);
  };

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;

    const group = groupToDelete;

    api
      .delete(apiEndpoints.DELETE_GROUP, {
        params: {
          groupId: group.UserGroupId,
        },
      })
      .then(response => {
        if (response.success) {
          setTimeout(() => {
            setGroupToDelete(null);
          }, 300);

          getGroupsData.recall();
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(error => {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      });
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
            : ''
        }
        rightSideTitlePress={() => setIsEditGroupOpen(true)}
        rightSideIcon={<SvgEditGroup />}
        searchValue={getGroupsData.search}
        onSearchChange={getGroupsData.setSearch}
        searchPlaceholder={getString('STG_SEARCH_GROUP')}
      />
      {getGroupsData.loading ? (
        <View style={styles.content}>
          <SkeletonLoader screenType="sendToGroup" />
        </View>
      ) : (
        <FlatList
          data={getGroupsData.data || []}
          keyExtractor={item => item.UserGroupId.toString()}
          renderItem={({ item: group }) => (
            <TabItem
              isGroupImage={group.ImageUrl}
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
            <View
              style={[
                styles.content,
                { justifyContent: 'center', alignItems: 'center', flexGrow: 1 },
              ]}
            >
              <Text
                style={[
                  theme.globalStyles.TEXT_STYLE,
                  {
                    textAlign: 'center',
                  },
                ]}
              >
                {getString('STG_NO_GROUP_FOUND')}
              </Text>
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
        onSave={() => {}}
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

      <ConfirmationPopup
        visible={!!groupToDelete}
        title={getString('STG_DELETE_GROUP')}
        message={`${getString('STG_DELETE_GROUP_CONFIRM')} "${groupToDelete?.GroupName}"?`}
        confirmText={getString('STG_DELETE')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={confirmDeleteGroup}
        onCancel={() => setGroupToDelete(null)}
      />
    </ParentView>
  );
};

export default SendToGroupScreen;
