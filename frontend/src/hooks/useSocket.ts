import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface UseSocketOptions {
  userId?: string;
  userName?: string;
  userRole?: 'patient' | 'doctor';
  autoConnect?: boolean;
}

export const useSocket = ({
  userId,
  userName,
  userRole,
  autoConnect = true,
}: UseSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect || !userId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    // Connection established
    socketRef.current.on('connect', () => {
      console.log(`Socket connected: ${socketRef.current?.id}`);
      setIsConnected(true);
      setError(null);

      // Identify user to server
      if (userId && userName && userRole) {
        socketRef.current?.emit('identify-user', {
          userId,
          userName,
          role: userRole,
        });
      }
    });

    // Connection error
    socketRef.current.on('connection_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setError(error.message);
      setIsConnected(false);
    });

    // Disconnected
    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, userName, userRole, autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
  };
};

export default useSocket;
