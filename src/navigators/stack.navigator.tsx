import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

//Screens
import Home from '../screens/app/home/index.tsx';
import SearchScreen from '../screens/app/search/index.tsx';
import SendAGiftScreen from '../screens/app/send-a-gift/index.tsx';
import SendToGroupScreen from '../screens/app/send-to-group/index.tsx';
import {
  AppStackParamList,
  RootStackParamList,
} from '../types/navigation.types.ts';

// Navigators
import AuthStackNavigator from './auth.navigator';
import BottomTabNavigator from './bottom-tabs.navigator';

const AppStack = createNativeStackNavigator<AppStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppStackNavigator = () => {
  return (
    <AppStack.Navigator
      initialRouteName="BottomTabs"
      screenOptions={{ headerShown: false }}
    >
      <AppStack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <AppStack.Screen name="Search" component={SearchScreen} />
      <AppStack.Screen name="SendAGift" component={SendAGiftScreen} />
      <AppStack.Screen name="SendToGroup" component={SendToGroupScreen} />
    </AppStack.Navigator>
  );
};

const RootNavigator = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="App" component={AppStackNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
