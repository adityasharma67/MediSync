'use client';

import { ElementType, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import useAuthStore from '@/store/authStore';
import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: 'patient' | 'doctor' | 'admin';
}

type MenuItem = {
  label: string;
  href: string;
  icon: ElementType;
};

const menuItems: Record<'patient' | 'doctor' | 'admin', MenuItem[]> = {
  patient: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Book Appointment', href: '/appointments/book', icon: CalendarDays },
    { label: 'Appointments', href: '/appointments', icon: ClipboardList },
    { label: 'Messages', href: '/dashboard/messages', icon: MessageCircle },
    { label: 'Security', href: '/dashboard/security', icon: ShieldCheck },
    { label: 'Prescriptions', href: '/prescriptions', icon: FileText },
    { label: 'Symptom Checker', href: '/symptom-checker', icon: Sparkles },
  ],
  doctor: [
    { label: 'Doctor Desk', href: '/dashboard/doctor', icon: Stethoscope },
    { label: 'Appointments', href: '/appointments', icon: ClipboardList },
    { label: 'Messages', href: '/dashboard/messages', icon: MessageCircle },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Prescriptions', href: '/prescriptions', icon: FileText },
    { label: 'Book Appointment', href: '/appointments/book', icon: CalendarDays },
  ],
  admin: [
    { label: 'Command Center', href: '/dashboard/admin', icon: Activity },
    { label: 'All Appointments', href: '/appointments', icon: ClipboardList },
    { label: 'Messages', href: '/dashboard/messages', icon: MessageCircle },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ],
};

export default function DashboardLayout({
  children,
  requiredRole,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [requiredRole, router, user]);

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  const userMenuItems = menuItems[user.role as keyof typeof menuItems] || [];

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="sticky top-[5.5rem] hidden h-[calc(100vh-7rem)] w-72 shrink-0 flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft lg:flex">
          <div className="mb-5 rounded-lg bg-[var(--surface-strong)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--text)]">{user.name}</p>
                <p className="text-sm capitalize text-[var(--muted)]">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {userMenuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    active
                      ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--accent-soft)]"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 lg:hidden">
            {userMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-2 rounded-md bg-[var(--surface-strong)] px-3 py-2 text-sm font-medium text-[var(--text)]"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
