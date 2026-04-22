"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, Calendar, Video, FileText, Settings, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Appointments", href: "/dashboard/appointments", icon: <Calendar className="w-5 h-5" /> },
    { name: "Consultations", href: "/dashboard/consultations", icon: <Video className="w-5 h-5" /> },
    { name: "Prescriptions", href: "/dashboard/prescriptions", icon: <FileText className="w-5 h-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex">
      {/* Sidebar */}
      <div className="w-64 glass border-r border-gray-200 dark:border-gray-800 hidden md:block fixed h-[calc(100vh-4rem)]">
        <div className="p-6 space-y-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Patient Portal</h2>
            <p className="text-sm text-gray-500">Welcome, John Doe</p>
          </div>

          <nav className="space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 font-medium" 
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-6 w-full px-6">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
