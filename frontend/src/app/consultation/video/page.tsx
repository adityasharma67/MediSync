'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import SimplePeer from 'simple-peer';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessage {
  sender: 'user' | 'doctor';
  text: string;
  timestamp: number;
}

export default function ConsultationPage() {
  const params = useParams();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeVideoCall();
    return () => {
      if (peer) peer.destroy();
    };
  }, []);

  const initializeVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720 },
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const newPeer = new SimplePeer({
        initiator: true,
        trickleIce: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
          ],
        },
      });

      newPeer.on('signal', (data) => {
        console.log('signal', data);
      });

      newPeer.on('connect', () => {
        setIsConnected(true);
        toast.success('Connected with doctor');
      });

      newPeer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
    } catch (error) {
      toast.error('Failed to access camera/microphone');
    }
  };

  const handleEndCall = () => {
    if (peer) peer.destroy();
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    toast.success('Call ended');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      sender: 'user',
      text: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Video Area */}
      <div className="flex-1 grid grid-cols-3 gap-2 p-4">
        {/* Remote Video */}
        <div className="col-span-2 relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white">
            <p className="font-semibold">Doctor Name</p>
            <p className="text-sm text-gray-400">Connected</p>
          </div>
        </div>

        {/* Local Video + Chat */}
        <div className="flex flex-col gap-2">
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden h-40">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>

          {/* Chat */}
          <div className="flex-1 bg-gray-800 rounded-lg p-3 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-sm">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`px-3 py-1 rounded-lg max-w-xs ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    {msg.text}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-6 flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-700' : 'bg-red-600'} text-white`}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsVideoEnabled(!isVideoEnabled)}
          className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-700' : 'bg-red-600'} text-white`}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          <PhoneOff className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}
