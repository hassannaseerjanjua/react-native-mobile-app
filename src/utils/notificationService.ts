import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiEndpoints from '../constants/api-endpoints';
import api from './api';
import { store } from '../store/store';

const USER_DEVICE_TOKEN_ID_KEY = 'user_device_token_id';

/**
 * NOTE: Background handler is now in index.js
 * It MUST be at top level for killed app notifications
 */

export const displayNotification = async (
  message: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
  try {
    const localeStrings = store.getState().locale.localeData.strings;
    const getString = (key: string) =>
      localeStrings?.[key as keyof typeof localeStrings] || key;

    const channelId = await notifee.createChannel({
      id: 'default',
      name: getString('NOTIFICATION_DEFAULT_CHANNEL'),
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.displayNotification({
      title:
        message.notification?.title ||
        getString('NOTIFICATION_NEW_NOTIFICATION'),
      body: message.notification?.body || '',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher',
        sound: 'default',
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
      data: message.data,
    });
  } catch (error) {
    console.error('Display notification error:', error);
  }
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted;
      }
      return true;
    }

    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Check permission error:', error);
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const hasPermission = await checkNotificationPermission();
    if (hasPermission) return true;

    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    const authStatus = await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
    });
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

export const getFCMToken = async (userId?: number): Promise<string | null> => {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    // const savedToken = await getSavedFCMToken();
    // if (savedToken) return savedToken;

    // iOS requires device registration before getting token
    if (Platform.OS === 'ios') {
      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
      if (!isRegistered) {
        await messaging().registerDeviceForRemoteMessages();
      }

      // Wait for APNS token (required on real iOS devices)
      // Note: APNS tokens are not available on iOS Simulator
      const maxRetries = 10;
      let retries = 0;

      while (retries < maxRetries) {
        const apnsToken = await messaging().getAPNSToken();
        if (apnsToken) {
          console.log('APNS token received');
          break;
        }

        // Wait 500ms before checking again
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
        retries++;
      }

      // Check if we're on simulator
      const apnsToken = await messaging().getAPNSToken();
      if (!apnsToken) {
        console.warn(
          '⚠️ No APNS token available. FCM notifications will NOT work on iOS Simulator. Please test on a real iOS device.',
        );
      }
    }

    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await saveFCMToken(fcmToken);
      // Backend save is handled only in useNotification.handleTokenUpdate to avoid duplicate calls
      console.log('FCM Token received:', fcmToken);
    }
    return fcmToken || null;
  } catch (error) {
    console.error('FCM token error:', error);
    return null;
  }
};

export const deleteFCMToken = async (): Promise<void> => {
  try {
    await messaging().deleteToken();
    await AsyncStorage.removeItem('fcm_token');
  } catch (error) {
    console.error('FCM token deletion error:', error);
  }
};

export const onTokenRefresh = (
  callback: (token: string) => void,
): (() => void) => {
  return messaging().onTokenRefresh(callback);
};

export const onForegroundNotification = (
  callback: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void,
): (() => void) => {
  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage.notification?.title);
    callback(remoteMessage);
  });
};

export const onNotificationOpenedApp = (
  callback: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void,
): (() => void) => {
  return messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened:', remoteMessage.notification?.title);
    callback(remoteMessage);
  });
};

export const getInitialNotification =
  async (): Promise<FirebaseMessagingTypes.RemoteMessage | null> => {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log('Initial notification:', remoteMessage.notification?.title);
    }
    return remoteMessage;
  };

export const subscribeToTopic = async (topic: string): Promise<void> => {
  try {
    await messaging().subscribeToTopic(topic);
  } catch (error) {
    console.error(`Topic subscription error (${topic}):`, error);
  }
};

export const unsubscribeFromTopic = async (topic: string): Promise<void> => {
  try {
    await messaging().unsubscribeFromTopic(topic);
  } catch (error) {
    console.error(`Topic unsubscribe error (${topic}):`, error);
  }
};

export const initializeNotifications = async (
  onForegroundMessage?: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  onNotificationTap?: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  onTokenUpdate?: (token: string) => void,
  userId?: number,
): Promise<{
  token: string | null;
  initialNotification: FirebaseMessagingTypes.RemoteMessage | null;
  unsubscribe: () => void;
}> => {
  // Get FCM token
  const token = await getFCMToken(userId);
  if (token && onTokenUpdate) {
    onTokenUpdate(token);
  }

  // Check for initial notification (app opened from quit state)
  const initialNotification = await getInitialNotification();
  if (initialNotification && onNotificationTap) {
    onNotificationTap(initialNotification);
  }

  // Setup token refresh listener
  const unsubscribeTokenRefresh = onTokenRefresh(newToken => {
    console.log('FCM Token refreshed:', newToken);
    onTokenUpdate?.(newToken);
  });

  // Setup foreground notification listener
  const unsubscribeForeground = onForegroundNotification(message => {
    onForegroundMessage?.(message);
  });

  // Setup notification opened listener (background/quit state)
  const unsubscribeNotificationOpened = onNotificationOpenedApp(message => {
    onNotificationTap?.(message);
  });

  // Cleanup function
  const unsubscribe = () => {
    unsubscribeTokenRefresh();
    unsubscribeForeground();
    unsubscribeNotificationOpened();
  };

  return {
    token,
    initialNotification,
    unsubscribe,
  };
};

const saveFCMToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('fcm_token', token);
  } catch (error) {
    console.error('FCM token save error:', error);
  }
};

const getSavedFCMToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('fcm_token');
    return token || null;
  } catch (error) {
    console.error('FCM token get error:', error);
    return null;
  }
};


/**
 * Calls the logout API. Sends UserDeviceTokenId in body when available (from save-token response).
 * Call this before dispatching logout() so the request is sent with auth headers.
 */
export const callLogoutWithDeviceToken = async (): Promise<void> => {
  let stored: string | null = null;
  try {
    // stored = await AsyncStorage.getItem(USER_DEVICE_TOKEN_ID_KEY);
    // const userDeviceTokenId =
    //   stored && Number.isFinite(Number(stored)) ? Number(stored) : undefined;  
    // const fcmToken = await AsyncStorage.getItem('fcm_token');

    //  await api.post(apiEndpoints.LOGOUT, { UserDeviceTokenId: userDeviceTokenId });
    // console.log('Logout with device token success', userDeviceTokenId);
    // if (stored) await AsyncStorage.removeItem(USER_DEVICE_TOKEN_ID_KEY);
    stored = await AsyncStorage.getItem(USER_DEVICE_TOKEN_ID_KEY);
    const userDeviceTokenId =
      stored && Number.isFinite(Number(stored)) ? Number(stored) : undefined;

    await api.post(apiEndpoints.LOGOUT, {
      //  UserDeviceTokenId: fcmToken || undefined,
      UserDeviceTokenId: userDeviceTokenId,
    });
    //  console.log('Logout with device token success', fcmToken);
    // await AsyncStorage.removeItem(USER_DEVICE_TOKEN_ID_KEY);
    console.log('Logout with device token success', userDeviceTokenId);
    if (stored) await AsyncStorage.removeItem(USER_DEVICE_TOKEN_ID_KEY);
  } catch (error) {
    console.error('Logout with device token error:', error);
    // if (stored) await AsyncStorage.removeItem(USER_DEVICE_TOKEN_ID_KEY);
    // await AsyncStorage.removeItem(USER_DEVICE_TOKEN_ID_KEY);
    if (stored) await AsyncStorage.removeItem(USER_DEVICE_TOKEN_ID_KEY);
  }
};

export default {
  checkNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  deleteFCMToken,
  callLogoutWithDeviceToken,
  onTokenRefresh,
  onForegroundNotification,
  onNotificationOpenedApp,
  getInitialNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  initializeNotifications,
  displayNotification,
  saveFCMToken,
  getSavedFCMToken,
};
