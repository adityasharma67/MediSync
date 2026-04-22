// User Types
export type UserRole = 'patient' | 'doctor' | 'admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  specialization?: string;
  availableSlots?: { date: string; time: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: string;
}

// Appointment Types
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface IAppointment {
  _id: string;
  patient: Partial<IUser>;
  doctor: Partial<IUser>;
  date: string;
  time: string;
  status: AppointmentStatus;
  meetLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  doctorId: string;
  date: string;
  time: string;
}

// Prescription Types
export interface IPrescription {
  _id: string;
  appointment: string;
  doctor: Partial<IUser>;
  patient: Partial<IUser>;
  medications: PrescriptionMedication[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface CreatePrescriptionPayload {
  appointmentId: string;
  medications: PrescriptionMedication[];
  notes?: string;
}

// Notification Types
export interface INotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'message' | 'system';
  read: boolean;
  createdAt: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

// Doctor Availability
export interface DoctorAvailability {
  doctorId: string;
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
}

// Password Reset
export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
