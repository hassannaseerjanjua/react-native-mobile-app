import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export interface LocaleState {
  langId: number;
  langCode: string;
  isRtl: boolean;
  strings: Record<LocaleString, string> | null;
}

// init states
const initState: LocaleState = {
  langId: 1,
  langCode: 'en',
  isRtl: false,
  strings: null,
};

// reducer
const locale = createSlice({
  name: 'locale',
  initialState: initState,
  reducers: {
    setLocale(state, action: PayloadAction<Partial<LocaleState>>) {
      state = { ...state, ...action.payload };
    },
  },
});

export const { setLocale } = locale.actions;
export default locale.reducer;

export const useLocaleStore = () => {
  const locale = useSelector((state: RootState) => state.locale);

  return {
    ...locale,
    getString: (key: LocaleString) => {
      return locale?.strings?.[key] || key;
    },
  };
};

type LocaleString = 'SIGN_IN' | 'SIGN_UP' | 'WELCOME_BACK';
