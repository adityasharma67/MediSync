'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { Button, Input, Card, LoadingSpinner } from '@/components/ui/index';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Calendar, Clock, User, MapPin } from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  avatar?: string;
}

export default function BookAppointmentPage() {
  const user = useAuthStore((state) => state.user);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const availableSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await apiClient.getDoctors();
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please select doctor, date, and time');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.bookAppointment({
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
      });
      toast.success('Appointment booked successfully!');
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="patient">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Book Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Doctor Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Doctor</h2>
            {loadingDoctors ? (
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <motion.button
                    key={doctor._id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDoctor(doctor._id)}
                    className={`p-4 rounded-xl border-2 transition text-left ${
                      selectedDoctor === doctor._id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{doctor.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialization || 'General Practitioner'}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Calendar className="w-5 h-5 inline mr-2" /> Select Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Clock className="w-5 h-5 inline mr-2" /> Select Time
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <motion.button
                  key={slot}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-3 rounded-lg border-2 transition font-medium ${
                    selectedTime === slot
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-primary-300'
                  }`}
                >
                  {slot}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedDoctor && selectedDate && selectedTime && (
            <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Appointment Summary</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><strong>Doctor:</strong> {doctors.find(d => d._id === selectedDoctor)?.name}</li>
                <li><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</li>
                <li><strong>Time:</strong> {selectedTime}</li>
              </ul>
            </Card>
          )}

          <Button type="submit" disabled={isLoading} loading={isLoading} className="w-full" size="lg">
            Confirm Booking
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
