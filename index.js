/**
 * @format
 * IMPORTANT: Background handlers MUST be registered at top level before app initialization
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Firebase background message handler - MUST be at top level
// This handles notifications when app is killed/quit
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);

  try {
    // Create notification channel
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    // Display notification
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'New Notification',
      body: remoteMessage.notification?.body || '',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher',
        sound: 'default',
      },
      data: remoteMessage.data,
    });

    console.log('Background notification displayed');
  } catch (error) {
    console.error('Background notification error:', error);
  }
});

// Notifee background event handler - handles notification presses when app is killed
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Notifee background event:', type);

  if (type === EventType.PRESS && detail.notification) {
    console.log('Notification pressed in background:', detail.notification);

    // Store notification data for navigation after app opens
    if (detail.notification.data) {
      // The app will handle navigation in useNotification hook via getInitialNotification
      console.log('Notification data:', detail.notification.data);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
