import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';

// Track active rooms and participants
interface RoomUser {
  userId: string;
  socketId: string;
  userName: string;
  role: 'doctor' | 'patient';
}

interface CallRoom {
  appointmentId: string;
  participants: Map<string, RoomUser>;
  createdAt: Date;
  messages: Array<{
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Date;
  }>;
}

class WebRTCSignalingService {
  private io: Server;
  private rooms: Map<string, CallRoom> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(socketServer: Server) {
    this.io = socketServer;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Store socket-to-user mapping
      socket.on('identify-user', (data: { userId: string; userName: string; role: 'doctor' | 'patient' }) => {
        this.userSockets.set(data.userId, socket.id);
        this.socketUsers.set(socket.id, data.userId);
        logger.info(`User ${data.userId} identified with socket ${socket.id}`);
      });

      // Join video call room
      socket.on('join-room', (data: { appointmentId: string; userId: string; userName: string; role: 'doctor' | 'patient' }) => {
        this.handleJoinRoom(socket, data);
      });

      // WebRTC signaling events
      socket.on('webrtc-offer', (data: { to: string; offer: RTCSessionDescriptionInit; from: string }) => {
        this.handleWebRTCOffer(socket, data);
      });

      socket.on('webrtc-answer', (data: { to: string; answer: RTCSessionDescriptionInit; from: string }) => {
        this.handleWebRTCAnswer(socket, data);
      });

      socket.on('webrtc-ice-candidate', (data: { to: string; candidate: RTCIceCandidateInit; from: string }) => {
        this.handleICECandidate(socket, data);
      });

      // Chat events
      socket.on('send-chat', (data: { appointmentId: string; userId: string; userName: string; message: string }) => {
        this.handleChatMessage(socket, data);
      });

      // Leave room
      socket.on('leave-room', (data: { appointmentId: string; userId: string }) => {
        this.handleLeaveRoom(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Error handling
      socket.on('error', (error) => {
        logger.error(`Socket error: ${error}`);
      });
    });
  }

  private handleJoinRoom(socket: Socket, data: { appointmentId: string; userId: string; userName: string; role: 'doctor' | 'patient' }) {
    const { appointmentId, userId, userName, role } = data;
    const roomId = `room:${appointmentId}`;

    // Join socket.io room
    socket.join(roomId);

    // Get or create call room
    if (!this.rooms.has(appointmentId)) {
      this.rooms.set(appointmentId, {
        appointmentId,
        participants: new Map(),
        createdAt: new Date(),
        messages: [],
      });
    }

    const room = this.rooms.get(appointmentId)!;
    const roomUser: RoomUser = { userId, socketId: socket.id, userName, role };
    room.participants.set(userId, roomUser);

    // Get list of other participants
    const otherParticipants = Array.from(room.participants.values()).filter((p) => p.userId !== userId);

    // Notify new user of existing participants
    socket.emit('room-joined', {
      participants: otherParticipants.map((p) => ({
        userId: p.userId,
        userName: p.userName,
        role: p.role,
      })),
      appointmentId,
    });

    // Notify others that a new user joined
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      role,
    });

    logger.info(`User ${userId} joined room ${appointmentId}`);
  }

  private handleWebRTCOffer(socket: Socket, data: { to: string; offer: RTCSessionDescriptionInit; from: string }) {
    const { to, offer, from } = data;
    const targetSocket = this.userSockets.get(to);

    if (targetSocket) {
      this.io.to(targetSocket).emit('webrtc-offer', {
        from,
        offer,
      });
      logger.info(`WebRTC offer sent from ${from} to ${to}`);
    } else {
      logger.warn(`Target user ${to} not found for offer from ${from}`);
    }
  }

  private handleWebRTCAnswer(socket: Socket, data: { to: string; answer: RTCSessionDescriptionInit; from: string }) {
    const { to, answer, from } = data;
    const targetSocket = this.userSockets.get(to);

    if (targetSocket) {
      this.io.to(targetSocket).emit('webrtc-answer', {
        from,
        answer,
      });
      logger.info(`WebRTC answer sent from ${from} to ${to}`);
    } else {
      logger.warn(`Target user ${to} not found for answer from ${from}`);
    }
  }

  private handleICECandidate(socket: Socket, data: { to: string; candidate: RTCIceCandidateInit; from: string }) {
    const { to, candidate, from } = data;
    const targetSocket = this.userSockets.get(to);

    if (targetSocket) {
      this.io.to(targetSocket).emit('webrtc-ice-candidate', {
        from,
        candidate,
      });
    }
  }

  private handleChatMessage(
    socket: Socket,
    data: { appointmentId: string; userId: string; userName: string; message: string }
  ) {
    const { appointmentId, userId, userName, message } = data;
    const room = this.rooms.get(appointmentId);

    if (room) {
      const chatMessage = {
        senderId: userId,
        senderName: userName,
        message,
        timestamp: new Date(),
      };

      room.messages.push(chatMessage);

      // Emit to all participants in room
      const roomId = `room:${appointmentId}`;
      this.io.to(roomId).emit('receive-chat', chatMessage);

      logger.info(`Chat message in room ${appointmentId} from ${userName}`);
    }
  }

  private handleLeaveRoom(socket: Socket, data: { appointmentId: string; userId: string }) {
    const { appointmentId, userId } = data;
    const roomId = `room:${appointmentId}`;
    const room = this.rooms.get(appointmentId);

    if (room) {
      room.participants.delete(userId);
      this.userSockets.delete(userId);

      // Notify others
      socket.to(roomId).emit('user-left', { userId });

      // Clean up room if empty
      if (room.participants.size === 0) {
        this.rooms.delete(appointmentId);
        logger.info(`Room ${appointmentId} deleted (empty)`);
      }
    }

    socket.leave(roomId);
  }

  private handleDisconnect(socket: Socket) {
    const userId = this.socketUsers.get(socket.id);

    if (userId) {
      this.socketUsers.delete(socket.id);
      this.userSockets.delete(userId);

      // Leave all rooms
      this.rooms.forEach((room, appointmentId) => {
        if (room.participants.has(userId)) {
          this.handleLeaveRoom(socket, { appointmentId, userId });
        }
      });

      logger.info(`User ${userId} disconnected`);
    }
  }

  // Utility: Get room participants
  getRoomParticipants(appointmentId: string) {
    const room = this.rooms.get(appointmentId);
    if (!room) return [];
    return Array.from(room.participants.values());
  }

  // Utility: Get room chat history
  getRoomChatHistory(appointmentId: string) {
    const room = this.rooms.get(appointmentId);
    return room?.messages || [];
  }
}

let socketService: WebRTCSignalingService | null = null;

export const initializeSocketService = (io: Server) => {
  socketService = new WebRTCSignalingService(io);
  logger.info('WebRTC Signaling Service initialized');
};

export const getSocketService = () => socketService;

// Utility to emit to specific user
export const emitToUser = (userId: string, event: string, payload: unknown) => {
  const socketId = socketService?.['userSockets']?.get(userId);
  if (socketId) {
    socketService?.['io']?.to(socketId).emit(event, payload);
  }
};

export const emitToSlot = (slotKey: string, event: string, payload: unknown) => {
  socketService?.['io']?.to(`slot:${slotKey}`).emit(event, payload);
};
