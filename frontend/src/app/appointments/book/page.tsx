'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { Button, Card, Input, LoadingSpinner } from '@/components/ui/index';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DoctorRecommendation, IUser, QueueEntryStatus } from '@/types';
import { AlertTriangle, Calendar, Clock, MapPin, Sparkles, Stethoscope } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';

export default function BookAppointmentPage() {
  const user = useAuthStore((state) => state.user);
  const socketRef = useRealtime(user?._id);
  const [doctors, setDoctors] = useState<IUser[]>([]);
  const [recommendations, setRecommendations] = useState<DoctorRecommendation[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [queueStatus, setQueueStatus] = useState<QueueEntryStatus | null>(null);
  const [joinWaitlist, setJoinWaitlist] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const symptoms = useMemo(
    () => symptomInput.split(',').map((item) => item.trim()).filter(Boolean),
    [symptomInput]
  );

  const availableSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (symptoms.length) {
      apiClient.recommendDoctors(symptoms).then(({ data }) => setRecommendations(data)).catch(() => undefined);
    } else {
      setRecommendations([]);
    }
  }, [symptoms]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('queue:position', (payload) => {
      if (queueStatus?.entry?._id === payload.queueEntryId) {
        setQueueStatus((current) =>
          current
            ? {
                ...current,
                position: payload.position,
                totalWaiting: payload.totalWaiting,
              }
            : current
        );
      }
    });

    socket.on('queue:assigned', (payload) => {
      if (queueStatus?.entry?._id === payload.queueEntryId) {
        toast.success('A cancelled slot was assigned to you automatically.');
        setQueueStatus(null);
      }
    });

    return () => {
      socket.off('queue:position');
      socket.off('queue:assigned');
    };
  }, [queueStatus?.entry?._id, socketRef]);

  useEffect(() => {
    if (socketRef.current && selectedDoctor && selectedDate && selectedTime) {
      socketRef.current.emit('queue:watch-slot', {
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
      });
    }
  }, [selectedDoctor, selectedDate, selectedTime, socketRef]);

  const fetchDoctors = async () => {
    try {
      const { data } = await apiClient.getDoctors();
      setDoctors(data);
    } catch {
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
      const response = await apiClient.bookAppointment({
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        symptoms,
        joinWaitlist,
      });

      const payload = response.data as any;
      if (payload.joinedWaitlist) {
        setQueueStatus(payload.queue);
        toast.success(payload.message);
      } else {
        toast.success('Appointment booked successfully');
        setQueueStatus(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyBooking = async () => {
    if (!symptoms.length) {
      toast.error('Add symptoms before requesting emergency booking');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.bookEmergencyAppointment({ symptoms });
      toast.success('Emergency booking requested and doctors notified');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Emergency booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="patient">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Appointment Booking</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Get doctor recommendations, join the live waitlist when slots are full, or trigger emergency booking.
            </p>
          </div>
          <Button variant="danger" onClick={handleEmergencyBooking} disabled={isLoading} className="lg:w-auto">
            <AlertTriangle className="h-4 w-4" />
            Emergency Booking
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <div className="grid gap-4">
                <Input
                  label="Symptoms"
                  placeholder="fever, headache, cough"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                />
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={joinWaitlist}
                    onChange={(e) => setJoinWaitlist(e.target.checked)}
                  />
                  Join waiting queue automatically if the slot is full
                </label>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Choose Doctor</h2>
              {loadingDoctors ? (
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {doctors.map((doctor) => (
                    <motion.button
                      key={doctor._id}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedDoctor(doctor._id)}
                      className={`rounded-2xl border-2 p-4 text-left transition ${
                        selectedDoctor === doctor._id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 hover:border-primary-300 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-emerald-400 font-bold text-white">
                          {doctor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{doctor.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {doctor.specialization || 'General Physician'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Rating {doctor.doctorProfile?.rating || 0}/5
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  type="date"
                  label="Select Date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                          selectedTime === slot
                            ? 'border-primary-500 bg-primary-600 text-white'
                            : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Button type="submit" loading={isLoading} className="w-full" size="lg">
              Confirm Booking
            </Button>
          </form>

          <div className="space-y-6">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Doctors</h2>
              </div>
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add symptoms to get smart recommendations based on specialization, ratings, and availability.
                  </p>
                ) : (
                  recommendations.map((item) => (
                    <div key={item.doctor._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.doctor.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.doctor.specialization || 'General Physician'}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                          Score {item.score}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {item.reasons.map((reason) => (
                          <p key={reason}>{reason}</p>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Queue Status</h2>
              </div>
              {queueStatus ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/10">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current position</p>
                    <p className="text-4xl font-bold text-amber-600">{queueStatus.position}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {queueStatus.totalWaiting} total patients waiting for this slot
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Queue updates arrive in real time through Socket.io. You will be assigned automatically if someone cancels.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No active queue entry yet. If a slot is full, enable waitlist and submit the booking form.
                </p>
              )}
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nearby Doctors</h2>
              </div>
              <Button href="/dashboard" variant="outline" className="w-full">
                Open Geo-Based Finder
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
