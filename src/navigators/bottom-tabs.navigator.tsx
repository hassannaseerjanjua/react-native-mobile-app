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

// Screens
import Home from '../screens/app/home/index';
import Favorites from '../screens/app/favorites/index';
import Occasions from '../screens/app/occasions/index';
import Notifications from '../screens/app/notifications/index';
import useTheme from '../styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity, View } from 'react-native';
import { isAndroidThen, isIOSThen, scaleWithMax } from '../utils';
import { useLocaleStore } from '../store/reducer/locale';
import { Text } from '../utils/elements';

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
              tabBarLabel: getString('FOOTER_HOME'),
              tabBarIcon: ({ color, size }) => (
                <SvgHome width={size} height={size} fill={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={Favorites as any}
            options={{
              tabBarLabel: getString('FOOTER_FAVORITES'),
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
              tabBarLabel: getString('FOOTER_OCCASIONS'),
              tabBarIcon: ({ color, size }) => (
                <SvgOccasions width={size} height={size} fill={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Notifications"
            component={Notifications}
            options={{
              tabBarLabel: getString('FOOTER_NOTIFICATIONS'),
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
  return (
    <View
      style={{
        backgroundColor: theme.colors.BACKGROUND,
        borderTopColor: theme.colors.SECONDARY_GRAY,
        borderTopWidth: 0,
        paddingHorizontal: scaleWithMax(10, 12),

        height: isAndroidThen(scaleWithMax(70, 75), undefined),
        // paddingBottom: 8,
        // paddingTop: 8,
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
            <View style={{}}>{getIcon(route.name, iconSize, isFocused)}</View>
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
