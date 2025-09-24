import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import RootNavigator from './src/navigators/stack.navigator';
import BootSplash from 'react-native-bootsplash';

//store
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';

const App = () => {
  useEffect(() => {
    setTimeout(() => {
      BootSplash.hide({ fade: true });
    }, 1000);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
