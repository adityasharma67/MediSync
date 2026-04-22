import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'emergency';
  meetLink?: string;
  symptoms?: string[];
  urgencyLevel?: 'normal' | 'priority' | 'emergency';
  source?: 'standard' | 'waitlist-auto' | 'emergency';
  queueAssignedAt?: Date;
}

const appointmentSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'emergency'],
      default: 'scheduled',
    },
    meetLink: { type: String },
    symptoms: [{ type: String }],
    urgencyLevel: {
      type: String,
      enum: ['normal', 'priority', 'emergency'],
      default: 'normal',
    },
    source: {
      type: String,
      enum: ['standard', 'waitlist-auto', 'emergency'],
      default: 'standard',
    },
    queueAssignedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent double booking for the same doctor at the same time
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, status: 1, date: -1 });
appointmentSchema.index({ patient: 1, status: 1, createdAt: -1 });

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;
