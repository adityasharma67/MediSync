"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Video, Calendar, ShieldCheck, Activity } from "lucide-react";
import Hero3D from "@/components/3d/Hero3D";

const features = [
  {
    icon: <Video className="w-6 h-6 text-primary-500" />,
    title: "HD Video Consultations",
    description: "Connect with top doctors securely from the comfort of your home via WebRTC.",
  },
  {
    icon: <Calendar className="w-6 h-6 text-primary-500" />,
    title: "Smart Scheduling",
    description: "Book, reschedule, or cancel appointments instantly with our intelligent slot system.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary-500" />,
    title: "Secure & Private",
    description: "End-to-end encrypted medical data, maintaining full compliance and privacy.",
  },
  {
    icon: <Activity className="w-6 h-6 text-primary-500" />,
    title: "AI Symptom Checker",
    description: "Get instant preliminary diagnosis and care suggestions powered by AI.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob dark:opacity-10 dark:bg-primary-900" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000 dark:opacity-10 dark:bg-emerald-900" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000 dark:opacity-10 dark:bg-purple-900" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32">
        <Hero3D />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-auto"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500 mb-6 drop-shadow-sm">
              Healthcare at your fingertips.
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto mb-10">
              Experience the future of telemedicine. Connect with world-class specialists, manage your health, and receive care anywhere, anytime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#features" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-base font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose MediSync?</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Everything you need to manage your health efficiently.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
