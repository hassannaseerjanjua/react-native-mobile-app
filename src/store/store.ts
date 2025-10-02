import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

// reducers
import settings, { SettingsState } from './reducer/settings';
import auth from './reducer/auth';
import locale, { LocaleState } from './reducer/locale';
import { User } from '../types';

// config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'auth'],
};

const rootReducer = combineReducers({
  settings: settings,
  auth: auth,
  locale: locale,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

//  root reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export interface RootState {
  settings: SettingsState;
  locale: LocaleState;
  auth: {
    isAuthenticated: boolean;
    user: User | null;
  };
}
