"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  HeartPulse,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";

const metrics = [
  { label: "Today visits", value: "128", tone: "text-[var(--primary)]" },
  { label: "Urgent queue", value: "06", tone: "text-[var(--accent)]" },
  { label: "Report reviews", value: "42", tone: "text-[var(--warning)]" },
];

const carePillars = [
  {
    icon: Video,
    title: "Video consults",
    description: "Secure calls, appointment context, and room-aware patient chat in one workflow.",
  },
  {
    icon: FileText,
    title: "Report intelligence",
    description: "Upload clinical files and keep plain-language summaries beside the timeline.",
  },
  {
    icon: CalendarCheck,
    title: "Smart scheduling",
    description: "Book routine visits, emergency slots, and queue-sensitive availability from the same surface.",
  },
  {
    icon: ShieldCheck,
    title: "Care-grade privacy",
    description: "JWT auth, session controls, two-factor setup, and scoped dashboards for each role.",
  },
];

const timeline = [
  { time: "09:00", title: "Follow-up consultation", detail: "Dr. Ahuja with Priya S.", icon: Stethoscope },
  { time: "10:30", title: "Blood report analyzed", detail: "2 risk markers flagged", icon: ClipboardCheck },
  { time: "12:15", title: "Secure message sent", detail: "Prescription clarification", icon: MessageCircle },
];

export default function Home() {
  return (
    <main className="app-shell min-h-screen">
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm font-medium text-[var(--muted)]"
            >
              <HeartPulse className="h-4 w-4 text-[var(--primary)]" />
              Connected care for patients, doctors, and admins
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.55 }}
              className="text-5xl font-bold leading-tight text-[var(--text)] sm:text-6xl lg:text-7xl"
            >
              MediSync
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]"
            >
              A premium telemedicine workspace where appointments, records, prescriptions, video visits, and care conversations stay connected.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
            >
              <Link href="/signup" className="btn-solid inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold">
                Start Care Flow
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-outline inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold">
                Open Workspace
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65 }}
            className="surface-panel mx-auto mt-12 max-w-6xl overflow-hidden p-4 sm:p-5"
          >
            <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="soft-panel p-4 sm:p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--primary)]">Live command center</p>
                    <h2 className="mt-1 text-2xl font-bold text-[var(--text)]">Care operations board</h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--muted)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                    Online
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                      <p className="text-sm text-[var(--muted)]">{metric.label}</p>
                      <p className={`mt-2 text-3xl font-bold ${metric.tone}`}>{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  {timeline.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[var(--text)]">{item.title}</p>
                          <p className="truncate text-sm text-[var(--muted)]">{item.detail}</p>
                        </div>
                        <p className="text-sm font-semibold text-[var(--muted)]">{item.time}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="soft-panel p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text)]">Patient signal</h3>
                        <p className="text-sm text-[var(--muted)]">Vitals and symptom notes</p>
                      </div>
                    </div>
                    <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div className="space-y-3">
                    {["Pulse 78 bpm", "SpO2 98%", "Fever trend stable"].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                          <div
                            className="h-full rounded-full bg-[var(--primary)]"
                            style={{ width: `${72 + index * 8}%` }}
                          />
                        </div>
                        <span className="w-28 text-right text-sm text-[var(--muted)]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="soft-panel p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                      <LockKeyhole className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text)]">Security posture</h3>
                      <p className="text-sm text-[var(--muted)]">2FA ready, active sessions visible</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                      <p className="text-xs uppercase text-[var(--muted)]">Auth</p>
                      <p className="mt-1 font-semibold text-[var(--text)]">JWT live</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                      <p className="text-xs uppercase text-[var(--muted)]">Socket</p>
                      <p className="mt-1 font-semibold text-[var(--text)]">Bound</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--primary)]">Care stack</p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--text)]">Everything patients expect, without the clutter</h2>
          </div>
          <Link href="/appointments/book" className="btn-outline inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
            Book Appointment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {carePillars.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="surface-panel p-5"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
