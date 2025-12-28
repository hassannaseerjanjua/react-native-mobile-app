import { useEffect, useRef, useCallback } from 'react';
import { Linking } from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import {
  initializeNotifications,
  displayNotification,
  deleteFCMToken,
} from '../utils/notificationService';
import { useAuthStore } from '../store/reducer/auth';
import api from '../utils/api';
import apiEndpoints from '../constants/api-endpoints';

/**
 * Notification Hook - Logs notification clicks
 */

const useNotification = () => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { isAuthenticated, user } = useAuthStore();

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

  // Handle FCM token updates
  const handleTokenUpdate = useCallback(
    async (token: string) => {
      console.log('FCM Token:', token);
      // Send token to backend when authenticated
      if (user?.UserId) {
        try {
          await api.post(apiEndpoints.SAVE_TOKEN, {
            UserId: user.UserId,
            token,
          });
          console.log('FCM Token saved to backend');
        } catch (error) {
          console.error('Failed to save token to backend:', error);
        }
      }
    },
    [user?.UserId],
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
  ]);

  // Cleanup notifications
  const cleanup = useCallback(async () => {
    try {
      await deleteFCMToken();
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
      cleanup();
    }
  }, [isAuthenticated, cleanup]);
};

export default useNotification;
