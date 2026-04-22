'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { Button, Card, LoadingSpinner } from '@/components/ui/index';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { IAppointment } from '@/types';
import { Calendar, Clock, User, MapPin, Video, CheckCircle, XCircle } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await apiClient.getAppointments();
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await apiClient.cancelAppointment(id);
      setAppointments(appointments.filter(a => a._id !== id));
      toast.success('Appointment cancelled');
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    };
    return colors[status] || colors.scheduled;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
        </div>

        {appointments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No appointments yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
                Book your first appointment with a doctor
              </p>
              <Button href="/appointments/book">Book Appointment</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment, index) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                        {appointment.doctor.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {appointment.doctor.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Consultation Appointment
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      {appointment.time}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {appointment.status === 'scheduled' && appointment.meetLink && (
                      <Button className="gap-2 flex-1">
                        <Video className="w-4 h-4" /> Join Call
                      </Button>
                    )}
                    {appointment.status === 'scheduled' && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(appointment._id)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
