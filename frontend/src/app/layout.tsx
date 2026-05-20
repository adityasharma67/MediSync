import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/shared/Navbar';
import AuthHydrator from '@/components/auth/AuthHydrator';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediSync - Connected Care Workspace',
  description: 'A connected telemedicine workspace for appointments, reports, prescriptions, and secure patient communication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthHydrator />
        <Navbar />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
