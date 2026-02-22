import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  SvgHome,
  SvgFavourite,
  SvgOccasions,
  SvgNotification,
  SvgHomeActive,
  SvgHomeInactive,
  SvgFavouriteActive,
  SvgFavouriteInactive,
  SvgOccasionsActive,
  SvgOccasionsInactive,
  SvgNotificationActive,
  SvgNotificationInactive,
} from '../assets/icons';

import Home from '../screens/app/home/index';
import Favorites from '../screens/app/favorites/index';
import Occasions from '../screens/app/occasions/index';
import Notifications from '../screens/app/notifications/index';
import useTheme from '../styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity, View, DeviceEventEmitter } from 'react-native';
import { isAndroidThen, isIOSThen, scaleWithMax } from '../utils';
import { useLocaleStore } from '../store/reducer/locale';
import { Text } from '../utils/elements';
import { useAuthStore } from '../store/reducer/auth';
import notify from '../utils/notify';
import useGetApi from '../hooks/useGetApi';
import apiEndpoints from '../constants/api-endpoints';
import fonts from '../assets/fonts';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const theme = useTheme();
  const { getString } = useLocaleStore();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.BACKGROUND }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Tab.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={Home}
            options={{
              tabBarLabel:
                getString('FOOTER_HOME') === 'FOOTER_HOME'
                  ? 'Home'
                  : getString('FOOTER_HOME'),
              tabBarIcon: ({ color, size }) => (
                <SvgHome width={size} height={size} fill={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={Favorites as any}
            options={{
              tabBarLabel:
                getString('FOOTER_FAVORITES') === 'FOOTER_FAVORITES'
                  ? 'Favorites'
                  : getString('FOOTER_FAVORITES'),
              tabBarIcon: ({ color, size }) => (
                <SvgFavourite width={size} height={size} fill={color} />
              ),
            }}
            initialParams={{ redirectionType: 'home' }}
          />
          <Tab.Screen
            name="Occasions"
            component={Occasions}
            options={{
              tabBarLabel:
                getString('FOOTER_OCCASIONS') === 'FOOTER_OCCASIONS'
                  ? 'Occasions'
                  : getString('FOOTER_OCCASIONS'),
              tabBarIcon: ({ color, size }) => (
                <SvgOccasions width={size} height={size} fill={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Notifications"
            component={Notifications}
            options={{
              tabBarLabel:
                getString('FOOTER_NOTIFICATIONS') === 'FOOTER_NOTIFICATIONS'
                  ? 'Notifications'
                  : getString('FOOTER_NOTIFICATIONS'),
              tabBarIcon: ({ color, size }) => (
                <SvgNotification width={size} height={size} fill={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </SafeAreaView>
    </View>
  );
};

export default BottomTabNavigator;

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { getString } = useLocaleStore();
  const isMerchant = user?.isMerchant === 1;

  const getNotificationCount = useGetApi<any>(
    isAuthenticated ? apiEndpoints.GET_UNSEEN_NOTIFICATION_COUNT : '',
    {
      transformData: data => data.Data,
    },
  );

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const subscription = DeviceEventEmitter.addListener(
      'REFRESH_NOTIFICATIONS_COUNT',
      () => getNotificationCount.refetch(),
    );
    return () => subscription.remove();
  }, [isAuthenticated, getNotificationCount]);

  return (
    <View
      style={{
        backgroundColor: theme.colors.BACKGROUND,
        borderTopColor: theme.colors.SECONDARY_GRAY,
        borderTopWidth: 0,
        paddingHorizontal: scaleWithMax(10, 12),

        height: isAndroidThen(scaleWithMax(70, 75), undefined),
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        flexDirection: 'row',
        ...theme.globalStyles.SHADOW_STYLE,
      }}
    >
      <View
        style={{
          position: 'absolute',
          bottom: -scaleWithMax(15, 17.5) + 2,
          width: theme.sizes.WIDTH,
          backgroundColor: theme.colors.BACKGROUND,
          height: scaleWithMax(30, 35),
        }}
      />
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            if (
              isMerchant &&
              (route.name === 'Favorites' || route.name === 'Occasions')
            ) {
              notify.error(
                getString('MERCHANT_NOT_ALLOWED') === 'MERCHANT_NOT_ALLOWED'
                  ? 'Merchant not allowed'
                  : getString('MERCHANT_NOT_ALLOWED'),
              );
              return;
            }
            navigation.navigate(route.name);
          }
        };

        const iconSize = scaleWithMax(25, 30);

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: isIOSThen(scaleWithMax(10, 12), 0),
            }}
          >
            {isFocused && (
              <View
                style={{
                  width: scaleWithMax(30, 35),
                  height: scaleWithMax(4.5, 5),
                  borderRadius: 10,
                  backgroundColor: theme.colors.PRIMARY,
                  position: 'absolute',
                  top: 0,
                }}
              />
            )}
            <View style={{ position: 'relative' }}>
              {getIcon(route.name, iconSize, isFocused)}
              {route.name === 'Notifications' &&
                getNotificationCount.data?.Count > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -scaleWithMax(2, 3),
                      right: -scaleWithMax(2, 3),
                      backgroundColor: theme.colors.PRIMARY,
                      borderRadius: 999,
                      minWidth: scaleWithMax(16, 18),
                      height: scaleWithMax(16, 18),
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.WHITE,
                        fontSize: scaleWithMax(9, 10),
                        fontFamily: fonts.Quicksand.bold,
                        lineHeight: scaleWithMax(14, 16),
                        textAlign: 'center',
                      }}
                    >
                      {getNotificationCount.data.Count}
                    </Text>
                  </View>
                )}
            </View>
            <Text
              style={{
                ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                paddingTop: 3,
                fontSize: scaleWithMax(11, 12),
                color: isFocused
                  ? theme.colors.PRIMARY
                  : theme.colors.SECONDARY_TEXT,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getIcon = (name: string, iconSize: number, isFocused: boolean) => {
  const style = {
    width: iconSize,
    height: iconSize,
  };

  switch (name) {
    case 'Home':
      return isFocused ? (
        <SvgHomeActive {...style} />
      ) : (
        <SvgHomeInactive {...style} />
      );
    case 'Favorites':
      return isFocused ? (
        <SvgFavouriteActive {...style} />
      ) : (
        <SvgFavouriteInactive {...style} />
      );
    case 'Occasions':
      return isFocused ? (
        <SvgOccasionsActive {...style} />
      ) : (
        <SvgOccasionsInactive {...style} />
      );
    case 'Notifications':
      return isFocused ? (
        <SvgNotificationActive {...style} />
      ) : (
        <SvgNotificationInactive {...style} />
      );
  }
};
