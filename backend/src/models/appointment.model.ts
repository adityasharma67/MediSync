import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetLink?: string;
}

const appointmentSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    meetLink: { type: String },
  },
  { timestamps: true }
);

// Prevent double booking for the same doctor at the same time
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;
