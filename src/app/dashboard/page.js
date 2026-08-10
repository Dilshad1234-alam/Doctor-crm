"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Link from "next/link";
import { useAuth } from "@/frontend/context/AuthContext";
import { getQueue, getMyQueue } from "@/frontend/services/queueApi";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [waitingCount, setWaitingCount] = useState(0);
  const [queueLoading, setQueueLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        let queueData = [];
        if (user?.role === "doctor") {
          queueData = await getMyQueue();
        } else if (user?.role === "clinic_owner" || user?.role === "receptionist") {
          queueData = await getQueue();
        }
        
        // Count active waiting patients
        const waiting = queueData.filter(q => q.status === "waiting");
        setWaitingCount(waiting.length);
      } catch (err) {
        console.error("Failed to load queue summary for dashboard", err);
      } finally {
        setQueueLoading(false);
      }
    };
    
    if (user) {
      fetchQueue();
    }
  }, [user]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your clinic and activities." />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        
        {/* Queue Metric */}
        <Link href="/dashboard/queue" className="rounded-lg border border-teal-200 bg-teal-50 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-100 rounded-full opacity-50 pointer-events-none"></div>
          <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider relative z-10">Queue</h3>
          {queueLoading ? (
            <p className="mt-2 text-3xl font-bold text-teal-600 animate-pulse relative z-10">-</p>
          ) : (
            <p className="mt-2 text-3xl font-bold text-teal-600 relative z-10">
              {waitingCount} <span className="text-lg font-medium opacity-80">waiting</span>
            </p>
          )}
        </Link>
        
        <Link href="/dashboard/appointments" className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 pointer-events-none"></div>
          <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider relative z-10">Appointments</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600 relative z-10">Manage</p>
        </Link>
        
        <Link href="/dashboard/patients" className="rounded-lg border border-indigo-200 bg-indigo-50 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 pointer-events-none"></div>
          <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider relative z-10">Patients</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600 relative z-10">Directory</p>
        </Link>

        {user?.role === "clinic_owner" && (
          <Link href="/dashboard/doctors" className="rounded-lg border border-purple-200 bg-purple-50 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100 rounded-full opacity-50 pointer-events-none"></div>
             <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wider relative z-10">Doctors</h3>
             <p className="mt-2 text-3xl font-bold text-purple-600 relative z-10">Staff</p>
          </Link>
        )}
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 shadow-sm mt-8">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Welcome to Doctor CRM</h2>
        <p>Use the navigation menu or the quick links above to manage your clinic operations.</p>
        <p className="mt-4 text-sm text-gray-400">Consultation tracking will be available in the next phase.</p>
      </div>
    </div>
  );
}
