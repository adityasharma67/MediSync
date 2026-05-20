"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ElementType } from "react";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Settings,
  ShieldCheck,
  Stethoscope,
  SunMedium,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import useNotificationStore from "@/store/notificationStore";

type ThemeName = "clinical" | "midnight" | "sunrise";
type NavLink = { label: string; href: string; icon?: ElementType };

const themes: { name: ThemeName; label: string; icon: ElementType; swatch: string }[] = [
  { name: "clinical", label: "Clinical theme", icon: Stethoscope, swatch: "bg-teal-600" },
  { name: "midnight", label: "Night theme", icon: Moon, swatch: "bg-zinc-900" },
  { name: "sunrise", label: "Warm theme", icon: SunMedium, swatch: "bg-orange-500" },
];

const publicLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Appointments", href: "/appointments/book" },
  { label: "Symptom Check", href: "/symptom-checker" },
];

const authedLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Messages", href: "/dashboard/messages", icon: MessageCircle },
  { label: "Security", href: "/dashboard/security", icon: ShieldCheck },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeName>("clinical");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    const saved = localStorage.getItem("medisync-theme") as ThemeName | null;
    const nextTheme = saved && themes.some((item) => item.name === saved) ? saved : "clinical";
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "midnight");
    localStorage.setItem("medisync-theme", theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } finally {
      setShowProfileMenu(false);
      setIsOpen(false);
    }
  };

  const links = user ? authedLinks : publicLinks;

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold text-[var(--text)]">
          <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="text-xl">MediSync</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 sm:flex">
            {themes.map((item) => {
              const Icon = item.icon;
              const selected = theme === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => setTheme(item.name)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                    selected ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {user && (
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
              onClick={() => router.push("/dashboard/messages")}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setShowProfileMenu((value) => !value)}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm font-medium text-[var(--text)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-28 truncate">{user.name}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="surface-panel absolute right-0 mt-2 w-52 p-2"
                  >
                    <Link href="/profile" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--accent-soft)]"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)]">
                Login
              </Link>
              <Link href="/signup" className="btn-solid rounded-lg px-4 py-2 text-sm font-semibold">
                Sign Up
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text)] hover:bg-[var(--surface-strong)] md:hidden"
            aria-label="Open menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden"
          >
            <div className="space-y-1">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-2 px-3 py-2">
                {themes.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setTheme(item.name)}
                    className={`h-7 w-7 rounded-full border-2 ${item.swatch} ${theme === item.name ? "border-[var(--text)]" : "border-transparent"}`}
                    aria-label={item.label}
                    title={item.label}
                  />
                ))}
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[var(--danger)] hover:bg-[var(--accent-soft)]"
                >
                  Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-3 pt-2">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="btn-outline rounded-lg px-3 py-2 text-center text-sm font-semibold">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="btn-solid rounded-lg px-3 py-2 text-center text-sm font-semibold">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
