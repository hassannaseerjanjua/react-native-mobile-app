import React, { useState } from 'react';
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
  getGroupsDataApiResponse,
  GroupData,
} from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';

interface SendToGroupProps extends AppStackScreen<'SendToGroup'> {}

const SendToGroupScreen: React.FC<SendToGroupProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);

  const getGroupsData = useGetApi<GroupData[]>(apiEndpoints.GET_GROUPS, {
    withAuth: true,
    transformData: (data: getGroupsDataApiResponse) => data.Data.Items || [],
  });

  const getGroupMembersData = (): ActiveUser[] => {
    if (!selectedGroup) return [];

    return selectedGroup.UserGroupMembersList.map(member => ({
      UserId: member.UserId,
      FullName: member.FullName,
      ProfileUrl: member.ProfileUrl,
      RelationStatus: member.RelationStatus,
    }));
  };

  const handleEditGroup = (group: GroupData) => {
    setSelectedGroup(group);
    setIsMemberSelectionOpen(true);
  };

  const handleSaveMembers = (selectedMembers: ActiveUser[]) => {
    console.log('Saving members:', selectedMembers);
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
        {getGroupsData.loading ? (
          <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
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
                onDeletePress={() => {}}
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
        onSave={handleSaveMembers}
        title="Edit Group Members"
        listings={[
          {
            users: getGroupMembersData(),
          },
        ]}
      />
    </ParentView>
  );
};

export default SendToGroupScreen;
