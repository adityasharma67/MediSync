'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: 'patient' | 'doctor' | 'admin';
}

export default function DashboardLayout({ 
  children, 
  requiredRole 
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Check authorization
  if (!user) {
    router.push('/login');
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    router.push('/dashboard');
    return null;
  }

  const menuItems = {
    patient: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Book Appointment', href: '/appointments/book' },
      { label: 'My Appointments', href: '/appointments' },
      { label: 'Prescriptions', href: '/prescriptions' },
      { label: 'AI Symptom Checker', href: '/symptom-checker' },
    ],
    doctor: [
      { label: 'Dashboard', href: '/dashboard/doctor' },
      { label: 'My Appointments', href: '/appointments' },
      { label: 'Create Prescription', href: '/prescriptions/create' },
      { label: 'Availability', href: '/availability' },
    ],
    admin: [
      { label: 'Dashboard', href: '/dashboard/admin' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Appointments', href: '/admin/appointments' },
      { label: 'Analytics', href: '/admin/analytics' },
    ],
  };

  const userMenuItems = menuItems[user.role as keyof typeof menuItems] || [];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">MediSync</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>

        <nav className="p-4 space-y-2">
          {userMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 w-64">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
