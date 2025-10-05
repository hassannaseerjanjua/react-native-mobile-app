import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import RootNavigator from './src/navigators/stack.navigator';
import BootSplash from 'react-native-bootsplash';

//store
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useFetchLocale from './src/hooks/useFetchLocale';
import { Text, View } from 'react-native';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <DataWrapper>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
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

  useEffect(() => {
    if (loading) return;
    BootSplash.hide({ fade: true });
  }, [loading]);

  if (!!error && !doKeysExist) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{`${error || 'Something went wrong'}! Reload the app.`}</Text>
      </View>
    );
  }

  return children;
};
