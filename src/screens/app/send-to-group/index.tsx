import React, { useState, useEffect } from 'react';
import { View, StatusBar, ActivityIndicator } from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
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
import useGetApi from '../../../hooks/useGetApi';
import api from '../../../utils/api';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';

interface SendToGroupProps extends AppStackScreen<'SendToGroup'> {}

const SendToGroupScreen: React.FC<SendToGroupProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);

  const { user } = useAuthStore();

  const activeUsersApi = useGetApi<ActiveUser[]>(
    apiEndpoints.GET_ACTIVE_USERS(user?.UserId, pageIndex, pageSize, true),
    {
      transformData: (data: ActiveUsersApiResponse) => data.Data.Items || [],
    },
  );

  console.log('activeUsersApi', activeUsersApi?.data);

  const getGroupsData = useGetApi<GroupData[]>(
    apiEndpoints.GET_GROUPS(searchQuery),
    {
      withAuth: true,
      transformData: (data: getGroupsDataApiResponse) => data.Data.Items || [],
    },
  );

  useEffect(() => {
    getGroupsData.refetch();
  }, [searchQuery]);

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
    api
      .delete(apiEndpoints.DELETE_GROUP, {
        params: {
          groupId: group.UserGroupId,
        },
      })
      .then(response => {
        console.log('Deleting group:', response);
        getGroupsData.refetch();
      })
      .catch(error => {
        console.log('Error deleting group:', error);
      });
  };

  const handleSaveGroupMembers = (selectedMembers: ActiveUser[]) => {
    if (!selectedGroup) return;

    const originalMemberIds = getGroupMembersData().map(m => m.UserId);
    const newMemberIds = selectedMembers.map(m => m.UserId);

    const addedMemberIds = newMemberIds.filter(
      id => !originalMemberIds.includes(id),
    );

    const removedMemberIds = originalMemberIds.filter(
      id => !newMemberIds.includes(id),
    );

    console.log('Added members:', addedMemberIds);
    console.log('Removed members:', removedMemberIds);

    const formData = new FormData();
    formData.append('UserGroupId', selectedGroup.UserGroupId.toString());
    formData.append('NameEn', selectedGroup.GroupName);

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
        console.log('Group updated successfully:', response.data);
        getGroupsData.refetch();
        setIsEditGroupOpen(false);
        setIsMemberSelectionOpen(false);
      })
      .catch(error => {
        console.log('Error updating group:', error);
      });
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
        rightSideTitle={
          isEditGroupOpen
            ? ''
            : getGroupsData?.data?.length !== 0
            ? 'Edit Group'
            : ''
        }
        rightSideTitlePress={() => setIsEditGroupOpen(true)}
        rightSideIcon={<SvgEditGroup />}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Group"
      />
      <View style={styles.content}>
        {getGroupsData.loading ? (
          <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
        ) : getGroupsData?.data?.length === 0 ? (
          <Text
            style={[
              theme.globalStyles.TEXT_STYLE,
              {
                textAlign: 'center',
              },
            ]}
          >
            No group found
          </Text>
        ) : (
          getGroupsData?.data?.map((group, index) => (
            <View key={group.UserGroupId}>
              <TabItem
                isGroupImage={group.ImageUrl}
                title={group.GroupName}
                onPress={
                  isEditGroupOpen
                    ? () => handleEditGroup(group)
                    : () => {
                        setSelectedGroup(group);
                        setIsViewMembersOpen(true);
                      }
                }
                isEditGroup={isEditGroupOpen}
                styles={styles.TabItem}
                onDeletePress={() => {
                  handleDeleteGroup(group);
                }}
                onEditPress={() => handleEditGroup(group)}
              />
              {index < (getGroupsData?.data?.length || 0) - 1 && (
                <View style={styles.tabSpacing} />
              )}
            </View>
          ))
        )}
      </View>

      <MemberSelectionModal
        visible={isViewMembersOpen}
        onClose={() => setIsViewMembersOpen(false)}
        existingMembers={getGroupMembersData()}
        onSave={() => {}}
        title="Group Members"
        listings={[
          {
            users: getGroupMembersData(),
          },
        ]}
        viewOnly={true}
      />

      <MemberSelectionModal
        visible={isMemberSelectionOpen}
        onClose={() => setIsMemberSelectionOpen(false)}
        existingMembers={getGroupMembersData()}
        onSave={handleSaveGroupMembers}
        title="Edit Group Members"
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
    </ParentView>
  );
};

export default SendToGroupScreen;
