import React from 'react';
import { View, StatusBar, FlatList } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import NotificationItem from '../../../components/global/NotificationItem.tsx';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';
import { NotificationType } from '../../../utils/notification_enums';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../types/navigation.types.ts';

const NotificationsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation =
  useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const mockNotifications = [
    {
      id: 1,
      type: NotificationType.SpecialPriceMenu,
      title: `${getString(
        'NOT_NEW_FRAGRANCE_COLLECTION_AVAILABLE_AT',
      )} ${getString('FAV_MOCK_PERFUME_HOUSE')}`,
      image: require('../../../assets/images/perfumeHouse.png'),
      time: `2 ${getString('NOT_TIME_HRS_AGO')}`,
      boldText: getString('FAV_MOCK_PERFUME_HOUSE'),
    },
    {
      id: 2,
      type: NotificationType.SpecialPriceMenu,
      title: `${getString('NOT_SPECIAL_OFFER_AT')} ${getString(
        'FAV_MOCK_GYM',
      )} - ${getString('NOT_LIMITED_TIME_ONLY')}`,
      image: require('../../../assets/images/storeLogo.png'),
      time: `4 ${getString('NOT_TIME_HRS_AGO')}`,
      boldText: getString('FAV_MOCK_GYM'),
    },
    {
      id: 3,
      type: NotificationType.SpecialPriceMenu,
      title: `${getString('NOT_YOUR_SPECIAL_PRICE_MENU_AT')} ${getString(
        'FAV_MOCK_COFFEMATICS',
      )}`,
      image: require('../../../assets/images/coffeematics.png'),
      time: `1 ${getString('NOT_TIME_DAY_AGO')}`,
      boldText: getString('FAV_MOCK_COFFEMATICS'),
    },
  ];

 const handleNotificationPress = (notificationType: NotificationType) => {
  switch (notificationType) {
    case NotificationType.SupportRequest:
      navigation.navigate('ContactUs');
      break;

    case NotificationType.AdminPanelNotification:
      navigation.navigate('BottomTabs');
      break;

    case NotificationType.GiftReceived:
     navigation.navigate('InboxOutbox', {
            title: getString('HOME_INBOX'),
            isInbox: true,
          });
      break;

    case NotificationType.GiftRedeem:
      navigation.navigate('Wallet');
      break;

    case NotificationType.SpecialPriceMenu:
      navigation.navigate('StoreProducts', {});
      break;

    case NotificationType.AddFriend:
      navigation.navigate('Profile');
      break;

    case NotificationType.Catch:
      navigation.navigate('CatchScreen', {
        type: 'catch',
      });
      break;

    case NotificationType.G1G1:
      navigation.navigate('GiftOneGetOne');
      break;

    case NotificationType.BirthdayNotification:
      navigation.navigate('SendAGift', {
        routeTo: 'SelectStore',
      });
      break;

    case NotificationType.OccasionNotification:
      navigation.navigate('Occasions',
);
      break;

    default:
      break;
  }
};

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
          <View style={{ height: theme.sizes.HEIGHT * 0.68 }}>
            <PlaceholderLogoText text={'No notifications found'} />
          </View>
        }
        renderItem={({ item }: { item: (typeof mockNotifications)[0] }) => (
          <NotificationItem
            title={item.title}
            onPress={() => handleNotificationPress(item.type)}
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
