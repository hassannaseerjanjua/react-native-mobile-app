import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { User } from '../../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

const initState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const auth = createSlice({
  name: 'auth',
  initialState: initState,
  reducers: {
    login(
      state: AuthState,
      action: PayloadAction<{ user: User; token: string }>,
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state: AuthState) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
});

export const { login, logout } = auth.actions;
export default auth.reducer;

export const useAuthStore = () => {
  const auth = useSelector((state: RootState) => state?.auth || initState);
  return auth;
};
