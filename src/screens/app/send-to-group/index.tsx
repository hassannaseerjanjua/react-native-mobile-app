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
import { SvgCrossIcon } from '../../../assets/icons';
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
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Group"
      />
      <View style={styles.content}>
        <TabItem
          isGroup={true}
          title="My Group"
          onPress={openModal}
          isEditGroup={isEditGroupOpen}
          styles={styles.TabItem}
        />
        <View style={styles.tabSpacing} />
        <TabItem
          isGroup={true}
          title="Work Group"
          onPress={openModal}
          isEditGroup={isEditGroupOpen}
          styles={styles.TabItem}
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
    </ParentView>
  );
};

export default SendToGroupScreen;
