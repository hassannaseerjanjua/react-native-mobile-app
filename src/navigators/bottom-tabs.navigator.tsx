import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  SvgHome,
  SvgFavourite,
  SvgOccasions,
  SvgNotification,
} from '../assets/icons';

// Screens
import Home from '../screens/app/home/index';
import Favourites from '../screens/app/favourites/index';
import Occasions from '../screens/app/occasions/index';
import Notifications from '../screens/app/notifications/index';
import useTheme from '../styles/theme';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.BACKGROUND,
          borderTopColor: theme.colors.SECONDARY_GRAY,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
        },
        tabBarActiveTintColor: theme.colors.PRIMARY,
        tabBarInactiveTintColor: theme.colors.SECONDARY_TEXT,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SvgHome width={size} height={size} fill={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favourites"
        component={Favourites}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SvgFavourite width={size} height={size} fill={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Occasions"
        component={Occasions}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SvgOccasions width={size} height={size} fill={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SvgNotification width={size} height={size} fill={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
