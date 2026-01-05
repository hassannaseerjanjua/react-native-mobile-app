import { LinkingOptions, getStateFromPath } from '@react-navigation/native';
import { Linking } from 'react-native';
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
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    console.log('🔗 DEEP LINK - getInitialURL:', url);
    return url || undefined;
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }: { url: string }) => {
      console.log('🔗 DEEP LINK - URL received:', url);
      listener(url);
    };
    const subscription = Linking.addEventListener('url', onReceiveURL);
    return () => {
      subscription.remove();
    };
  },
  getStateFromPath(path, config) {
    console.log('🔗 DEEP LINK - getStateFromPath called');
    console.log('🔗 Path:', path);

    // Parse query parameters manually for select-store
    if (path.includes('select-store')) {
      console.log('🔗 Processing select-store path');

      // Parse query parameters manually
      const queryParams: Record<string, string> = {};
      const queryIndex = path.indexOf('?');
      if (queryIndex !== -1) {
        const queryString = path.substring(queryIndex + 1);
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        });
      }

      const friendUserId = queryParams['friendUserId'];
      const CityId = queryParams['CityId'];
      const sendType = queryParams['sendType'];

      console.log('🔗 Query params extracted:');
      console.log('  friendUserId:', friendUserId);
      console.log('  CityId:', CityId);
      console.log('  sendType:', sendType);

      // Get the default state from React Navigation (with full path including query)
      // React Navigation should automatically handle the path, but we'll parse query params manually
      const pathWithoutQuery = path.split('?')[0];
      const state = getStateFromPath(pathWithoutQuery, config);

      console.log(
        '🔗 State from React Navigation:',
        JSON.stringify(state, null, 2),
      );

      // Helper function to recursively find and update SelectStore route
      const updateRouteParams = (
        routes: any[],
        currentIndex?: number,
      ): { routes: any[]; index: number } => {
        let foundIndex =
          currentIndex !== undefined ? currentIndex : routes.length - 1;

        const updatedRoutes = routes.map((route: any, idx: number) => {
          if (route.name === 'SelectStore') {
            foundIndex = idx;
            const params: any = {
              ...(route.params || {}),
            };

            if (friendUserId) {
              params.friendUserId = Number(friendUserId);
            }
            if (CityId) {
              params.CityId = Number(CityId);
            }
            if (sendType) {
              params.sendType = Number(sendType);
            } else {
              params.sendType = 1;
            }

            console.log(
              '🔗 Modified route params:',
              JSON.stringify(params, null, 2),
            );

            return {
              ...route,
              params,
            };
          }

          // If route has nested routes (like AppStack), recurse
          if (route.state && route.state.routes) {
            const nestedResult = updateRouteParams(
              route.state.routes,
              route.state.index,
            );
            return {
              ...route,
              state: {
                ...route.state,
                index: nestedResult.index,
                routes: nestedResult.routes,
              },
            };
          }

          return route;
        });

        return { routes: updatedRoutes, index: foundIndex };
      };

      // Modify the state to include query parameters
      if (state && state.routes && state.routes.length > 0) {
        const result = updateRouteParams(state.routes, state.index);

        // Check if state is missing RootStack -> App structure
        const hasAppRoute = result.routes.some((r: any) => r.name === 'App');
        const selectStoreRoute = result.routes.find(
          (r: any) => r.name === 'SelectStore',
        );

        let finalState;

        if (!hasAppRoute && selectStoreRoute) {
          // State is missing RootStack -> App -> AppStack structure
          // Manually construct the full navigation hierarchy
          // Include BottomTabs before SelectStore so user can navigate back
          console.log(
            '🔗 Constructing full navigation state with RootStack -> App -> AppStack',
          );

          finalState = {
            index: 0,
            routes: [
              {
                name: 'App',
                state: {
                  index: 1, // Index 1 points to SelectStore (index 0 is BottomTabs)
                  routes: [
                    {
                      name: 'BottomTabs',
                    },
                    {
                      name: 'SelectStore',
                      params: selectStoreRoute.params || {},
                    },
                  ],
                },
              },
            ],
          };
        } else {
          finalState = {
            ...state,
            index: result.index,
            routes: result.routes,
          };
        }

        console.log(
          '🔗 Final navigation state:',
          JSON.stringify(finalState, null, 2),
        );
        console.log('🔗 State index:', finalState.index);
        console.log('🔗 Number of routes:', finalState.routes.length);
        console.log(
          '🔗 Route names:',
          finalState.routes.map((r: any) => r.name),
        );

        return finalState;
      }

      console.log('🔗 Warning: No state or routes found');
      return state;
    }

    // For other paths, use default behavior
    return getStateFromPath(path, config);
  },
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
