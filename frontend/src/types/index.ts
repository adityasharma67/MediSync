export type UserRole = 'patient' | 'doctor' | 'admin';
export type AppointmentStatus = 'scheduled' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  specialization?: string;
  createdAt?: string;
  updatedAt?: string;
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
      address?: string;
      lat?: number;
      lng?: number;
    };
  };
}

export type IUser = User;

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

export interface Appointment {
  _id: string;
  patient: User;
  doctor: User;
  scheduledAt: string;
  date?: string;
  time?: string;
  meetLink?: string;
  source?: string;
  status: AppointmentStatus;
  notes?: string;
  callRoomId?: string;
  createdAt: string;
  updatedAt: string;
}

export type IAppointment = Appointment;

export interface ChatMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface RoomUser {
  userId: string;
  userName: string;
  role: UserRole;
}

export interface WebRTCOffer {
  from: string;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswer {
  from: string;
  answer: RTCSessionDescriptionInit;
}

export interface ICECandidateMessage {
  from: string;
  candidate: RTCIceCandidateInit;
}

export interface CreateAppointmentPayload {
  doctorId: string;
  scheduledAt: string;
  notes?: string;
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
  doctor: User;
  score: number;
  reasons: string[];
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription {
  _id: string;
  appointment: string;
  doctor: Partial<User>;
  patient: Partial<User>;
  medications: PrescriptionMedication[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  participants: User[];
  lastMessageAt?: string;
  messages: {
    senderId: string;
    senderRole?: UserRole | 'system';
    text: string;
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
  peakBookingTimes: {
    hour: string;
    count: number;
  }[];
  doctorPerformance: User[];
}

export interface SecuritySession {
  deviceId: string;
  userAgent?: string;
  lastSeenAt: string;
  createdAt?: string;
}