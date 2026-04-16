import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../types/navigation.types';
import SignIn from '../screens/auth/sign-in/index';
import SignUp from '../screens/auth/sign-up/index';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="SignIn"
      screenOptions={{ headerShown: false }}
    >

      <AuthStack.Screen
        name="SignIn"
        component={SignIn}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
