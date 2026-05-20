'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.login(email, password);

      setTokens(response.accessToken, response.refreshToken);
      setUser({
        _id: response._id,
        name: response.name,
        email: response.email,
        role: response.role,
        avatar: response.avatar,
      });

      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="hidden lg:block">
          <div className="surface-panel p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--primary)]">Secure care access</p>
                <h1 className="mt-2 text-4xl font-bold text-[var(--text)]">Welcome back to MediSync</h1>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
                <Stethoscope className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-4">
              {[
                ['Appointments synced', '12 patient touchpoints ready for review'],
                ['Security posture', 'Two-factor and sessions monitored'],
                ['Clinical timeline', 'Reports, prescriptions, and notes connected'],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--primary)]" />
                    <div>
                      <p className="font-semibold text-[var(--text)]">{title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text)]">Sign in</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Access your connected care workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text)]">Email address</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="form-field pl-10"
                  placeholder="name@example.com"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text)]">Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="form-field pl-10"
                  placeholder="Enter your password"
                  required
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-solid flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="font-medium text-[var(--primary)] hover:underline">
              Forgot password?
            </Link>
            <Link href="/signup" className="font-semibold text-[var(--primary)] hover:underline">
              Create account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
