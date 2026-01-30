import React from 'react';
import { View, StatusBar, FlatList } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import NotificationItem from '../../../components/global/NotificationItem.tsx';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';

const NotificationsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation();

  const mockNotifications = [
    {
      id: 1,
      title: `${getString(
        'NOT_NEW_FRAGRANCE_COLLECTION_AVAILABLE_AT',
      )} ${getString('FAV_MOCK_PERFUME_HOUSE')}`,
      image: require('../../../assets/images/perfumeHouse.png'),
      time: `2 ${getString('NOT_TIME_HRS_AGO')}`,
      boldText: getString('FAV_MOCK_PERFUME_HOUSE'),
    },
    {
      id: 2,
      title: `${getString('NOT_SPECIAL_OFFER_AT')} ${getString(
        'FAV_MOCK_GYM',
      )} - ${getString('NOT_LIMITED_TIME_ONLY')}`,
      image: require('../../../assets/images/storeLogo.png'),
      time: `4 ${getString('NOT_TIME_HRS_AGO')}`,
      boldText: getString('FAV_MOCK_GYM'),
    },
    {
      id: 3,
      title: `${getString('NOT_YOUR_SPECIAL_PRICE_MENU_AT')} ${getString(
        'FAV_MOCK_COFFEMATICS',
      )}`,
      image: require('../../../assets/images/coffeematics.png'),
      time: `1 ${getString('NOT_TIME_DAY_AGO')}`,
      boldText: getString('FAV_MOCK_COFFEMATICS'),
    },
  ];
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={getString('NOT_NOTIFICATIONS')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={mockNotifications}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <PlaceholderLogoText text={'No notifications found'} />
        }
        renderItem={({ item }: { item: (typeof mockNotifications)[0] }) => (
          <NotificationItem
            title={item.title}
            onPress={() => { }}
            NotificationItemStyles={styles.NotificationItem}
            isGroupImage={item.image}
            time={item.time}
            boldText={item.boldText}
          />
        )}
      />
    </View>
  );
};

export default NotificationsScreen;
