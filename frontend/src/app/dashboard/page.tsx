'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, Card, Input, LoadingSpinner } from '@/components/ui/index';
import { apiClient } from '@/lib/api';
import { MedicalReport, TimelineItem, IUser } from '@/types';
import { Calendar, FileText, MapPinned, Upload, WandSparkles } from 'lucide-react';

export default function DashboardPage() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [nearbyDoctors, setNearbyDoctors] = useState<IUser[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiClient.getTimeline(), apiClient.getReports()])
      .then(([timelineResponse, reportsResponse]) => {
        setTimeline(timelineResponse.data);
        setReports(reportsResponse.data);
      })
      .catch(() => toast.error('Failed to load dashboard insights'))
      .finally(() => setLoading(false));

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { data } = await apiClient.getNearbyDoctors(position.coords.latitude, position.coords.longitude);
          setNearbyDoctors(data);
        },
        () => undefined
      );
    }
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Timeline Items', value: timeline.length, icon: Calendar },
      { label: 'Medical Reports', value: reports.length, icon: FileText },
      { label: 'Nearby Doctors', value: nearbyDoctors.length, icon: MapPinned },
    ],
    [timeline.length, reports.length, nearbyDoctors.length]
  );

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileData = await file.arrayBuffer();
      const bytes = new Uint8Array(fileData);
      let binary = '';
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      const base64 = btoa(binary);
      const response = await apiClient.analyzeReport({
        title: file.name,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileData: base64,
        ocrText: file.type.startsWith('text/') ? await file.text() : undefined,
      });

      setReports((current) => [response.data, ...current]);
      toast.success('Medical report analyzed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to analyze report');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="patient">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="patient">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Health Timeline Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Track appointments, prescriptions, reports, nearby doctors, and AI-generated report insights in one place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label}>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <p className="text-2xl font-bold text-[var(--text)]">{item.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Chronological Medical History</h2>
                <p className="text-sm text-[var(--muted)]">Appointments, reports, and prescriptions in one timeline.</p>
              </div>
              <Button href="/appointments/book" variant="outline">New Booking</Button>
            </div>
            <div className="space-y-4">
              {timeline.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-[var(--primary)]" />
                  <div>
                    <p className="font-semibold text-[var(--text)]">{item.title}</p>
                    <p className="text-sm capitalize text-[var(--muted)]">{item.type}</p>
                    <p className="text-xs text-[var(--muted)]">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <WandSparkles className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text)]">AI Report Analyzer</h2>
              </div>
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-6 text-center">
                <Upload className="h-6 w-6 text-[var(--muted)]" />
                <span className="text-sm text-[var(--muted)]">
                  Upload a report file and store simple-language insights
                </span>
                <input type="file" className="hidden" onChange={handleUpload} />
                <span className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                  {uploading ? 'Analyzing...' : 'Choose Report'}
                </span>
              </label>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-lg font-semibold text-[var(--text)]">Geo-Based Doctor Finder</h2>
              </div>
              <div className="space-y-3">
                {nearbyDoctors.slice(0, 3).map((doctor) => (
                  <div key={doctor._id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                    <p className="font-semibold text-[var(--text)]">{doctor.name}</p>
                    <p className="text-sm text-[var(--muted)]">{doctor.specialization}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {doctor.doctorProfile?.location?.address || 'Location available in doctor profile'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)]">
                <iframe
                  title="Google map view"
                  src={`https://www.google.com/maps?q=${nearbyDoctors[0]?.doctorProfile?.location?.lat || 28.6139},${nearbyDoctors[0]?.doctorProfile?.location?.lng || 77.209}&z=12&output=embed`}
                  className="h-56 w-full"
                  loading="lazy"
                />
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Latest Report Insights</h2>
              <div className="space-y-3">
                {reports.slice(0, 2).map((report) => (
                  <div key={report._id} className="rounded-lg bg-[var(--surface-strong)] p-4">
                    <p className="font-semibold text-[var(--text)]">{report.title}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{report.plainLanguageSummary}</p>
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
