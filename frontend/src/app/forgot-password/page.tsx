"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Info, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.forgotPassword({ email });
      setIsSubmitted(true);
      toast.success("Password reset link sent");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send reset email";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel w-full max-w-md p-6 sm:p-8"
      >
        {!isSubmitted ? (
          <>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text)]">Reset password</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">Enter your account email and we will send a reset link.</p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text)]">Email address</span>
                <span className="relative block">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="email"
                    required
                    className="form-field pl-10"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-solid flex w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Check your email</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                We sent a password reset link to <span className="font-semibold text-[var(--text)]">{email}</span>.
              </p>
            </div>

            <div className="mt-6 flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
              <p className="text-sm leading-6 text-[var(--muted)]">The link expires in 30 minutes. Check spam if it does not arrive.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              className="btn-outline mt-5 w-full rounded-lg px-4 py-3 text-sm font-semibold"
            >
              Try another email
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
