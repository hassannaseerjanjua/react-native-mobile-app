import React, { Suspense, lazy, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

import Home from '../screens/app/home/index';
import Settings from '../screens/app/settings/index';

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});
import {
  AppStackParamList,
  RootStackParamList,
} from '../types/navigation.types.ts';

import AuthStackNavigator from './auth.navigator';

const AppStack = createNativeStackNavigator<AppStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppStackNavigator = () => {
  return (
    <AppStack.Navigator
      initialRouteName="Settings"
      screenOptions={{ headerShown: false }}
    >
      <AppStack.Screen name="Settings" component={Settings} />
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
