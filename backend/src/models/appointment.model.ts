import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  scheduledAt: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  source?: 'standard' | 'emergency';
  callRoomId?: string; // Video call room ID
}

const appointmentSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String },
    source: {
      type: String,
      enum: ['standard', 'emergency'],
      default: 'standard',
    },
    callRoomId: { type: String }, // Generated when call starts
  },
  { timestamps: true }
);

// Indexes for common queries
appointmentSchema.index({ patient: 1, createdAt: -1 });
appointmentSchema.index({ doctor: 1, status: 1, scheduledAt: -1 });
appointmentSchema.index({ scheduledAt: 1, status: 1 });

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;
