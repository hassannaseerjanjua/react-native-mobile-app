import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import SkeletonLoader from '../../../components/SkeletonLoader';
import useStyles from './style';
import { useLocaleStore } from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';
import SearchUserItem from '../../../components/app/SearchUserItem';
import {
  GroupTabs,
  MemberSelectionModal,
} from '../../../components/send-a-gift';
import TabItem from '../../../components/global/TabItem';
import { ActiveUser, ActiveUsersApiResponse } from '../../../types';
import {
  SvgAddGroup,
  SvgFindFriendsIcon,
  SvgSearchFindFriendsIcon,
} from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import { useListingApi } from '../../../hooks/useListingApi';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';
import { scaleWithMax } from '../../../utils';
import CustomButton from '../../../components/global/Custombutton';
import { useFocusEffect } from '@react-navigation/native';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> {}

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation, route }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [activeTab, setActiveTab] = useState('friends');
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
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
        // userId: user?.UserId,
        friends: activeTab === 'friends',
      },
    },
  );

  useEffect(() => {
    if (activeTab !== 'group') {
      activeUsersApi.setExtraParams({
        // userId: user?.UserId,
        friends: activeTab === 'friends',
      });
    }
  }, [activeTab, user?.UserId]);

  // useFocusEffect(() => {
  //   setActiveTab('friends');
  // });

  const tabs = [
    {
      id: 'friends',
      title: getString('SG_FRIENDS'),
      onPress: () => {
        setActiveTab('friends');
      },
    },
    {
      id: 'group',
      title: getString('SG_GROUP'),
      onPress: () =>
        navigation.navigate('SendToGroup' as any, {
          routeTo: route.params.routeTo,
        }),
    },
    {
      id: 'others',
      title: getString('SG_OTHERS'),
      onPress: () => {
        setActiveTab('others');
      },
    },
  ];

  const getDisplayData = () => {
    const baseData = activeUsersApi.data || [];

    if (!activeUsersApi.search && user) {
      const currentUser: ActiveUser = {
        UserId: user.UserId,
        FullName: `${
          user.FullNameEn || user.FullNameAr || getString('SG_USER_ME')
        }${getString('SG_ME')}`,
        Email: user.Email,
        PhoneNo: user.PhoneNo,
        ProfileUrl: user.ProfileUrl,
        RelationStatus: 1,
        CityId: user.CityId,
      };

      return [currentUser, ...baseData];
    }

    return baseData;
  };

  const displayData = getDisplayData();
  const isLoading = activeUsersApi.loading;
  const searchQuery = activeUsersApi.search;
  const setSearchQuery = activeUsersApi.setSearch;

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={
          route.params.routeTo === 'SelectStore'
            ? getString('HOME_SEND_A_GIFT')
            : getString('HOME_GIFT_ONE_GET_ONE')
        }
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={getString('HOME_SEARCH')}
        rightSideTitle={getString('SG_NEW_GROUP')}
        rightSideTitlePress={() => {
          setIsMemberSelectionOpen(true);
        }}
        rightSideIcon={<SvgAddGroup />}
      />

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <GroupTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={(tabId: string) => {
              const tab = tabs.find(t => t.id === tabId);
              tab?.onPress?.();
            }}
          />
        </View>
        {route.params.routeTo === 'SelectStore' && (
          <View
            style={[
              styles.tabContainer,
              { paddingHorizontal: theme.sizes.PADDING },
            ]}
          >
            <TabItem
              title={getString('SG_SEND_THROUGH_LINK')}
              // onPress={handleShareGiftLink}
              onPress={() => {
                navigation.navigate('SelectCity', {
                  sendType: 2,
                });
              }}
              isLink={true}
            />
          </View>
        )}
        <View style={styles.scrollableContentContainer}>
          <Text style={styles.sectionTitle}>{getString('SG_FRIENDS')}</Text>
          {isLoading ? (
            <View style={styles.listCard}>
              <SkeletonLoader screenType="sendAGift" />
            </View>
          ) : displayData.length > 1 ? (
            <View style={styles.listCard}>
              <FlatList
                data={displayData}
                keyExtractor={item => item.UserId.toString()}
                renderItem={({ item, index }) => (
                  <SearchUserItem
                    item={item}
                    index={index}
                    isLast={index === displayData.length - 1}
                    showAddButton={false}
                    showSelection={false}
                    onPress={() => {
                      route.params.routeTo === 'SelectStore'
                        ? navigation.navigate('SelectStore', {
                            friendUserId: item.UserId,
                            CityId: item.CityId,
                            sendType: 1,
                          })
                        : navigation.navigate('CatchScreen', {
                            type: 'GiftOneGetOne',
                            friendUserId: item.UserId,
                          });
                    }}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                onEndReached={activeUsersApi.loadMore}
                onEndReachedThreshold={0.5}
              />
            </View>
          ) : (
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
                  navigation.navigate('Search', {
                    title: getString('C_CONNECT'),
                    showConnectOnly: true,
                  });
                }}
                type="primary"
              />
            </View>
          )}
        </View>
      </View>

      <MemberSelectionModal
        visible={isMemberSelectionOpen}
        onClose={() => {
          setIsMemberSelectionOpen(false);
        }}
        existingMembers={[]}
        onSave={() => {}}
        title={getString('NG_ADD_MEMBERS')}
        listings={[
          {
            title: getString('NG_TITLE_FRIENDS'),
            users: activeUsersApi.data || [],
          },
        ]}
        isSendAGift={true}
      />
    </ParentView>
  );
};

export default SendAGiftScreen;
