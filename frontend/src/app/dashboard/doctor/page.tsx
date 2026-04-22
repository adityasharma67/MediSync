'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, Card } from '@/components/ui/index';
import { apiClient } from '@/lib/api';
import { Conversation, IAppointment } from '@/types';
import { useRealtime } from '@/hooks/useRealtime';
import useAuthStore from '@/store/authStore';
import { AlertTriangle, Clock3, MessageSquareMore, Siren } from 'lucide-react';

export default function DoctorDashboard() {
  const user = useAuthStore((state) => state.user);
  const socketRef = useRealtime(user?._id);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getAppointments().then(({ data }) => setAppointments(data));
    apiClient.getConversations().then(({ data }) => setConversations(data));
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('emergency:new-booking', (payload) => {
      setEmergencyAlerts((current) => [payload, ...current]);
    });

    return () => {
      socket.off('emergency:new-booking');
    };
  }, [socketRef]);

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Operations Hub</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitor emergency requests, active appointments, queue-sensitive schedules, and asynchronous patient conversations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-red-100 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                <Siren className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{emergencyAlerts.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-primary-100 p-3 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{appointments.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Async Conversations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{conversations.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Emergency Booking Feed</h2>
              <Button href="/dashboard/messages" variant="outline">Open Messages</Button>
            </div>
            <div className="space-y-4">
              {emergencyAlerts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                  Emergency bookings will appear here in real time and should be prioritized in the doctor workflow.
                </div>
              ) : (
                emergencyAlerts.map((alert, index) => (
                  <div key={`${alert.appointmentId}-${index}`} className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-300">Urgent patient request</p>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          Symptoms: {(alert.symptoms || []).join(', ') || 'Not provided'}
                        </p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Scheduled Queue-Sensitive Slots</h2>
              <div className="space-y-3">
                {appointments.slice(0, 4).map((appointment) => (
                  <div key={appointment._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {appointment.patient.name || 'Patient'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Source: {appointment.source || 'standard'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Conversations</h2>
              <div className="space-y-3">
                {conversations.slice(0, 4).map((conversation) => (
                  <div key={conversation._id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/30">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {conversation.participants.map((participant) => participant.name).join(', ')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {conversation.messages[conversation.messages.length - 1]?.text || 'No messages yet'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
