'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero3D() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-3xl opacity-30"
        animate={{ 
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <motion.div
        className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-bl from-pink-500 to-purple-600 blur-3xl opacity-20"
        animate={{ 
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <motion.div
        className="absolute top-1/3 right-1/4 h-60 w-60 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 blur-3xl opacity-20"
        animate={{ 
          x: [0, -80, 0],
          y: [0, 80, 0],
        }}
        transition={{ 
          duration: 22, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-blue-400"
            initial={{ 
              x: Math.random() * 1000,
              y: Math.random() * 1000,
              opacity: 0
            }}
            animate={{ 
              y: -1000,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 8 + Math.random() * 4, 
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </div>
    </div>
  );
}
