import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { Socket } from 'socket.io-client';
import { ChatMessage, RoomUser, WebRTCOffer, WebRTCAnswer, ICECandidateMessage } from '@/types';

interface UseWebRTCOptions {
  socket: Socket | null;
  appointmentId: string;
  userId: string;
  userName: string;
  role: 'patient' | 'doctor';
  onRemoteStream?: (stream: MediaStream) => void;
  onLocalStream?: (stream: MediaStream) => void;
  onParticipantJoined?: (user: RoomUser) => void;
  onParticipantLeft?: (userId: string) => void;
  onError?: (error: Error) => void;
}

interface PeerConnection {
  peerId: string;
  peer: SimplePeer.Instance;
}

export const useWebRTC = ({
  socket,
  appointmentId,
  userId,
  userName,
  role,
  onRemoteStream,
  onLocalStream,
  onParticipantJoined,
  onParticipantLeft,
  onError,
}: UseWebRTCOptions) => {
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const [participants, setParticipants] = useState<RoomUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);

  // Get local media stream
  const getLocalStream = async (): Promise<MediaStream> => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      localStreamRef.current = stream;
      onLocalStream?.(stream);
      return stream;
    } catch (err) {
      const error = new Error('Failed to access camera/microphone');
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  // Create peer connection
  const createPeerConnection = async (
    peerId: string,
    initiator: boolean
  ): Promise<SimplePeer.Instance> => {
    try {
      const stream = await getLocalStream();

      const peer = new SimplePeer({
        initiator,
        trickle: true,
        stream,
        config: {
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302'] },
            { urls: ['stun:stun1.l.google.com:19302'] },
          ],
        },
      });

      // Send SDP offer to other peer via Socket.io
      peer.on('signal', (data: any) => {
        if (data.type === 'offer') {
          socket?.emit('webrtc-offer', {
            to: peerId,
            from: userId,
            offer: data,
          });
        } else if (data.type === 'answer') {
          socket?.emit('webrtc-answer', {
            to: peerId,
            from: userId,
            answer: data,
          });
        } else if (data.candidate) {
          socket?.emit('webrtc-ice-candidate', {
            to: peerId,
            from: userId,
            candidate: data,
          });
        }
      });

      // Handle remote stream
      peer.on('stream', (stream: MediaStream) => {
        onRemoteStream?.(stream);
      });

      // Error handling
      peer.on('error', (err: Error) => {
        console.error(`Peer error with ${peerId}:`, err);
        setError(err.message);
        onError?.(err);
      });

      // Peer connection closed
      peer.on('close', () => {
        peerConnectionsRef.current.delete(peerId);
      });

      peerConnectionsRef.current.set(peerId, { peerId, peer });
      return peer;
    } catch (err) {
      const error = new Error(`Failed to create peer connection: ${String(err)}`);
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  // Handle incoming WebRTC offer
  const handleWebRTCOffer = async (data: WebRTCOffer) => {
    try {
      let peer = peerConnectionsRef.current.get(data.from)?.peer;

      if (!peer) {
        peer = await createPeerConnection(data.from, false);
      }

      await peer.signal(data.offer);
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  // Handle incoming WebRTC answer
  const handleWebRTCAnswer = async (data: WebRTCAnswer) => {
    try {
      const peer = peerConnectionsRef.current.get(data.from)?.peer;
      if (peer) {
        await peer.signal(data.answer);
      }
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  };

  // Handle incoming ICE candidate
  const handleICECandidate = async (data: ICECandidateMessage) => {
    try {
      const peer = peerConnectionsRef.current.get(data.from)?.peer;
      if (peer && data.candidate) {
        await peer.signal(data.candidate as any);
      }
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  };

  // Join room and setup Socket.io listeners
  const joinRoom = async () => {
    if (!socket) {
      setError('Socket not connected');
      return;
    }

    try {
      setIsCallActive(true);
      setError(null);

      // Send join room event
      socket.emit('join-room', {
        appointmentId,
        userId,
        userName,
        role,
      });

      // Handle room joined - other participants already there
      socket.on('room-joined', (data: { participants: RoomUser[] }) => {
        setParticipants(data.participants);

        // Create peer connections for existing participants
        data.participants.forEach(async (participant) => {
          if (participant.userId !== userId) {
            try {
              await createPeerConnection(participant.userId, true);
            } catch (err) {
              console.error(`Failed to create peer for ${participant.userId}:`, err);
            }
          }
        });
      });

      // Handle new participant joining
      socket.on('user-joined', (data: RoomUser) => {
        setParticipants((prev) => [...prev, data]);
        onParticipantJoined?.(data);

        // Create peer connection for new participant (they will initiate offer)
      });

      // Handle participant leaving
      socket.on('user-left', (data: { userId: string }) => {
        const peer = peerConnectionsRef.current.get(data.userId);
        if (peer) {
          peer.peer.destroy();
          peerConnectionsRef.current.delete(data.userId);
        }
        setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
        onParticipantLeft?.(data.userId);
      });

      // Handle WebRTC signaling
      socket.on('webrtc-offer', handleWebRTCOffer);
      socket.on('webrtc-answer', handleWebRTCAnswer);
      socket.on('webrtc-ice-candidate', handleICECandidate);
    } catch (err) {
      const error = new Error(`Failed to join room: ${String(err)}`);
      setError(error.message);
      onError?.(error);
      setIsCallActive(false);
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (!socket) return;

    socket.emit('leave-room', {
      appointmentId,
      userId,
    });

    // Close all peer connections
    peerConnectionsRef.current.forEach(({ peer }) => {
      peer.destroy();
    });
    peerConnectionsRef.current.clear();

    // Remove socket listeners
    socket.off('room-joined');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('webrtc-offer', handleWebRTCOffer);
    socket.off('webrtc-answer', handleWebRTCAnswer);
    socket.off('webrtc-ice-candidate', handleICECandidate);

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setIsCallActive(false);
    setParticipants([]);
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isCallActive) {
        leaveRoom();
      }
    };
  }, [isCallActive]);

  return {
    localStream: localStreamRef.current,
    participants,
    isMuted,
    isVideoOff,
    error,
    isCallActive,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
  };
};

export default useWebRTC;
