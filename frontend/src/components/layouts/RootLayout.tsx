'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Toaster position="top-right" />
    </>
  );
}
