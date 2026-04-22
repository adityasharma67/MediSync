"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare } from "lucide-react";

export default function ConsultationRoom({ params }: { params: { id: string } }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Boilerplate for WebRTC and Socket.io
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
    //   if (myVideo.current) myVideo.current.srcObject = stream;
    // });
    
    // In a real implementation:
    // 1. Connect to socket.io server
    // 2. Emit 'join-room' with params.id
    // 3. Listen for 'user-connected' to initiate simple-peer
    // 4. Handle signaling (offer/answer/ice candidates) via socket
  }, [params.id]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="glass border-b border-gray-800 p-4 flex justify-between items-center text-white">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Consultation Room: {params.id}
        </h1>
        <span className="text-sm text-gray-400">00:15:32</span>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Remote Video */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden relative border border-gray-700 shadow-2xl">
          <video 
            ref={userVideo} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
            poster="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=crop"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm">
            Dr. Sarah Jenkins
          </div>
        </div>

        {/* Local Video */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden relative border border-gray-700 shadow-2xl md:absolute md:w-64 md:h-48 md:bottom-8 md:right-8 md:z-10">
          <video 
            ref={myVideo} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover mirror" 
            poster="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-xs">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass border-t border-gray-800 p-6 flex justify-center items-center gap-6">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
        
        <button className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-500/30">
          <PhoneOff className="w-6 h-6" />
        </button>

        <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
