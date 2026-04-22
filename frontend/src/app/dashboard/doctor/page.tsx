"use client";

import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([
    { id: 1, patient: "Alice Smith", date: "Oct 25, 2023", time: "10:00 AM", status: "pending" },
    { id: 2, patient: "Bob Johnson", date: "Oct 25, 2023", time: "11:30 AM", status: "confirmed" },
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Doctor Portal</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
          
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="glass p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600">
                    <span className="font-bold">{apt.patient.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{apt.patient}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" /> {apt.date}
                      <Clock className="w-4 h-4 ml-2" /> {apt.time}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {apt.status === 'pending' ? (
                    <>
                      <button className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-lg transition-colors">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-sm font-medium rounded-full">
                      Confirmed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Availability Management */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manage Availability</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Slot</label>
                <select className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500">
                  <option>09:00 AM - 09:30 AM</option>
                  <option>10:00 AM - 10:30 AM</option>
                  <option>11:00 AM - 11:30 AM</option>
                </select>
              </div>
              <button type="button" className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium">
                Add Slot
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
