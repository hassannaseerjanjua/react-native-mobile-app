import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Screens
import Home from '../screens/app/home/index.tsx';
import { AppStackParamList } from '../types/navigation.types.ts';

// Navigators
import AuthStackNavigator from './auth.navigator';

const AppStack = createNativeStackNavigator<AppStackParamList>();

const AppStackNavigator = () => {
  return (
    <AppStack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <AppStack.Screen name="Home" component={Home} />
    </AppStack.Navigator>
  );
};

const RootNavigator = ({}) => {
  return <AuthStackNavigator />;
};

export default RootNavigator;
