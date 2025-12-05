import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

/**
 * Firebase Cloud Messaging Notification Service
 * Handles FCM token retrieval, permissions, and notification listeners
 */

// Request notification permissions (required for iOS and Android 13+)
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // Android 13+ requires POST_NOTIFICATIONS permission
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Android notification permission granted');
          return true;
        } else {
          console.log('❌ Android notification permission denied');
          return false;
        }
      }
      return true; // Android < 13 doesn't need explicit permission
    }

    // iOS permission request
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ iOS notification permission granted:', authStatus);
    } else {
      console.log('❌ iOS notification permission denied');
    }

    return enabled;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

// Get and log FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // Request permission first (this also checks current status)
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('❌ Cannot get FCM token without permission');
      return null;
    }

    // Get the FCM token
    const fcmToken = await messaging().getToken();

    if (fcmToken) {
      console.log('🔑 FCM Token:', fcmToken);
      // TODO: Send this token to your backend server
      return fcmToken;
    } else {
      console.log('❌ Failed to get FCM token');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

// Delete FCM token (useful for logout)
export const deleteFCMToken = async (): Promise<void> => {
  try {
    await messaging().deleteToken();
    console.log('🗑️ FCM token deleted');
  } catch (error) {
    console.error('❌ Error deleting FCM token:', error);
  }
};

// Handle token refresh
export const onTokenRefresh = (
  callback: (token: string) => void,
): (() => void) => {
  return messaging().onTokenRefresh(token => {
    console.log('🔄 FCM Token refreshed:', token);
    callback(token);
  });
};

// Handle foreground notifications
export const onForegroundNotification = (
  callback: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void,
): (() => void) => {
  return messaging().onMessage(async remoteMessage => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📬 onMessage() - FOREGROUND NOTIFICATION');
    console.log('═══════════════════════════════════════════════════════');
    console.log(
      '📋 Full Message Object:',
      JSON.stringify(remoteMessage, null, 2),
    );
    console.log('📌 Notification Title:', remoteMessage.notification?.title);
    console.log('📌 Notification Body:', remoteMessage.notification?.body);
    console.log(
      '📌 Notification Data:',
      JSON.stringify(remoteMessage.data, null, 2),
    );
    console.log('📌 Message ID:', remoteMessage.messageId);
    console.log('📌 Sent Time:', remoteMessage.sentTime);
    console.log('📌 From:', remoteMessage.from);
    console.log('📌 TTL:', remoteMessage.ttl);
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔄 Calling callback function...');
    callback(remoteMessage);
    console.log('✅ Callback executed');
    console.log('═══════════════════════════════════════════════════════');
  });
};

// Handle notification opened (when user taps on notification)
export const onNotificationOpenedApp = (
  callback: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void,
): (() => void) => {
  return messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('👆 onNotificationOpenedApp() - NOTIFICATION TAP');
    console.log('═══════════════════════════════════════════════════════');
    console.log(
      '📋 Full Message Object:',
      JSON.stringify(remoteMessage, null, 2),
    );
    console.log('📌 Notification Title:', remoteMessage.notification?.title);
    console.log('📌 Notification Body:', remoteMessage.notification?.body);
    console.log(
      '📌 Notification Data:',
      JSON.stringify(remoteMessage.data, null, 2),
    );
    console.log('📌 Message ID:', remoteMessage.messageId);
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔄 Calling callback function...');
    callback(remoteMessage);
    console.log('✅ Callback executed');
    console.log('═══════════════════════════════════════════════════════');
  });
};

// Check if app was opened from a notification (when app was quit)
export const getInitialNotification =
  async (): Promise<FirebaseMessagingTypes.RemoteMessage | null> => {
    console.log('🔍 Checking for initial notification...');
    const remoteMessage = await messaging().getInitialNotification();

    if (remoteMessage) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚀 getInitialNotification() - APP OPENED FROM QUIT STATE');
      console.log('═══════════════════════════════════════════════════════');
      console.log(
        '📋 Full Message Object:',
        JSON.stringify(remoteMessage, null, 2),
      );
      console.log('📌 Notification Title:', remoteMessage.notification?.title);
      console.log('📌 Notification Body:', remoteMessage.notification?.body);
      console.log(
        '📌 Notification Data:',
        JSON.stringify(remoteMessage.data, null, 2),
      );
      console.log('📌 Message ID:', remoteMessage.messageId);
      console.log('═══════════════════════════════════════════════════════');
    } else {
      console.log('ℹ️ No initial notification found');
    }

    return remoteMessage;
  };

// Subscribe to a topic
export const subscribeToTopic = async (topic: string): Promise<void> => {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`📌 Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`❌ Error subscribing to topic ${topic}:`, error);
  }
};

// Unsubscribe from a topic
export const unsubscribeFromTopic = async (topic: string): Promise<void> => {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`📌 Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`❌ Error unsubscribing from topic ${topic}:`, error);
  }
};

// Initialize all notification handlers
export const initializeNotifications = async (
  onForegroundMessage?: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  onNotificationTap?: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): Promise<{
  token: string | null;
  initialNotification: FirebaseMessagingTypes.RemoteMessage | null;
  unsubscribe: () => void;
}> => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔔 INITIALIZING FIREBASE MESSAGING');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 Callbacks provided:');
  console.log(
    '  - onForegroundMessage:',
    typeof onForegroundMessage === 'function' ? '✅ Provided' : '❌ Missing',
  );
  console.log(
    '  - onNotificationTap:',
    typeof onNotificationTap === 'function' ? '✅ Provided' : '❌ Missing',
  );
  console.log('═══════════════════════════════════════════════════════');

  // Request permission and get token
  console.log(
    '🔐 Requesting notification permissions and getting FCM token...',
  );
  const token = await getFCMToken();
  console.log('🔑 FCM Token result:', token ? '✅ Received' : '❌ Failed');

  // Check for initial notification (app opened from quit state)
  const initialNotification = await getInitialNotification();
  if (initialNotification && onNotificationTap) {
    onNotificationTap(initialNotification);
  }

  // Set up listeners
  console.log('📡 Setting up notification listeners...');

  const unsubscribeTokenRefresh = onTokenRefresh(newToken => {
    console.log('🔄 FCM Token refreshed:', newToken);
    // TODO: Send new token to your backend
    console.log('Token refreshed, update backend with:', newToken);
  });
  console.log('✅ Token refresh listener registered');

  const unsubscribeForeground = onForegroundNotification(message => {
    console.log('📬 Foreground notification listener triggered');
    if (onForegroundMessage) {
      console.log('🔄 Calling onForegroundMessage callback...');
      onForegroundMessage(message);
    } else {
      console.log('⚠️ onForegroundMessage callback not provided!');
    }
  });
  console.log('✅ Foreground notification listener registered');

  const unsubscribeNotificationOpened = onNotificationOpenedApp(message => {
    console.log('👆 Notification opened listener triggered');
    if (onNotificationTap) {
      console.log('🔄 Calling onNotificationTap callback...');
      onNotificationTap(message);
    } else {
      console.log('⚠️ onNotificationTap callback not provided!');
    }
  });
  console.log('✅ Notification opened listener registered');

  // Return cleanup function
  const unsubscribe = () => {
    console.log('🧹 Cleaning up notification listeners...');
    unsubscribeTokenRefresh();
    unsubscribeForeground();
    unsubscribeNotificationOpened();
    console.log('✅ Notification listeners cleaned up');
  };

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ Firebase Messaging initialization complete');
  console.log('═══════════════════════════════════════════════════════');

  return {
    token,
    initialNotification,
    unsubscribe,
  };
};

export default {
  requestNotificationPermission,
  getFCMToken,
  deleteFCMToken,
  onTokenRefresh,
  onForegroundNotification,
  onNotificationOpenedApp,
  getInitialNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  initializeNotifications,
};
