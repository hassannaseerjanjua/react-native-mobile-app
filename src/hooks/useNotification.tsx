import { useEffect, useRef, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import {
  initializeNotifications,
  displayNotification,
  deleteFCMToken,
  callLogoutWithDeviceToken,
  subscribeToTopic,
  unsubscribeFromTopic,
} from '../utils/notificationService';
import { useAuthStore } from '../store/reducer/auth';
import { useLocaleStore } from '../store/reducer/locale';
import api from '../utils/api';
import apiEndpoints from '../constants/api-endpoints';
import { getTopicsForLanguage } from '../utils/firebaseTopics';

const FCM_TOKEN_SENT_KEY = 'fcm_token_sent_to_backend';
const USER_DEVICE_TOKEN_ID_KEY = 'user_device_token_id'; // must match notificationService

/**
 * Notification Hook - Logs notification clicks
 */

const useNotification = () => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const subscribedTopicsRef = useRef<string[]>([]);
  const previousLangCodeRef = useRef<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const { langCode, langId } = useLocaleStore();

  // Handle foreground notifications
  const handleForegroundNotification = useCallback(
    async (message: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground notification:', message.notification?.title);
      await displayNotification(message);
    },
    [],
  );

  // Handle notification taps - logs and opens action_url
  const handleNotificationTap = useCallback(
    (message: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('='.repeat(60));
      console.log('NOTIFICATION CLICKED');
      console.log('='.repeat(60));
      console.log('Title:', message.notification?.title);
      console.log('Body:', message.notification?.body);
      console.log('Data:', JSON.stringify(message.data, null, 2));
      console.log('Message ID:', message.messageId);
      console.log('Sent Time:', message.sentTime);

      // Handle action_url deep linking
      if (message.data?.action_url) {
        const url = String(message.data.action_url);
        console.log('Opening action_url:', url);

        Linking.canOpenURL(url)
          .then(supported => {
            if (supported) {
              Linking.openURL(url);
              console.log('✅ Opened:', url);
            } else {
              console.log('❌ Cannot open URL:', url);
            }
          })
          .catch(err => console.error('Deep link error:', err));
      } else {
        console.log('No action_url found');
      }

      console.log('='.repeat(60));
    },
    [],
  );

  // Handle FCM token updates - only call API when token doesn't exist or is different from last sent
  const handleTokenUpdate = useCallback(
    async (token: string) => {
      console.log('FCM Token:', token);
      if (!user?.UserId) return;

      try {
        const lastSentToken = await AsyncStorage.getItem(FCM_TOKEN_SENT_KEY);
        //       if (lastSentToken === token) {
        // return; // Already sent this token, skip
        const storedDeviceId = await AsyncStorage.getItem(USER_DEVICE_TOKEN_ID_KEY);

        if (lastSentToken === token && storedDeviceId) {
          return; // Already sent this token and have the ID, skip
        }

        const res = await api.post<{
          // data?: { Data?: { UserDeviceTokenId?: number } };

          Data?: { UserDeviceTokenId?: number };
        }>(apiEndpoints.SAVE_TOKEN, {
          UserId: user.UserId,
          Token: token,
          LanguageId: langId, // 1 = English, 2 = Arabic
          DeviceType: Platform.OS === 'android' ? 2 : 1, // 1 = Android, 2 = iOS
        });
        await AsyncStorage.setItem(FCM_TOKEN_SENT_KEY, token);
        // const userDeviceTokenId = res?.data?.data?.Data?.UserDeviceTokenId;
        const userDeviceTokenId = res?.data?.Data?.UserDeviceTokenId;
        if (userDeviceTokenId != null) {
          await AsyncStorage.setItem(
            USER_DEVICE_TOKEN_ID_KEY,
            String(userDeviceTokenId),
          );
        }
        console.log('FCM Token saved to backend');
      } catch (error) {
        console.error('Failed to save token to backend:', error);
      }
    },
    [user?.UserId, langId],
  );

  // Subscribe to Firebase topics based on language and city
  const subscribeToFirebaseTopics = useCallback(
    async (currentLangCode: 'en' | 'ar', cityId: number | null) => {
      try {
        const topics = getTopicsForLanguage(cityId, currentLangCode);
        console.log('Subscribing to Firebase topics:', topics);

        // Subscribe to all topics
        for (const topic of topics) {
          await subscribeToTopic(topic);
          console.log(`✅ Subscribed to topic: ${topic}`);
        }

        subscribedTopicsRef.current = topics;
      } catch (error) {
        console.error('Firebase topics subscription error:', error);
      }
    },
    [],
  );

  // Unsubscribe from Firebase topics
  const unsubscribeFromFirebaseTopics = useCallback(
    async (topics: string[]) => {
      try {
        console.log('Unsubscribing from Firebase topics:', topics);

        for (const topic of topics) {
          await unsubscribeFromTopic(topic);
          console.log(`✅ Unsubscribed from topic: ${topic}`);
        }
      } catch (error) {
        console.error('Firebase topics unsubscription error:', error);
      }
    },
    [],
  );

  // Initialize notifications
  const initNotifications = useCallback(async () => {
    try {
      console.log('Initializing notifications...');

      const result = await initializeNotifications(
        handleForegroundNotification,
        handleNotificationTap,
        handleTokenUpdate,
        user?.UserId,
      );

      unsubscribeRef.current = result.unsubscribe;

      // Subscribe to Firebase topics based on current language and city
      const currentLangCode = (langCode as 'en' | 'ar') || 'en';
      const cityId = user?.CityId || null;
      await subscribeToFirebaseTopics(currentLangCode, cityId);

      // Handle initial notification (app opened from killed state)
      if (result.initialNotification) {
        setTimeout(() => {
          handleNotificationTap(result.initialNotification!);
        }, 500);
      }

      console.log('Notifications initialized');
    } catch (error) {
      console.error('Notification init error:', error);
    }
  }, [
    handleForegroundNotification,
    handleNotificationTap,
    handleTokenUpdate,
    user?.UserId,
    user?.CityId,
    langCode,
    subscribeToFirebaseTopics,
  ]);

  // Cleanup notifications
  const cleanup = useCallback(async () => {
    try {
      await deleteFCMToken();
      await AsyncStorage.removeItem(FCM_TOKEN_SENT_KEY);
      await AsyncStorage.removeItem(USER_DEVICE_TOKEN_ID_KEY);
      console.log('Notifications cleaned up');
    } catch (error) {
      console.error('Notification cleanup error:', error);
    }
  }, []);

  // Setup Notifee event handler for notification presses
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification) {
        console.log('='.repeat(60));
        console.log('NOTIFEE NOTIFICATION CLICKED');
        console.log('='.repeat(60));
        console.log('Title:', detail.notification.title);
        console.log('Body:', detail.notification.body);
        console.log('Data:', JSON.stringify(detail.notification.data, null, 2));

        // Handle action_url from Notifee notification
        const data = detail.notification.data as Record<string, any>;
        if (data?.action_url) {
          const url = String(data.action_url);
          console.log('Opening action_url:', url);

          Linking.canOpenURL(url)
            .then(supported => {
              if (supported) {
                Linking.openURL(url);
                console.log('✅ Opened:', url);
              } else {
                console.log('❌ Cannot open URL:', url);
              }
            })
            .catch(err => console.error('Deep link error:', err));
        }

        console.log('='.repeat(60));
      }
    });

    return unsubscribe;
  }, []);

  // Handle language changes - unsubscribe from old topics and subscribe to new ones
  useEffect(() => {
    if (!isAuthenticated || !user?.CityId) return;

    const currentLangCode = (langCode as 'en' | 'ar') || 'en';
    const previousLangCode = previousLangCodeRef.current;

    // Only handle language change if language actually changed (skip initial mount)
    if (previousLangCode && previousLangCode !== currentLangCode) {
      const previousTopics = subscribedTopicsRef.current;

      if (previousTopics.length > 0) {
        console.log(
          `Language changed from ${previousLangCode} to ${currentLangCode}. Updating topics...`,
        );
        // Unsubscribe from previous topics
        unsubscribeFromFirebaseTopics(previousTopics).then(() => {
          // Subscribe to new topics
          subscribeToFirebaseTopics(currentLangCode, user.CityId);
        });
      }
    }

    // Update the previous language code ref
    previousLangCodeRef.current = currentLangCode;
  }, [
    langCode,
    user?.CityId,
    isAuthenticated,
    subscribeToFirebaseTopics,
    unsubscribeFromFirebaseTopics,
  ]);

  // Initialize on mount
  useEffect(() => {
    initNotifications();

    return () => {
      unsubscribeRef.current?.();
    };
  }, [initNotifications]);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated) {
      // Unsubscribe from all topics before cleanup
      if (subscribedTopicsRef.current.length > 0) {
        unsubscribeFromFirebaseTopics(subscribedTopicsRef.current).then(() => {
          subscribedTopicsRef.current = [];
        });
      }
      cleanup();
    }
  }, [isAuthenticated, cleanup, unsubscribeFromFirebaseTopics]);
};

export default useNotification;
