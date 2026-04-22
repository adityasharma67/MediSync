import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  user?: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  type: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

const analyticsEventSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    doctor: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ type: 1, occurredAt: -1 });
analyticsEventSchema.index({ doctor: 1, occurredAt: -1 });
analyticsEventSchema.index({ user: 1, occurredAt: -1 });

const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;
