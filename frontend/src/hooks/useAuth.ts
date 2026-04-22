import { useEffect } from 'react';
import { apiClient } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();

  useEffect(() => {
    // Load auth from localStorage on mount
    const savedToken = localStorage.getItem('authToken');
    if (savedToken && !token) {
      setToken(savedToken);
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await apiClient.getMe();
      setUser(response.data);
    } catch (error) {
      logout();
    }
  };

  return { user, token, isAuthenticated: isAuthenticated(), logout };
};

import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [status, setStatus] = useCallback((
    'idle' as const
  ));
  const [value, setValue] = useCallback((null as T | null));
  const [error, setError] = useCallback((null as E | null));

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};
