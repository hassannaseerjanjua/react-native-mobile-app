import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

//Screens
import Home from '../screens/app/home/index.tsx';
import SearchScreen from '../screens/app/search/index.tsx';
import SendAGiftScreen from '../screens/app/send-a-gift/index.tsx';
import SendToGroupScreen from '../screens/app/send-to-group/index.tsx';
import ProfileScreen from '../screens/app/profile/index.tsx';
import WalletScreen from '../screens/app/wallet/index.tsx';
import FAQScreen from '../screens/app/faq/index.tsx';
import SettingsScreen from '../screens/app/settings/index.tsx';
import ContactUsScreen from '../screens/app/contact-us/index.tsx';
import OrdersScreen from '../screens/app/orders/index.tsx';
import {
  AppStackParamList,
  RootStackParamList,
} from '../types/navigation.types.ts';

// Navigators
import AuthStackNavigator from './auth.navigator';
import BottomTabNavigator from './bottom-tabs.navigator';
import StaticConent from '../screens/app/static-content/index.tsx';
import ProductDetails from '../screens/app/product-detail/index.tsx';
import GiftMessage from '../screens/app/gift-message/index.tsx';
import CheckOut from '../screens/app/checkout/index.tsx';
import AddToCart from '../screens/app/add-card/index.tsx';
import AddCart from '../screens/app/add-card/index.tsx';
import OutBox from '../screens/app/outbox/index.tsx';
import Inbox from '../screens/app/inbox/index.tsx';
import LocationSelection from '../screens/app/location-selection/index.tsx';
import ScanQr from '../screens/app/scan-qr/index.tsx';
import CatchScreen from '../screens/app/catch/index.tsx';

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
      <AppStack.Screen name="Wallet" component={WalletScreen} />
      <AppStack.Screen name="GiftMessage" component={GiftMessage} />
      <AppStack.Screen name="CheckOut" component={CheckOut} />
      <AppStack.Screen name="AddCard" component={AddCart} />
      <AppStack.Screen name="OutBox" component={OutBox} />
      <AppStack.Screen name="Inbox" component={Inbox} />
      <AppStack.Screen name="LocationSelection" component={LocationSelection} />
      <AppStack.Screen name="ScanQr" component={ScanQr} />
      <AppStack.Screen name="Catch" component={CatchScreen} />

      <AppStack.Screen name="ProductDetails" component={ProductDetails} />
      <AppStack.Screen name="FAQ" component={FAQScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
      <AppStack.Screen name="ContactUs" component={ContactUsScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="Orders" component={OrdersScreen} />
      <AppStack.Screen name="StaticContent" component={StaticConent} />
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
