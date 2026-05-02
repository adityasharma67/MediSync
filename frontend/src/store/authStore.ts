import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  specialization?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getStoredToken = (key: 'accessToken' | 'refreshToken') => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(key);
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  hydrateAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isDoctor: () => boolean;
  isPatient: () => boolean;
}

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: getStoredToken('accessToken'),
  refreshToken: getStoredToken('refreshToken'),
  isLoading: false,
  error: null,

  hydrateAuth: () => {
    if (typeof window === 'undefined') return;

    const user = getStoredUser();
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    set({
      user,
      accessToken,
      refreshToken,
    });
  },

  setUser: (user) => {
    set({ user });
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  clearAuth: () => {
    set({ user: null, accessToken: null, refreshToken: null, error: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login(email, password);
      set({
        user: {
          _id: response._id,
          name: response.name,
          email: response.email,
          role: response.role,
          avatar: response.avatar,
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.signup(name, email, password, role);
      set({
        user: {
          _id: response._id,
          name: response.name,
          email: response.email,
          role: response.role,
          avatar: response.avatar,
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await apiClient.logout().catch(() => undefined);
    get().clearAuth();
  },

  isAuthenticated: () => {
    const { accessToken, user } = get();
    return Boolean(accessToken && user);
  },

  isDoctor: () => get().user?.role === 'doctor',
  isPatient: () => get().user?.role === 'patient',
}));

export default useAuthStore;
