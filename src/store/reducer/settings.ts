import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export interface SettingsState {}

// init states
const initState: SettingsState = {};

// reducer
const settings = createSlice({
  name: 'settings',
  initialState: initState,
  reducers: {
    setSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      state = { ...state, ...action.payload };
    },
  },
});

export const { setSettings } = settings.actions;
export default settings.reducer;

export const useSettingsStore = () => {
  const settings = useSelector(
    (state: RootState) => state?.settings || initState,
  );
  return settings;
};
