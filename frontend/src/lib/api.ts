import axios, { AxiosInstance } from 'axios';
import { 
  AuthResponse, 
  IAppointment, 
  IPrescription, 
  CreateAppointmentPayload,
  CreatePrescriptionPayload,
  IUser,
  INotification
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to all requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
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

  // User APIs
  getMe() {
    return this.client.get<IUser>('/api/users/me');
  }

  updateProfile(data: Partial<IUser>) {
    return this.client.put<IUser>('/api/users/me', data);
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
