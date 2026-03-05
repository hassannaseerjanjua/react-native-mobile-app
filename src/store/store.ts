import type { Middleware } from '@reduxjs/toolkit';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

import settings, { SettingsState } from './reducer/settings';
import auth from './reducer/auth';
import locale, { LocaleState } from './reducer/locale';
import { User } from '../types';
import { clearAllCache } from '../utils/api-cache';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'auth', 'locale'],
};

const rootReducer = combineReducers({
  settings: settings,
  auth: auth,
  locale: locale,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const clearCacheOnLogout: Middleware = () => next => action => {
  const result = next(action);
  if ((action as { type?: string }).type === 'auth/logout') {
    clearAllCache();
  }
  return result;
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }).concat(clearCacheOnLogout),
});

export const persistor = persistStore(store);

export interface RootState {
  settings: SettingsState;
  locale: LocaleState;
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  };
}
