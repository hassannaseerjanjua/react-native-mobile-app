# Firebase Cloud Messaging (FCM) + Notifee Implementation Guide

This guide documents how to implement push notifications in a React Native app using Firebase Cloud Messaging and Notifee for local notification display.

## Overview

This implementation handles:
- FCM token management
- Foreground notifications (app is open)
- Background notifications (app is minimized)
- Killed app notifications (app is completely closed)
- iOS and Android platforms

## Prerequisites

- React Native project set up
- Firebase project created
- iOS/Android apps registered in Firebase console

---

## Step 1: Install Dependencies

```bash
# Install Firebase packages
yarn add @react-native-firebase/app @react-native-firebase/messaging

# Install Notifee for local notification display
yarn add @notifee/react-native

# Install for iOS
cd ios && pod install && cd ..
```

---

## Step 2: Firebase Setup

### Android Setup

1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/google-services.json`
3. Add to `android/build.gradle`:

```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
  }
}
```

4. Add to `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'
```

5. Update `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <!-- Add these permissions -->
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
  <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
  <uses-permission android:name="android.permission.VIBRATE" />
  <uses-permission android:name="android.permission.WAKE_LOCK" />

  <application>
    <!-- Your app content -->
  </application>
</manifest>
```

### iOS Setup

1. Download `GoogleService-Info.plist` from Firebase Console
2. Add it to your Xcode project (drag into Xcode, ensure "Copy items if needed" is checked)
3. Update `ios/YourApp/AppDelegate.swift`:

```swift
import UIKit
import React
import UserNotifications

// Add Firebase import
import Firebase

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

  var window: UIWindow?

  func application(_ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

    // Initialize Firebase
    FirebaseApp.configure()

    // Set notification delegate
    UNUserNotificationCenter.current().delegate = self

    // Rest of your app setup...

    return true
  }

  // Handle notification when app is in foreground
  func userNotificationCenter(_ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    completionHandler([.badge, .sound, .banner, .list])
  }

  // Handle notification tap
  func userNotificationCenter(_ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void) {
    completionHandler()
  }
}
```

4. Run pod install:

```bash
cd ios && pod install && cd ..
```

---

## Step 3: Create Notification Service

Create `src/utils/notificationService.ts`:

```typescript
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = '@fcm_token';

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } else {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

// Get FCM token with caching
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // Check cached token
    const cachedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (cachedToken) {
      console.log('Using cached FCM token');
      return cachedToken;
    }

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
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      // Check if we're on simulator
      const apnsToken = await messaging().getAPNSToken();
      if (!apnsToken) {
        console.warn('⚠️ No APNS token available. FCM notifications will NOT work on iOS Simulator. Please test on a real iOS device.');
      }
    }

    // Get new token
    const token = await messaging().getToken();
    if (token) {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Get FCM token error:', error);
    return null;
  }
};

// Delete FCM token (use on logout)
export const deleteFCMToken = async (): Promise<void> => {
  try {
    await messaging().deleteToken();
    await AsyncStorage.removeItem(FCM_TOKEN_KEY);
    console.log('FCM token deleted');
  } catch (error) {
    console.error('Delete FCM token error:', error);
  }
};

// Display notification using Notifee (for foreground)
export const displayNotification = async (
  message: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
  try {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.displayNotification({
      title: message.notification?.title || 'New Notification',
      body: message.notification?.body || '',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
      data: message.data,
    });
  } catch (error) {
    console.error('Display notification error:', error);
  }
};

// Initialize notification listeners
export const initializeNotifications = async (
  onForegroundMessage: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  onNotificationTap: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  onTokenUpdate: (token: string) => void,
): Promise<{
  unsubscribe: () => void;
  initialNotification: FirebaseMessagingTypes.RemoteMessage | null;
}> => {
  // Request permissions
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('Notification permission denied');
    return { unsubscribe: () => {}, initialNotification: null };
  }

  // Get FCM token
  const token = await getFCMToken();
  if (token) {
    onTokenUpdate(token);
  }

  // Listen for token refresh
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(newToken => {
    console.log('FCM token refreshed:', newToken);
    AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
    onTokenUpdate(newToken);
  });

  // Listen for foreground messages
  const unsubscribeForeground = messaging().onMessage(onForegroundMessage);

  // Listen for notification taps (background/killed app)
  messaging().onNotificationOpenedApp(onNotificationTap);

  // Check for initial notification (app opened from killed state)
  const initialNotification = await messaging().getInitialNotification();

  // Combined unsubscribe function
  const unsubscribe = () => {
    unsubscribeTokenRefresh();
    unsubscribeForeground();
  };

  return { unsubscribe, initialNotification };
};
```

---

## Step 4: Create Notification Hook

Create `src/hooks/useNotification.tsx`:

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import {
  initializeNotifications,
  displayNotification,
  deleteFCMToken,
} from '../utils/notificationService';
import { useAuthStore } from '../store/reducer/auth'; // Adjust to your auth store

const useNotification = () => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Handle foreground notifications
  const handleForegroundNotification = useCallback(
    async (message: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground notification:', message.notification?.title);
      await displayNotification(message);
    },
    [],
  );

  // Handle notification taps
  const handleNotificationTap = useCallback(
    (message: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('='.repeat(60));
      console.log('NOTIFICATION CLICKED');
      console.log('='.repeat(60));
      console.log('Title:', message.notification?.title);
      console.log('Body:', message.notification?.body);
      console.log('Data:', JSON.stringify(message.data, null, 2));
      console.log('='.repeat(60));

      // Add your custom logic here
      // Example: Navigate to a specific screen, update app state, etc.
    },
    [],
  );

  // Handle FCM token updates
  const handleTokenUpdate = useCallback(async (token: string) => {
    console.log('FCM Token:', token);

    // TODO: Send token to your backend
    // Example:
    // await api.post('/users/fcm-token', { token });
  }, []);

  // Initialize notifications
  const initNotifications = useCallback(async () => {
    try {
      console.log('Initializing notifications...');

      const result = await initializeNotifications(
        handleForegroundNotification,
        handleNotificationTap,
        handleTokenUpdate,
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
  }, [handleForegroundNotification, handleNotificationTap, handleTokenUpdate]);

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
        console.log('='.repeat(60));

        // Add your custom logic here
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
```

---

## Step 5: Add Background Handler to index.js

**CRITICAL**: The background message handler MUST be registered at the top level in `index.js`, before the app is initialized.

Update `index.js`:

```javascript
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// ==========================================
// BACKGROUND MESSAGE HANDLER - MUST BE HERE
// ==========================================
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
      },
      ios: {
        sound: 'default',
      },
      data: remoteMessage.data,
    });
  } catch (error) {
    console.error('Background notification error:', error);
  }
});

// Handle background notification taps
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS && detail.notification) {
    console.log('Notification pressed in background:', detail.notification);

    // Add your custom logic here
  }
});

// Register the app
AppRegistry.registerComponent(appName, () => App);
```

---

## Step 6: Use Notification Hook in App

Update `App.tsx` to use the notification hook:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import RootNavigator from './src/navigators/stack.navigator';
import useNotification from './src/hooks/useNotification';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrapper />
      </PersistGate>
    </Provider>
  );
};

const AppWrapper = () => {
  // Initialize notifications
  useNotification();

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default App;
```

---

## Step 7: Testing

### Get FCM Token

Check your console logs when the app starts. You'll see:
```
FCM Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Test with curl

```bash
# Replace YOUR_SERVER_KEY with your Firebase Server Key
# Replace YOUR_FCM_TOKEN with the token from logs

curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "priority": "high",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test message"
    },
    "data": {
      "custom_key": "custom_value"
    }
  }'
```

### Test Scenarios

1. **Foreground (app is open)**
   - Send notification
   - Should see notification banner at top
   - Check console logs

2. **Background (app is minimized)**
   - Minimize the app
   - Send notification
   - Should see notification in system tray
   - Tap notification to open app

3. **Killed (app is completely closed)**
   - Force close the app
   - Send notification
   - Should see notification in system tray
   - Tap notification to open app

### Android Logs

```bash
# View all logs
adb logcat

# Filter notification logs
adb logcat | grep -i "notification"
```

---

## Common Issues & Solutions

### Issue 1: No notifications when app is killed (Android)

**Solution**:
- Ensure background handler is in `index.js` at top level
- Check Android permissions are added to `AndroidManifest.xml`
- Disable battery optimization for your app in device settings

### Issue 2: Notifications not showing in foreground

**Solution**:
- Make sure you're calling `displayNotification()` in the foreground handler
- Verify Notifee is properly installed

### Issue 3: iOS notifications not working

**Solution**:
- Verify `GoogleService-Info.plist` is added to Xcode project
- Check `AppDelegate.swift` has `UNUserNotificationCenterDelegate` and delegate is set
- Ensure notification capabilities are enabled in Xcode

### Issue 4: FCM token not generating

**Solution**:
- Verify Firebase configuration files are properly added
- Check `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) are in correct locations
- Rebuild the app after adding Firebase files

### Issue 5: iOS - "You must be registered for remote messages before calling getToken"

**Error**: `[messaging/unregistered] You must be registered for remote messages before calling getToken`

**Solution**:
On iOS, you must register the device for remote messages before getting the FCM token. The fix is already included in the `getFCMToken()` function above:

```typescript
// iOS requires device registration before getting token
if (Platform.OS === 'ios') {
  const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
  if (!isRegistered) {
    await messaging().registerDeviceForRemoteMessages();
  }
}
```

This error occurs if you try to call `messaging().getToken()` without first registering on iOS.

### Issue 6: iOS - "No APNS token specified before fetching FCM Token"

**Error**: `[messaging/unknown] The operation couldn't be completed. No APNS token specified before fetching FCM Token`

**Cause**:
- **iOS Simulator**: APNS (Apple Push Notification Service) tokens are NOT available on simulators
- **Real Device**: The APNS token registration is still in progress

**Solution**:
The fix is already included in the `getFCMToken()` function above - it waits up to 5 seconds for the APNS token.

**Important Notes**:
- ⚠️ Push notifications do NOT work on iOS Simulator - you MUST test on a real iOS device
- If you see the warning "No APNS token available", you're running on simulator
- For testing, always use a real iPhone/iPad device connected via USB or TestFlight

### Issue 7: iOS - Missing Push Notifications Capability

**Error**: `no valid "aps-environment" entitlement string found for application`

**Solution**:
1. Open your Xcode project: `open ios/YourApp.xcworkspace`
2. Select your project in the left sidebar
3. Select your target under TARGETS
4. Click "Signing & Capabilities" tab
5. Click "+ Capability" button
6. Add "Push Notifications"
7. Also add "Background Modes" and check:
   - ✅ Remote notifications
   - ✅ Background fetch (optional)
8. Clean and rebuild: `rm -rf ~/Library/Developer/Xcode/DerivedData && yarn ios`

---

## Additional Features

### Send Token to Backend

In `handleTokenUpdate` callback:

```typescript
const handleTokenUpdate = useCallback(async (token: string) => {
  try {
    await fetch('https://your-api.com/users/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourAuthToken}`,
      },
      body: JSON.stringify({ fcm_token: token }),
    });
  } catch (error) {
    console.error('Failed to send FCM token:', error);
  }
}, []);
```

### Custom Notification Sounds

1. Add sound files to:
   - Android: `android/app/src/main/res/raw/notification_sound.mp3`
   - iOS: Add to Xcode project

2. Update notification display:

```typescript
await notifee.displayNotification({
  title: 'Title',
  body: 'Body',
  android: {
    channelId,
    sound: 'notification_sound', // filename without extension
  },
  ios: {
    sound: 'notification_sound.mp3',
  },
});
```

---

## Summary

You now have a complete Firebase Cloud Messaging implementation that handles:

- ✅ FCM token management with caching
- ✅ Permission requests (Android 13+ and iOS)
- ✅ Foreground notifications using Notifee
- ✅ Background notifications
- ✅ Killed app notifications
- ✅ Notification tap handling
- ✅ Token refresh handling
- ✅ Cleanup on logout

This implementation works on both iOS and Android platforms and handles all notification states properly.
