'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, LoadingSpinner } from '@/components/ui/index';
import { apiClient } from '@/lib/api';
import { AnalyticsDashboard } from '@/types';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);

  useEffect(() => {
    apiClient.getAnalytics().then(({ data }) => setAnalytics(data)).catch(() => setAnalytics(null));
  }, []);

  if (!analytics) {
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Analytics Engine</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track peak booking times, doctor performance, emergency demand, and messaging engagement.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><p className="text-sm text-gray-500">Appointments</p><p className="text-3xl font-bold">{analytics.summary.totalAppointments}</p></Card>
          <Card><p className="text-sm text-gray-500">Completed</p><p className="text-3xl font-bold">{analytics.summary.completedAppointments}</p></Card>
          <Card><p className="text-sm text-gray-500">Emergency</p><p className="text-3xl font-bold">{analytics.summary.emergencyAppointments}</p></Card>
          <Card><p className="text-sm text-gray-500">Conversations</p><p className="text-3xl font-bold">{analytics.summary.conversations}</p></Card>
        </div>

        <Card>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Peak Booking Times</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.peakBookingTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Doctor Performance Snapshot</h2>
          <div className="space-y-3">
            {analytics.doctorPerformance.map((doctor) => (
              <div key={doctor._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{doctor.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialization}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Rating {doctor.doctorProfile?.rating || 0}/5
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {doctor.doctorProfile?.reviewCount || 0} reviews
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
