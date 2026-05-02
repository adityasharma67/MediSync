'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import type { ChatMessage } from '@/types';

interface VideoCallRoomProps {
  appointmentId: string;
}

export default function VideoCallRoom({ appointmentId }: VideoCallRoomProps) {
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remoteUserName, setRemoteUserName] = useState('Waiting for participant');

  const { user, isAuthenticated } = useAuthStore();
  const { socket, isConnected } = useSocket({
    userId: user?._id,
    userName: user?.name,
    userRole: user?.role === 'doctor' ? 'doctor' : 'patient',
    autoConnect: !!user,
  });

  const {
    localStream,
    participants,
    isMuted,
    isVideoOff,
    error,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
  } = useWebRTC({
    socket,
    appointmentId,
    userId: user?._id || '',
    userName: user?.name || '',
    role: user?.role === 'doctor' ? 'doctor' : 'patient',
    onLocalStream: (stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    },
    onRemoteStream: (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    },
    onParticipantJoined: (participant) => {
      setRemoteUserName(participant.userName);
    },
    onParticipantLeft: () => {
      setRemoteUserName('Participant left');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!socket || !isConnected || !user) return;

    joinRoom().catch((err) => {
      toast.error(err.message || 'Failed to join call');
    });

    return () => {
      leaveRoom();
    };
  }, [socket, isConnected, user, appointmentId]);

  useEffect(() => {
    if (!socket) return;

    const handleChat = (chatMessage: ChatMessage) => {
      setMessages((prev) => [...prev, chatMessage]);
    };

    socket.on('receive-chat', handleChat);
    return () => {
      socket.off('receive-chat', handleChat);
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!socket || !user || !message.trim()) return;

    socket.emit('send-chat', {
      appointmentId,
      userId: user._id,
      userName: user.name,
      message: message.trim(),
    });

    setMessage('');
  };

  const handleEndCall = () => {
    leaveRoom();
    router.push('/dashboard');
    toast.success('Call ended');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Consultation Room</h1>
          <p className="text-sm text-slate-400">Appointment {appointmentId}</p>
        </div>
        <div className="text-sm text-slate-400">
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {error ? (
        <div className="mx-6 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[60vh]">
          <div className="relative rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-sm backdrop-blur">
              {remoteUserName}
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover scale-x-[-1]"
            />
            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-sm backdrop-blur">
              You
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 flex flex-col min-h-[60vh]">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="font-medium">Live Chat</p>
            <p className="text-xs text-slate-400">Messages are sent in real time</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((item, index) => (
              <div key={`${item.timestamp}-${index}`} className="text-sm">
                <div className="text-xs text-slate-400">{item.senderName}</div>
                <div className="mt-1 rounded-xl bg-white/5 px-3 py-2 text-slate-100">
                  {item.message}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-white/10 p-3 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Type a message"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-slate-500"
            />
            <button
              onClick={handleSendMessage}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-950/90 px-6 py-4 flex items-center justify-center gap-3">
        <button
          onClick={toggleMute}
          className={`rounded-full p-4 ${isMuted ? 'bg-red-600' : 'bg-white/10'} hover:opacity-90`}
          aria-label="Toggle microphone"
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleVideo}
          className={`rounded-full p-4 ${isVideoOff ? 'bg-red-600' : 'bg-white/10'} hover:opacity-90`}
          aria-label="Toggle video"
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>
        <button
          onClick={handleEndCall}
          className="rounded-full bg-red-600 p-4 hover:bg-red-500"
          aria-label="End call"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
