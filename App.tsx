import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import RootNavigator from './src/navigators/stack.navigator';
import BootSplash from 'react-native-bootsplash';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils/toastConfig';

// Navigation ref for programmatic navigation
export const navigationRef =
  React.createRef<NavigationContainerRef<any>>();

const App = () => {
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isRootLayoutReady, setIsRootLayoutReady] = useState(false);

  useEffect(() => {
    if (isNavigationReady && isRootLayoutReady) {
      requestAnimationFrame(() => {
        setTimeout(() => BootSplash.hide({ fade: true }), 80);
      });
    }
  }, [isNavigationReady, isRootLayoutReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate
          loading={<View style={{ flex: 1, backgroundColor: '#fff' }} />}
          persistor={persistor}
        >
          <NavigationContainer
            ref={navigationRef}
            onReady={() => setIsNavigationReady(true)}
            fallback={null}
          >
            <View
              style={{ flex: 1 }}
              onLayout={() => setIsRootLayoutReady(true)}
            >
              <RootNavigator />
            </View>
          </NavigationContainer>
          <Toast config={toastConfig} />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
