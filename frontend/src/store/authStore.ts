import { create } from 'zustand';
import { IUser, UserRole } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: IUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  
  // Token methods
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
  refreshAccessToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  
  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
    apiClient.setTokens(accessToken, refreshToken);
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.login(email, password);
      const { accessToken, refreshToken, _id, name, email: userEmail, role, avatar } = response.data;
      
      get().setTokens(accessToken, refreshToken);
      set({
        user: {
          _id,
          name,
          email: userEmail,
          role,
          avatar,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name: string, email: string, password: string, role: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.signup(name, email, password, role);
      const { accessToken, refreshToken, _id, email: userEmail } = response.data;
      
      get().setTokens(accessToken, refreshToken);
      set({
        user: {
          _id,
          name,
          email: userEmail,
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null, error: null });
    apiClient.clearTokens();
  },

  isAuthenticated: () => {
    const { accessToken } = get();
    return !!accessToken;
  },

  hasRole: (role: UserRole) => {
    const { user } = get();
    return user?.role === role;
  },

  refreshAccessToken: async () => {
    try {
      const { refreshToken } = get();
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await apiClient.client.post<{ accessToken: string }>('/api/auth/refresh', {
        refreshToken,
      });
      
      set({ accessToken: response.data.accessToken });
      localStorage.setItem('accessToken', response.data.accessToken);
    } catch (error) {
      get().logout();
      throw error;
    }
  },
}));

export default useAuthStore;
