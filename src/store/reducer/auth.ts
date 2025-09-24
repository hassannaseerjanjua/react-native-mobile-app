import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email?: string;
    phone?: string;
  } | null;
}

// init states
const initState: AuthState = {
  isAuthenticated: false,
  user: null,
};

// reducer
const auth = createSlice({
  name: 'auth',
  initialState: initState,
  reducers: {
    login(
      state: AuthState,
      action: PayloadAction<{ email?: string; phone?: string }>,
    ) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state: AuthState) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = auth.actions;
export default auth.reducer;

export const useAuthStore = () => {
  const auth = useSelector((state: RootState) => state.auth);
  return auth;
};
