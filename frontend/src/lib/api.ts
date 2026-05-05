import axios, { AxiosError, AxiosInstance } from 'axios';

// Route browser requests through the same-origin Next.js `/api` proxy.
// The proxy target is configured in `next.config.mjs` from NEXT_PUBLIC_API_URL.
const API_BASE_URL = '/api';

export interface APIError {
  error?: string;
  message?: string;
  statusCode?: number;
}

type WrappedResponse<T> = { data: T } & (T extends object ? T : Record<string, never>);

const wrap = <T,>(data: T): WrappedResponse<T> => {
  if (Array.isArray(data) || data === null || typeof data !== 'object') {
    return { data } as WrappedResponse<T>;
  }

  return { data, ...(data as Record<string, unknown>) } as WrappedResponse<T>;
};

class APIClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }

    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  private handleError(error: AxiosError<APIError>) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }

  async login(email: string, password: string) {
    try {
      const { data } = await this.client.post('/auth/login', { email, password });
      this.setTokens(data.accessToken, data.refreshToken);
      return wrap(data);
    } catch (error) {
      throw this.handleError(error as AxiosError<APIError>);
    }
  }

  async signup(name: string, email: string, password: string, role: 'patient' | 'doctor' | 'admin') {
    try {
      const normalizedRole = role === 'doctor' ? 'doctor' : 'patient';
      const { data } = await this.client.post('/auth/signup', { name, email, password, role: normalizedRole });
      this.setTokens(data.accessToken, data.refreshToken);
      return wrap(data);
    } catch (error) {
      throw this.handleError(error as AxiosError<APIError>);
    }
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken() {
    const { data } = await this.client.post('/auth/refresh', { refreshToken: this.refreshToken });
    this.accessToken = data.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
    }
    return wrap(data);
  }

  async getCurrentUser() {
    const { data } = await this.client.get('/users/me');
    return wrap(data);
  }

  async getMe() {
    return this.getCurrentUser();
  }

  async updateCurrentUser(payload: unknown) {
    const { data } = await this.client.put('/users/me', payload);
    return wrap(data);
  }

  async getDoctors() {
    const { data } = await this.client.get('/users/doctors');
    return wrap(data);
  }

  async getDoctorProfile(doctorId: string) {
    const { data } = await this.client.get(`/users/doctors/${doctorId}`);
    return wrap(data);
  }

  async getNearbyDoctors(lat: number, lng: number) {
    const { data } = await this.client.get('/users/doctors/nearby', { params: { lat, lng } });
    return wrap(data);
  }

  async recommendDoctors(symptoms: string[] | string) {
    const value = Array.isArray(symptoms) ? symptoms.join(',') : symptoms;
    const { data } = await this.client.get('/users/doctors/recommendations', { params: { symptoms: value } });
    return wrap(data);
  }

  async getAppointments() {
    const { data } = await this.client.get('/appointments');
    return wrap(data);
  }

  async getAppointment(appointmentId: string) {
    const { data } = await this.client.get(`/appointments/${appointmentId}`);
    return wrap(data);
  }

  async bookAppointment(payload: unknown) {
    const { data } = await this.client.post('/appointments', payload);
    return wrap(data);
  }

  async updateAppointmentStatus(appointmentId: string, payload: unknown) {
    const { data } = await this.client.patch(`/appointments/${appointmentId}`, payload);
    return wrap(data);
  }

  async cancelAppointment(appointmentId: string) {
    const { data } = await this.client.delete(`/appointments/${appointmentId}`);
    return wrap(data);
  }

  async bookEmergencyAppointment(payload: unknown) {
    const { data } = await this.client.post('/appointments/emergency', payload);
    return wrap(data);
  }

  async getConversations() {
    const { data } = await this.client.get('/messages/conversations');
    return wrap(data);
  }

  async sendMessage(conversationId: string, payload: unknown) {
    const { data } = await this.client.post(`/messages/${conversationId}`, payload);
    return wrap(data);
  }

  async getTimeline() {
    const { data } = await this.client.get('/timeline');
    return wrap(data);
  }

  async getReports() {
    const { data } = await this.client.get('/reports');
    return wrap(data);
  }

  async analyzeReport(payload: unknown) {
    const { data } = await this.client.post('/reports/analyze', payload);
    return wrap(data);
  }

  async getAnalytics() {
    const { data } = await this.client.get('/analytics');
    return wrap(data);
  }

  async getPrescriptions() {
    const { data } = await this.client.get('/prescriptions');
    return wrap(data);
  }

  async forgotPassword(payload: unknown) {
    const { data } = await this.client.post('/auth/forgot-password', payload);
    return wrap(data);
  }

  async resetPassword(payload: unknown) {
    const { data } = await this.client.post('/auth/reset-password', payload);
    return wrap(data);
  }

  async getSessions() {
    const { data } = await this.client.get('/security/sessions');
    return wrap(data);
  }

  async setupTwoFactor() {
    const { data } = await this.client.post('/security/2fa/setup');
    return wrap(data);
  }

  async enableTwoFactor(code: string) {
    const { data } = await this.client.post('/security/2fa/enable', { code });
    return wrap(data);
  }
}

export const apiClient = new APIClient();
export default apiClient;