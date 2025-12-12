import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import RootNavigator from './src/navigators/stack.navigator';
import BootSplash from 'react-native-bootsplash';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useFetchLocale from './src/hooks/useFetchLocale';
import { View } from 'react-native';
import { Text } from './src/utils/elements';
import { useLocaleStore } from './src/store/reducer/locale';
import { I18nManager } from 'react-native';
import { linking } from './src/navigators/deep-linking';
import Toast from 'react-native-toast-message';
import useNotification from './src/hooks/useNotification';
import { getContacts } from './src/utils/contacts';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <DataWrapper>
            <NavigationContainer
              linking={linking}
              fallback={<Text>Loading... Please wait...</Text>}
            >
              <RootNavigator />
            </NavigationContainer>
            <Toast />
          </DataWrapper>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

interface DataWrapperProps {
  children: React.ReactNode;
}

const DataWrapper = ({ children }: { children: React.ReactNode }) => {
  const { loading, error, doKeysExist } = useFetchLocale();
  const { strings, isRtl } = useLocaleStore();

  useNotification();

  if (isRtl !== I18nManager.isRTL) {
    I18nManager.forceRTL(isRtl);
  }

  useEffect(() => {
    if (loading) return;
    if (Object.keys(strings || {}).length > 0) {
      BootSplash.hide({ fade: true });
    }
  }, [loading, strings]);

  if (!!error && !doKeysExist) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{`${error || 'Something went wrong'}! Reload the app.`}</Text>
      </View>
    );
  }

  return children;
};
