"use client";

import { Users, Calendar, DollarSign, Activity } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Users", value: "2,543", icon: <Users className="w-6 h-6" />, color: "primary" },
          { title: "Appointments", value: "1,205", icon: <Calendar className="w-6 h-6" />, color: "emerald" },
          { title: "Revenue", value: "$45,231", icon: <DollarSign className="w-6 h-6" />, color: "purple" },
          { title: "Active Doctors", value: "124", icon: <Activity className="w-6 h-6" />, color: "orange" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-${stat.color}-600 bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Recharts / Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-6 rounded-2xl min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-gray-300 dark:border-gray-700">
          <Activity className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Revenue Analytics Chart</h3>
          <p className="text-gray-500 text-sm">Recharts implementation placeholder</p>
        </div>
        <div className="glass p-6 rounded-2xl min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h3>
          <ul className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <li key={item} className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">New User {item}</p>
                    <p className="text-xs text-gray-500">Patient</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">2h ago</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
