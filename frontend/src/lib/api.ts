import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  AnalyticsDashboard,
  AuthResponse,
  Conversation,
  CreateAppointmentPayload,
  CreatePrescriptionPayload,
  DoctorRecommendation,
  ForgotPasswordPayload,
  IAppointment,
  INotification,
  IPrescription,
  IUser,
  MedicalReport,
  QueueEntryStatus,
  RefreshResponse,
  ResetPasswordPayload,
  SecuritySession,
  TimelineItem,
} from '@/types';
import useAuthStore from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

class APIClient {
  public client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');

      if (!localStorage.getItem('deviceId')) {
        localStorage.setItem('deviceId', crypto.randomUUID());
      }
    }

    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

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

  private getDeviceId() {
    if (typeof window === 'undefined') {
      return 'server-device';
    }

    return localStorage.getItem('deviceId') || 'browser-device';
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

  signup(name: string, email: string, password: string, role: string = 'patient') {
    return this.client.post<AuthResponse>('/api/auth/signup', {
      name,
      email,
      password,
      role,
      deviceId: this.getDeviceId(),
    });
  }

  login(email: string, password: string, twoFactorCode?: string) {
    return this.client.post<AuthResponse>('/api/auth/login', {
      email,
      password,
      twoFactorCode,
      deviceId: this.getDeviceId(),
    });
  }

  googleAuth(email: string, name: string, googleId: string, avatar?: string) {
    return this.client.post<AuthResponse>('/api/auth/google', {
      email,
      name,
      googleId,
      avatar,
      deviceId: this.getDeviceId(),
    });
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

  getMe() {
    return this.client.get<IUser>('/api/users/profile');
  }

  updateProfile(data: Partial<IUser>) {
    return this.client.put<IUser>('/api/users/profile', data);
  }

  getDoctors() {
    return this.client.get<IUser[]>('/api/users/doctors');
  }

  recommendDoctors(symptoms: string[]) {
    return this.client.get<DoctorRecommendation[]>('/api/users/doctors/recommendations', {
      params: { symptoms: symptoms.join(',') },
    });
  }

  getNearbyDoctors(lat: number, lng: number) {
    return this.client.get<IUser[]>('/api/users/doctors/nearby', { params: { lat, lng } });
  }

  getDoctorById(id: string) {
    return this.client.get<IUser>(`/api/users/${id}`);
  }

  bookAppointment(payload: CreateAppointmentPayload) {
    return this.client.post<IAppointment | { joinedWaitlist: boolean; queue: QueueEntryStatus; message: string }>(
      '/api/appointments',
      payload
    );
  }

  bookEmergencyAppointment(payload: { symptoms: string[]; date?: string; time?: string }) {
    return this.client.post<{ message: string; appointment: IAppointment }>('/api/appointments/emergency', payload);
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

  joinWaitlist(payload: { doctorId: string; date: string; time: string; symptoms?: string[]; priority?: number }) {
    return this.client.post<QueueEntryStatus>('/api/queue', payload);
  }

  getQueueStatus(id: string) {
    return this.client.get<QueueEntryStatus>(`/api/queue/${id}`);
  }

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

  getTimeline() {
    return this.client.get<TimelineItem[]>('/api/timeline');
  }

  analyzeReport(payload: {
    title: string;
    fileName: string;
    mimeType: string;
    fileData?: string;
    appointmentId?: string;
    ocrText?: string;
  }) {
    return this.client.post<MedicalReport>('/api/reports', payload);
  }

  getReports() {
    return this.client.get<MedicalReport[]>('/api/reports');
  }

  getConversations() {
    return this.client.get<Conversation[]>('/api/messages');
  }

  startConversation(participantIds: string[], appointmentId?: string) {
    return this.client.post<Conversation>('/api/messages', { participantIds, appointmentId });
  }

  sendMessage(conversationId: string, payload: { text?: string; attachments?: { name: string; url: string; mimeType: string }[] }) {
    return this.client.post<Conversation>(`/api/messages/${conversationId}/messages`, payload);
  }

  getAnalytics() {
    return this.client.get<AnalyticsDashboard>('/api/analytics');
  }

  setupTwoFactor() {
    return this.client.post<{ secret: string; otpPreview: string }>('/api/security/2fa/setup');
  }

  enableTwoFactor(code: string) {
    return this.client.post<{ enabled: boolean }>('/api/security/2fa/enable', { code });
  }

  getSessions() {
    return this.client.get<SecuritySession[]>('/api/security/sessions');
  }

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
