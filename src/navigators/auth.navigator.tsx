import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import Landing from '../screens/auth/landing/index.tsx';
import { AuthStackParamList } from '../types/navigation.types.ts';
import SignIn from '../screens/auth/sign-in/index.tsx';
import SignUp from '../screens/auth/sign-up/index.tsx';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Landing"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Landing" component={Landing} />
      <AuthStack.Screen name="SignIn" component={SignIn} />
      <AuthStack.Screen name="SignUp" component={SignUp} />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
