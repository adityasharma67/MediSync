"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowRight, BriefcaseMedical, LockKeyhole, Mail, User, UserRoundCheck, type LucideIcon } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { UserRole } from "@/types";

const roles: { label: string; value: UserRole; icon: LucideIcon }[] = [
  { label: "Patient", value: "patient", icon: User },
  { label: "Doctor", value: "doctor", icon: BriefcaseMedical },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      await signup(name, email, password, role);
      toast.success("Account created successfully");
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Signup failed";
      toast.error(errorMessage);
    }
  };

  return (
    <main className="app-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="surface-panel mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <UserRoundCheck className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Create account</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Choose your role and start managing care.</p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-1">
            {roles.map((item) => {
              const Icon = item.icon;
              const active = role === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value)}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text)]">Full name</span>
              <span className="relative block">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  required
                  className="form-field pl-10"
                  placeholder="Your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isLoading}
                />
              </span>
            </label>

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

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text)]">Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="password"
                  required
                  className="form-field pl-10"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-solid flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </section>

        <section className="hidden lg:block">
          <div className="surface-panel p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold text-[var(--primary)]">Role-aware workspace</p>
              <h2 className="mt-2 text-4xl font-bold leading-tight text-[var(--text)]">
                One account, a calmer healthcare flow.
              </h2>
            </div>
            <div className="grid gap-4">
              {[
                ["Patients", "Book visits, upload reports, message doctors, and view prescriptions."],
                ["Doctors", "Review queues, manage appointments, send prescriptions, and follow analytics."],
                ["Admins", "Track platform health, performance metrics, and operational demand."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                  <p className="font-semibold text-[var(--text)]">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
