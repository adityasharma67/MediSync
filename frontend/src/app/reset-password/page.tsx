"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CheckCircle, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.target.value);
    calculatePasswordStrength(event.target.value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.resetPassword({ token, newPassword, confirmPassword });
      setIsSuccess(true);
      toast.success("Password reset successfully");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const requirements = [
    { label: "At least 8 characters", met: passwordStrength >= 1 },
    { label: "Uppercase and lowercase", met: passwordStrength >= 2 },
    { label: "Contains numbers", met: passwordStrength >= 3 },
    { label: "Special character", met: passwordStrength >= 4 },
  ];

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel w-full max-w-md p-6 sm:p-8"
      >
        {!isSuccess ? (
          <>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text)]">Reset password</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">Create a new password for your MediSync account.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text)]">New password</span>
                <span className="relative block">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type={showPassword1 ? "text" : "password"}
                    required
                    className="form-field pl-10 pr-10"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword1((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--muted)] hover:text-[var(--text)]"
                    aria-label={showPassword1 ? "Hide password" : "Show password"}
                  >
                    {showPassword1 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </span>
              </label>

              {newPassword && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)]">Password strength</span>
                    <span className="font-semibold text-[var(--text)]">{strengthLabels[passwordStrength]}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength / 4) * 100}%` }}
                      className="h-full rounded-full bg-[var(--primary)]"
                    />
                  </div>
                  <div className="mt-3 grid gap-2">
                    {requirements.map((item) => (
                      <div key={item.label} className={`flex items-center gap-2 text-xs ${item.met ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                        <Check className="h-3.5 w-3.5" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text)]">Confirm password</span>
                <span className="relative block">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type={showPassword2 ? "text" : "password"}
                    required
                    className="form-field pl-10 pr-10"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--muted)] hover:text-[var(--text)]"
                    aria-label={showPassword2 ? "Hide password" : "Show password"}
                  >
                    {showPassword2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </span>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-2 text-xs text-[var(--danger)]">Passwords do not match</p>
                )}
              </label>

              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="btn-solid flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Password reset successfully</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Redirecting you to sign in.</p>
            <Loader2 className="mx-auto mt-6 h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        )}
      </motion.section>
    </main>
  );
}
