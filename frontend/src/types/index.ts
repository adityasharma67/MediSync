export type UserRole = 'patient' | 'doctor' | 'admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  specialization?: string;
  availableSlots?: { date: string; time: string }[];
  symptomsProfile?: string[];
  doctorProfile?: {
    bio?: string;
    hospital?: string;
    consultationFee?: number;
    experienceYears?: number;
    languages?: string[];
    rating?: number;
    reviewCount?: number;
    emergencyAvailable?: boolean;
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
  };
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

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'emergency';

export interface IAppointment {
  _id: string;
  patient: Partial<IUser>;
  doctor: Partial<IUser>;
  date: string;
  time: string;
  status: AppointmentStatus;
  meetLink?: string;
  symptoms?: string[];
  urgencyLevel?: 'normal' | 'priority' | 'emergency';
  source?: 'standard' | 'waitlist-auto' | 'emergency';
  queueAssignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  doctorId: string;
  date: string;
  time: string;
  symptoms?: string[];
  joinWaitlist?: boolean;
}

export interface QueueEntryStatus {
  entry: {
    _id: string;
    doctor: string;
    date: string;
    time: string;
    priority: number;
    status: string;
  };
  position: number;
  totalWaiting: number;
}

export interface DoctorRecommendation {
  doctor: IUser;
  score: number;
  reasons: string[];
}

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

export interface INotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'message' | 'system';
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface DoctorAvailability {
  doctorId: string;
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MedicalReport {
  _id: string;
  title: string;
  fileName: string;
  mimeType: string;
  extractedText: string;
  plainLanguageSummary: string;
  insights: string[];
  createdAt: string;
}

export interface TimelineItem {
  id: string;
  type: 'appointment' | 'prescription' | 'report';
  title: string;
  timestamp: string;
  payload: any;
}

export interface Conversation {
  _id: string;
  participants: IUser[];
  lastMessageAt?: string;
  messages: {
    sender: string;
    senderRole: 'patient' | 'doctor' | 'system';
    text?: string;
    attachments?: { name: string; url: string; mimeType: string }[];
    createdAt: string;
  }[];
}

export interface AnalyticsDashboard {
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    emergencyAppointments: number;
    conversations: number;
  };
  peakBookingTimes: { hour: number; count: number }[];
  doctorPerformance: IUser[];
}

export interface SecuritySession {
  deviceId: string;
  userAgent?: string;
  lastSeenAt: string;
  createdAt: string;
}
