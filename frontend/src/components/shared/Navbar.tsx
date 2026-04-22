"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, Bell, LogOut, User, Settings, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "@/store/authStore";
import useNotificationStore from "@/store/notificationStore";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedDark = localStorage.getItem("theme") === "dark";
    const shouldBeDark = savedDark || (prefersDark && !localStorage.getItem("theme"));
    
    if (shouldBeDark) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogout = async () => {
    try {
      await useAuthStore.getState().logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 hover:to-purple-400">
              <span className="text-2xl">⚕️</span> MediSync
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden md:flex items-center gap-8"
          >
            {!user ? (
              <>
                <motion.div variants={itemVariants}>
                  <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium">
                    Home
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium">
                    Features
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link href="/appointments" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium">
                    Appointments
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <motion.div
                key={isDark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </motion.div>
            </motion.button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <motion.div
                    whileHover={{ boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
                    className="w-8 h-8 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <span className="hidden sm:inline text-gray-700 dark:text-gray-300 text-sm font-medium">{user.name}</span>
                </motion.button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <motion.button
                        whileHover={{ backgroundColor: "#fef2f2" }}
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300">
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30">
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden pb-4 space-y-2 border-t border-gray-200 dark:border-gray-800"
            >
              {!user ? (
                <>
                  <Link href="/" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                    Home
                  </Link>
                  <Link href="#features" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                    Features
                  </Link>
                  <Link href="/login" className="block px-4 py-2 text-purple-600 dark:text-purple-400 font-semibold">
                    Login
                  </Link>
                  <Link href="/signup" className="block px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                    Dashboard
                  </Link>
                  <Link href="/appointments" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                    Appointments
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
