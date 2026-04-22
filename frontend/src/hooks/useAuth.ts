import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.getMe();
        setUser(response.data);
      } catch {
        logout();
      }
    };

    if (accessToken && !user) {
      loadUser();
    }
  }, [accessToken, logout, setUser, user]);

  return { user, token: accessToken, isAuthenticated: isAuthenticated(), logout };
};

export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (executionError) {
      setError(executionError as E);
      setStatus('error');
      throw executionError;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};
