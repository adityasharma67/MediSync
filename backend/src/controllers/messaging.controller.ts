import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Conversation from '../models/conversation.model';
import messagingService from '../services/messaging.service';
import { emitToUser } from '../services/socket.service';

export const getConversations = async (req: AuthRequest, res: Response) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name email role avatar')
    .sort({ lastMessageAt: -1 });

  res.json(conversations);
};

export const startConversation = async (req: AuthRequest, res: Response) => {
  const participantIds = [req.user._id.toString(), ...req.body.participantIds];
  const conversation = await messagingService.getOrCreateConversation(participantIds, req.body.appointmentId);
  res.status(201).json(conversation);
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const conversation = await messagingService.appendMessage({
    conversationId: req.params.id,
    senderId: req.user._id.toString(),
    senderRole: req.user.role,
    text: req.body.text,
    attachments: req.body.attachments,
  });

  conversation?.participants.forEach((participant: any) => {
    if (participant._id.toString() !== req.user._id.toString()) {
      emitToUser(participant._id.toString(), 'chat:new-message', {
        conversationId: conversation._id,
        message: conversation.messages[conversation.messages.length - 1],
      });
    }
  });

  res.json(conversation);
};
