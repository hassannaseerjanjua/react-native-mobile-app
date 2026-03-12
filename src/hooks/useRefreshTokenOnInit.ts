import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../utils/api';
import apiEndpoints from '../constants/api-endpoints';
import { login } from '../store/reducer/auth';
import { useAuthStore } from '../store/reducer/auth';
import { RefreshLoginApiResponse } from '../types';

/**
 * Calls REFRESH_TOKEN API on app init when user is authenticated.
 * Updates Redux with fresh user and JWT from the response.
 * Returns isReady: false until refresh completes, so the app can block other API calls.
 */
export const useRefreshTokenOnInit = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useAuthStore();
  const hasAttempted = useRef(false);
  const [isReady, setIsReady] = useState(() => !token);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsReady(true);
      return;
    }
    if (hasAttempted.current) return;

    hasAttempted.current = true;

    const refresh = async () => {
      const response = await api.get<RefreshLoginApiResponse>(
        apiEndpoints.REFRESH_TOKEN,
        {},
      );

      if (response.success && response.data?.User) {
        dispatch(
          login({
            user: response.data.User,
            token: response.data.JwtToken,
          }),
        );
      }
      setIsReady(true);
    };

    refresh();
  }, [dispatch, isAuthenticated, token]);

  return { isTokenRefreshReady: isReady };
};
