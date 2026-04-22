'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, Card, Input } from '@/components/ui/index';
import { apiClient } from '@/lib/api';
import { SecuritySession } from '@/types';
import { ShieldCheck, Smartphone } from 'lucide-react';

export default function SecurityPage() {
  const [secret, setSecret] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [code, setCode] = useState('');
  const [sessions, setSessions] = useState<SecuritySession[]>([]);

  useEffect(() => {
    apiClient.getSessions().then(({ data }) => setSessions(data)).catch(() => undefined);
  }, []);

  const handleSetup2FA = async () => {
    const { data } = await apiClient.setupTwoFactor();
    setSecret(data.secret);
    setOtpPreview(data.otpPreview);
    toast.success('2FA secret generated');
  };

  const handleEnable2FA = async () => {
    await apiClient.enableTwoFactor(code);
    toast.success('Two-factor authentication enabled');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Upgrade Center</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage 2FA, review known devices, and verify session tracking and login alert readiness.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
            </div>
            <div className="space-y-4">
              <Button onClick={handleSetup2FA}>Generate 2FA Secret</Button>
              {secret && (
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/30">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Secret</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">{secret}</p>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Verification preview code</p>
                  <p className="text-2xl font-bold text-primary-600">{otpPreview}</p>
                </div>
              )}
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter verification code" />
              <Button onClick={handleEnable2FA} variant="outline">Enable 2FA</Button>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tracked Devices & Sessions</h2>
            </div>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.deviceId} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-white">{session.userAgent || 'Unknown device'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Device ID: {session.deviceId}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Last seen {new Date(session.lastSeenAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
