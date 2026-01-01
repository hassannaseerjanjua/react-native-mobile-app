import { LinkingOptions } from '@react-navigation/native';
import {
  AppStackParamList,
  AuthStackParamList,
} from '../types/navigation.types';

export const linking: LinkingOptions<AppStackParamList | AuthStackParamList> = {
  prefixes: [
    'giftee://',
    'https://giftee.app',
    'https://admin.giftee.hostinger.bitscollision.net',
  ],
  config: {
    screens: {
      // Auth screens
      Landing: 'landing',
      SignIn: 'signin',
      SignUp: 'signup',
      OtpVerification: 'otp',

      // Bottom tabs (accessible via home path)
      BottomTabs: {
        path: 'home',
        screens: {
          Home: '', // giftee://home goes directly to Home tab
          Favorites: 'favorites',
          Occasions: 'occasions',
          Notifications: 'notifications',
        },
      },

      // Main app screens
      Search: 'search',
      SendAGift: 'send-gift',
      SendToGroup: 'send-to-group',
      Profile: 'profile',
      Wallet: 'wallet',
      Orders: 'orders',
      Settings: 'settings',
      FAQ: 'faq',
      ContactUs: 'contact-us',

      // Product and gift flow screens
      ProductDetails: 'product/:productId',
      GiftMessage: 'gift-message',
      CheckOut: 'checkout',
      AddCard: 'add-card',
      InboxOutbox: 'inbox-outbox',

      // Location and store screens
      LocationSelection: 'location',
      SelectStore: 'select-store',
      StoreProducts: 'store-products/:storeId',

      // QR and catch screens
      ScanQr: 'scan-qr',
      CatchScreen: 'catch/:giftId',

      // Gift promotions
      GiftOneGetOne: 'gift-one-get-one',

      // Static content with parameter
      StaticContent: {
        path: 'content/:code',
        parse: {
          code: (code: string) => code,
        },
      },
    },
  },
};
