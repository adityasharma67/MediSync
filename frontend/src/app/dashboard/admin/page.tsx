"use client";

import { Activity, Calendar, DollarSign, Users } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const stats = [
  { title: "Total Users", value: "2,543", icon: Users, tone: "bg-[var(--primary-soft)] text-[var(--primary)]" },
  { title: "Appointments", value: "1,205", icon: Calendar, tone: "bg-emerald-100 text-emerald-700" },
  { title: "Revenue", value: "$45,231", icon: DollarSign, tone: "bg-[var(--accent-soft)] text-[var(--accent)]" },
  { title: "Active Doctors", value: "124", icon: Activity, tone: "bg-amber-100 text-amber-700" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout requiredRole="admin">
      <div>
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-[var(--primary)]">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--text)]">Command Center</h1>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.title} className="surface-panel p-5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted)]">{stat.title}</p>
                    <p className="text-2xl font-bold text-[var(--text)]">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="surface-panel flex min-h-[360px] flex-col items-center justify-center border-dashed p-6 text-center lg:col-span-2">
            <Activity className="mb-4 h-14 w-14 text-[var(--muted)]" />
            <h2 className="text-xl font-semibold text-[var(--text)]">Revenue Analytics Chart</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Connect live analytics data to render the operational chart.</p>
          </div>

          <div className="surface-panel min-h-[360px] p-5">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Recent Users</h2>
            <ul className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <li key={item} className="flex items-center justify-between border-b border-[var(--border)] pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[var(--surface-strong)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">New User {item}</p>
                      <p className="text-xs text-[var(--muted)]">Patient</p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--muted)]">2h ago</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
