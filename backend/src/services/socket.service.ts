import { Server } from 'socket.io';

let io: Server | null = null;

export const initializeSocketService = (socketServer: Server) => {
  io = socketServer;
};

export const getSocketService = () => io;

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  io?.to(`user:${userId}`).emit(event, payload);
};

export const emitToSlot = (slotKey: string, event: string, payload: unknown) => {
  io?.to(`slot:${slotKey}`).emit(event, payload);
};
