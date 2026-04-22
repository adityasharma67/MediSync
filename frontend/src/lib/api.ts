import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthResponse,
  RefreshResponse,
  IAppointment,
  IPrescription,
  CreateAppointmentPayload,
  CreatePrescriptionPayload,
  IUser,
  INotification,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@/types';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

class APIClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: any[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load tokens from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }

    // Request interceptor - add token to all requests
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor - handle token expiry and refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Check if error is due to expired token
        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          this.isRefreshing = true;

          try {
            const response = await this.client.post<RefreshResponse>('/api/auth/refresh', {
              refreshToken: this.refreshToken,
            });

            this.accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', this.accessToken);

            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            this.processQueue(null, this.accessToken);

            return this.client(originalRequest);
          } catch (err) {
            this.processQueue(err, null);
            this.clearTokens();
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(err);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Auth APIs
  signup(name: string, email: string, password: string, role: string = 'patient') {
    return this.client.post<AuthResponse>('/api/auth/signup', { name, email, password, role });
  }

  login(email: string, password: string) {
    return this.client.post<AuthResponse>('/api/auth/login', { email, password });
  }

  googleAuth(email: string, name: string, googleId: string, avatar?: string) {
    return this.client.post<AuthResponse>('/api/auth/google', { email, name, googleId, avatar });
  }

  forgotPassword(payload: ForgotPasswordPayload) {
    return this.client.post('/api/auth/forgot-password', payload);
  }

  resetPassword(payload: ResetPasswordPayload) {
    return this.client.post('/api/auth/reset-password', payload);
  }

  logout() {
    return this.client.post('/api/auth/logout').finally(() => {
      this.clearTokens();
    });
  }

  // User APIs
  getMe() {
    return this.client.get<IUser>('/api/users/profile');
  }

  updateProfile(data: Partial<IUser>) {
    return this.client.put<IUser>('/api/users/profile', data);
  }

  getDoctors() {
    return this.client.get<IUser[]>('/api/users/doctors');
  }

  getDoctorById(id: string) {
    return this.client.get<IUser>(`/api/users/${id}`);
  }

  // Appointment APIs
  bookAppointment(payload: CreateAppointmentPayload) {
    return this.client.post<IAppointment>('/api/appointments', payload);
  }

  getAppointments() {
    return this.client.get<IAppointment[]>('/api/appointments');
  }

  getAppointmentById(id: string) {
    return this.client.get<IAppointment>(`/api/appointments/${id}`);
  }

  updateAppointment(id: string, data: Partial<IAppointment>) {
    return this.client.put<IAppointment>(`/api/appointments/${id}`, data);
  }

  cancelAppointment(id: string) {
    return this.client.put<IAppointment>(`/api/appointments/${id}`, { status: 'cancelled' });
  }

  // Prescription APIs
  createPrescription(payload: CreatePrescriptionPayload) {
    return this.client.post<IPrescription>('/api/prescriptions', payload);
  }

  getPrescriptions() {
    return this.client.get<IPrescription[]>('/api/prescriptions');
  }

  getPrescriptionById(id: string) {
    return this.client.get<IPrescription>(`/api/prescriptions/${id}`);
  }

  downloadPrescriptionPDF(id: string) {
    return this.client.get(`/api/prescriptions/${id}/pdf`, { responseType: 'blob' });
  }

  // Notification APIs
  getNotifications() {
    return this.client.get<INotification[]>('/api/notifications');
  }

  markNotificationAsRead(id: string) {
    return this.client.put(`/api/notifications/${id}`, { read: true });
  }

  clearNotifications() {
    return this.client.delete('/api/notifications');
  }
}

export const apiClient = new APIClient();
