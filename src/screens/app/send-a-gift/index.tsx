import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import { SvgDummyAvatar } from '../../../assets/icons';
import { useLocaleStore } from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';

interface SendAGiftProps extends AppStackScreen<'SendAGift'> {}

const SendAGiftScreen: React.FC<SendAGiftProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ParentView>
      <View style={styles.container}>
        <StatusBar
          backgroundColor={theme.colors.BACKGROUND}
          barStyle="dark-content"
        />
        <HomeHeader
          title={getString('HOME_SEND_A_GIFT')}
          showBackButton
          onBackPress={() => navigation.goBack()}
          showSearch={false}
          showSearchBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={getString('HOME_SEARCH')}
        />

        <View style={styles.content}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Search for friends to send a gift
            </Text>
          </View>
        </View>
      </View>
    </ParentView>
  );
};

export default SendAGiftScreen;
