import { LinkingOptions } from '@react-navigation/native';
import {
  AppStackParamList,
  AuthStackParamList,
} from '../types/navigation.types';

export const linking: LinkingOptions<AppStackParamList | AuthStackParamList> = {
  prefixes: ['giftee://', 'https://giftee.app'],
  config: {
    screens: {
      Landing: 'landing',
      SignIn: 'signin',
      SignUp: 'signup',
      OtpVerification: 'otp',

      BottomTabs: {
        path: 'home',
        screens: {
          Home: 'tab/home',
          Favorites: 'tab/favorites',
          Occasions: 'tab/occasions',
          Notifications: 'tab/notifications',
        },
      },
      Search: 'search',
      SendAGift: 'send-gift',
      SendToGroup: 'send-to-group',
      Profile: 'profile',
      Wallet: 'wallet',
      Orders: 'orders',
      Settings: 'settings',
      FAQ: 'faq',
      ContactUs: 'contact-us',
      StaticContent: {
        path: 'content/:code',
        parse: {
          code: (code: string) => code,
        },
      },
    },
  },
};
