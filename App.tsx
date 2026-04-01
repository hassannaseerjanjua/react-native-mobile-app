import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import RootNavigator from './src/navigators/stack.navigator';
import BootSplash from 'react-native-bootsplash';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useFetchLocale from './src/hooks/useFetchLocale';
import { View, Text as RNText, TextInput } from 'react-native';
import { Text } from './src/utils/elements';
import { useLocaleStore } from './src/store/reducer/locale';
import { I18nManager } from 'react-native';
import { linking } from './src/navigators/deep-linking';
import Toast from 'react-native-toast-message';
import useNotification from './src/hooks/useNotification';
import useDeepLinkHandler from './src/hooks/useDeepLinkHandler';
import { useRefreshTokenOnInit } from './src/hooks/useRefreshTokenOnInit';
import { getContacts } from './src/utils/contacts';
import { AppStackParamList } from './src/types/navigation.types';
import { toastConfig } from './src/utils/toastConfig';

// Navigation ref for programmatic navigation
export const navigationRef =
  React.createRef<NavigationContainerRef<AppStackParamList>>();

const App = () => {
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isRootLayoutReady, setIsRootLayoutReady] = useState(false);

  useEffect(() => {
    if (isLocaleReady && isNavigationReady && isRootLayoutReady) {
      // Delay one frame so first screen is rendered before fading splash
      requestAnimationFrame(() => {
        setTimeout(() => BootSplash.hide({ fade: true }), 80);
      });
    }
  }, [isLocaleReady, isNavigationReady, isRootLayoutReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <DataWrapper onLocaleReady={() => setIsLocaleReady(true)}>
            <NavigationContainer
              ref={navigationRef}
              linking={linking}
              onReady={() => setIsNavigationReady(true)}
              fallback={<Text>Loading... Please wait...</Text>}
            >
              <View
                style={{ flex: 1 }}
                onLayout={() => setIsRootLayoutReady(true)}
              >
                <RootNavigator />
              </View>
            </NavigationContainer>
            <Toast config={toastConfig} />
          </DataWrapper>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

interface DataWrapperProps {
  children: React.ReactNode;
  onLocaleReady: () => void;
}

const DataWrapper = ({
  children,
  onLocaleReady,
}: {
  children: React.ReactNode;
  onLocaleReady: () => void;
}) => {
  const { isTokenRefreshReady } = useRefreshTokenOnInit();

  // Block all content until token refresh completes (when authenticated).
  // This ensures locale fetch and all other API calls use the fresh JWT.
  if (!isTokenRefreshReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading... Please wait...</Text>
      </View>
    );
  }

  return (
    <DataWrapperContent onLocaleReady={onLocaleReady}>
      {children}
    </DataWrapperContent>
  );
};

const DataWrapperContent = ({
  children,
  onLocaleReady,
}: {
  children: React.ReactNode;
  onLocaleReady: () => void;
}) => {
  const { loading, error, doKeysExist } = useFetchLocale();
  const { strings, isRtl } = useLocaleStore();
  const [didSignalLocaleReady, setDidSignalLocaleReady] = useState(false);

  useNotification();
  useDeepLinkHandler();

  if (isRtl !== I18nManager.isRTL) {
    I18nManager.forceRTL(isRtl);
  }

  useEffect(() => {
    if (didSignalLocaleReady) return;
    if (loading) return;
    if (Object.keys(strings || {}).length > 0) {
      setDidSignalLocaleReady(true);
      onLocaleReady();
    }
  }, [didSignalLocaleReady, loading, strings, onLocaleReady]);

  if (!!error && !doKeysExist) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{`${error || 'Something went wrong'}! Reload the app.`}</Text>
      </View>
    );
  }

  return <>{children}</>;
};
