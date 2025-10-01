import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import { SvgDummyAvatar, SvgSearchAdd } from '../../../assets/icons';
import { ActiveUser, ActiveUsersApiResponse } from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useAuthStore } from '../../../store/reducer/auth';

const initialUsers = [
  { id: '1', name: 'Hassan Haddad', avatar: <SvgDummyAvatar />, added: false },
  {
    id: '2',
    name: 'Mohammed Almosilhi',
    avatar: <SvgDummyAvatar />,
    added: false,
  },
  { id: '3', name: 'Shwail', avatar: <SvgDummyAvatar />, added: true },
  { id: '4', name: 'Aziz Bakheet', avatar: <SvgDummyAvatar />, added: false },
  {
    id: '5',
    name: 'Mohammed Qaderi',
    avatar: <SvgDummyAvatar />,
    added: false,
  },
];

interface SearchProps extends AppStackScreen<'Search'> {}

const SearchScreen: React.FC<SearchProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const { user } = useAuthStore();

  const activeUsersApi = useGetApi<ActiveUsersApiResponse>(
    apiEndpoints.GET_ACTIVE_USERS(user?.UserId),
    {
      transformData: data => data.Data,
    },
  );

  console.log('activeUsersApi', activeUsersApi?.data);

  const handleAddUser = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, added: !user.added } : user,
      ),
    );
  };

  const renderItem = ({ item, index }: any) => {
    const isLast = index === users.length - 1;

    const avatarElement = React.isValidElement(item.avatar)
      ? React.cloneElement(item.avatar, { width: 36, height: 36 })
      : item.avatar;

    return (
      <View style={[styles.userRow, !isLast && styles.userRowDivider]}>
        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>{avatarElement}</View>
          <Text style={styles.userName}>{item.name}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.addButton, item.added && styles.addedButton]}
          onPress={() => handleAddUser(item.id)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {!item.added && <SvgSearchAdd width={16} height={16} />}
            <Text
              style={[
                styles.addButtonText,
                item.added && styles.addedButtonText,
              ]}
            >
              {item.added ? 'Added' : 'Add'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title="Search"
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search"
      />

      <View style={styles.content}>
        <View style={styles.listCard}>
          <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </View>
    </View>
  );
};

export default SearchScreen;
