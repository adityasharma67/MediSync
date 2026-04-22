import mongoose, { Document, Schema } from 'mongoose';

export interface IConversationMessage {
  sender: mongoose.Types.ObjectId;
  senderRole: 'patient' | 'doctor' | 'system';
  text?: string;
  attachments?: { name: string; url: string; mimeType: string }[];
  createdAt: Date;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  appointment?: mongoose.Types.ObjectId;
  messages: IConversationMessage[];
  lastMessageAt?: Date;
}

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderRole: {
          type: String,
          enum: ['patient', 'doctor', 'system'],
          required: true,
        },
        text: { type: String },
        attachments: [
          {
            name: { type: String, required: true },
            url: { type: String, required: true },
            mimeType: { type: String, required: true },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export default Conversation;
