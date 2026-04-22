import Conversation from '../models/conversation.model';

class MessagingService {
  async getOrCreateConversation(participants: string[], appointmentId?: string) {
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length },
      ...(appointmentId ? { appointment: appointmentId } : {}),
    });

    if (existingConversation) {
      return existingConversation;
    }

    return Conversation.create({
      participants,
      appointment: appointmentId,
      messages: [],
      lastMessageAt: new Date(),
    });
  }

  async appendMessage(payload: {
    conversationId: string;
    senderId: string;
    senderRole: 'patient' | 'doctor' | 'system';
    text?: string;
    attachments?: { name: string; url: string; mimeType: string }[];
  }) {
    return Conversation.findByIdAndUpdate(
      payload.conversationId,
      {
        $push: {
          messages: {
            sender: payload.senderId,
            senderRole: payload.senderRole,
            text: payload.text,
            attachments: payload.attachments || [],
            createdAt: new Date(),
          },
        },
        $set: { lastMessageAt: new Date() },
      },
      { new: true }
    ).populate('participants', 'name email role avatar');
  }
}

export default new MessagingService();
