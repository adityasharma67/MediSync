import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/shared/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediSync - Scalable Telemedicine & Healthcare Platform',
  description: 'Connect with top healthcare professionals through secure video consultations',
  icons: {
    icon: '⚕️'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Navbar />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
