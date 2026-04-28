"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { apiClient } from "@/lib/api";

const getRequiredRole = (pathname: string) => {
  if (pathname.startsWith('/dashboard/admin')) {
    return 'admin' as const;
  }

  if (pathname.startsWith('/dashboard/doctor')) {
    return 'doctor' as const;
  }

  return 'patient' as const;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, setUser, logout } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const requiredRole = useMemo(() => getRequiredRole(pathname), [pathname]);

  useEffect(() => {
    let isActive = true;

    const verifyAuth = async () => {
      if (!accessToken) {
        router.replace('/login');
        if (isActive) {
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        let currentUser = user;

        if (!currentUser) {
          const response = await apiClient.getMe();
          currentUser = response.data;

          if (isActive) {
            setUser(currentUser);
          }
        }

        if (currentUser && currentUser.role !== requiredRole) {
          router.replace(`/dashboard/${currentUser.role}`);
          if (isActive) {
            setIsCheckingAuth(false);
          }
          return;
        }

        if (isActive) {
          setIsCheckingAuth(false);
        }
      } catch {
        logout();
        router.replace('/login');
        if (isActive) {
          setIsCheckingAuth(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isActive = false;
    };
  }, [accessToken, logout, pathname, requiredRole, router, setUser, user]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <>{children}</>
  );
}
