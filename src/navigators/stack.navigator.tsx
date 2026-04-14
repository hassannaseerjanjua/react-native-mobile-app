import React, { Suspense, lazy, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

import Home from '../screens/app/home/index.tsx';
import SearchScreen from '../screens/app/search/index.tsx';
import SendAGiftFallback from '../screens/app/send-a-gift/SendAGiftFallback';
import SendToGroupScreen from '../screens/app/send-to-group/index.tsx';

const SendAGiftScreen = lazy(
  () => import('../screens/app/send-a-gift/index.tsx'),
);

const SendAGiftWithFallback = (props: any) => {
  // Overlay only until the lazy screen mounts and calls onReady — not on every
  // focus (going back from SelectStore would briefly show the skeleton otherwise).
  const [showFallback, setShowFallback] = useState(true);
  const onReady = useCallback(() => setShowFallback(false), []);

  return (
    <View style={styles.wrapper}>
      <Suspense fallback={<SendAGiftFallback />}>
        <SendAGiftScreen {...props} onReady={onReady} />
      </Suspense>
      {showFallback && (
        <View style={StyleSheet.absoluteFill}>
          <SendAGiftFallback />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});
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

import AuthStackNavigator from './auth.navigator';
import BottomTabNavigator from './bottom-tabs.navigator';
import StaticContent from '../screens/app/static-content/index.tsx';
import ProductDetails from '../screens/app/product-detail/index.tsx';
import GiftMessage from '../screens/app/gift-message/index.tsx';
import CheckOut from '../screens/app/checkout/index.tsx';
import AddCart from '../screens/app/add-card/index.tsx';
import InboxOutbox from '../screens/app/inbox-outbox/index.tsx';
import LocationSelection from '../screens/app/location-selection/index.tsx';
import ScanQr from '../screens/app/scan-qr/index.tsx';
import CatchScreen from '../screens/app/catch/index.tsx';
import SelectStore from '../screens/app/select-store/index.tsx';
import StoreProducts from '../screens/app/store-products/index.tsx';
import GiftOneGetOneScreen from '../screens/app/gift-one-get-one/index.tsx';
import SelectCity from '../screens/app/select-city/index.tsx';
import ProfileImageViewer from '../screens/app/profile-image-viewer/index.tsx';

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
      <AppStack.Screen name="SendAGift" component={SendAGiftWithFallback} />
      <AppStack.Screen name="SendToGroup" component={SendToGroupScreen} />
      <AppStack.Screen name="Wallet" component={WalletScreen} />
      <AppStack.Screen name="GiftMessage" component={GiftMessage} />
      <AppStack.Screen name="CheckOut" component={CheckOut} />
      <AppStack.Screen name="AddCard" component={AddCart} />
      <AppStack.Screen name="InboxOutbox" component={InboxOutbox} />
      <AppStack.Screen name="LocationSelection" component={LocationSelection} />
      <AppStack.Screen name="ScanQr" component={ScanQr} />
      <AppStack.Screen name="CatchScreen" component={CatchScreen} />
      <AppStack.Screen name="SelectStore" component={SelectStore} />
      <AppStack.Screen name="SelectCity" component={SelectCity} />
      <AppStack.Screen name="StoreProducts" component={StoreProducts} />
      <AppStack.Screen name="GiftOneGetOne" component={GiftOneGetOneScreen} />
      <AppStack.Screen name="ProductDetails" component={ProductDetails} />
      <AppStack.Screen name="FAQ" component={FAQScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
      <AppStack.Screen name="ContactUs" component={ContactUsScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="ProfileImageViewer" component={ProfileImageViewer} />
      <AppStack.Screen name="Orders" component={OrdersScreen} />
      <AppStack.Screen name="StaticContent" component={StaticContent} />
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
