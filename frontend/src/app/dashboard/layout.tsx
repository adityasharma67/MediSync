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
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="surface-panel flex flex-col items-center gap-3 px-6 py-5">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <p className="text-sm text-[var(--muted)]">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <>{children}</>
  );
}
