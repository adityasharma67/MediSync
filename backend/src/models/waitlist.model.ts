import mongoose, { Document, Schema } from 'mongoose';

export interface IWaitlistEntry extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  symptoms?: string[];
  priority: number;
  status: 'waiting' | 'assigned' | 'cancelled' | 'expired';
  queueType: 'fifo' | 'priority';
  assignedAppointment?: mongoose.Types.ObjectId;
}

const waitlistSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    symptoms: [{ type: String }],
    priority: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['waiting', 'assigned', 'cancelled', 'expired'],
      default: 'waiting',
    },
    queueType: {
      type: String,
      enum: ['fifo', 'priority'],
      default: 'priority',
    },
    assignedAppointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  },
  { timestamps: true }
);

waitlistSchema.index({ doctor: 1, date: 1, time: 1, status: 1, priority: -1, createdAt: 1 });
waitlistSchema.index(
  { patient: 1, doctor: 1, date: 1, time: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'waiting' } }
);

const WaitlistEntry = mongoose.model<IWaitlistEntry>('WaitlistEntry', waitlistSchema);
export default WaitlistEntry;
