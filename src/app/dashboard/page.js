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
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Overview of your clinic operations and daily activities.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        
        {/* Queue Metric */}
        <Link href="/dashboard/queue" className="group rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-teal-100 to-teal-50 rounded-full opacity-60 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between relative z-10 mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Queue</h3>
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          {queueLoading ? (
            <p className="text-4xl font-black text-gray-900 animate-pulse relative z-10">-</p>
          ) : (
            <div className="relative z-10 flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900">{waitingCount}</p>
              <span className="text-sm font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">waiting</span>
            </div>
          )}
        </Link>
        
        {/* Appointments Metric */}
        <Link href="/dashboard/appointments" className="group rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full opacity-60 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between relative z-10 mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Appointments</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600 relative z-10">Manage</p>
        </Link>
        
        {/* Patients Metric */}
        <Link href="/dashboard/patients" className="group rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full opacity-60 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between relative z-10 mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Patients</h3>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-600 relative z-10">Directory</p>
        </Link>

        {user?.role === "clinic_owner" && (
          <Link href="/dashboard/doctors" className="group rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full opacity-60 group-hover:scale-110 transition-transform"></div>
             <div className="flex items-center justify-between relative z-10 mb-4">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Doctors</h3>
               <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
               </div>
             </div>
             <p className="text-3xl font-black text-purple-600 relative z-10">Staff</p>
          </Link>
        )}
      </div>
      
      <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center text-gray-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-10 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-50 rounded-full opacity-50"></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-50 rounded-full opacity-50"></div>
        
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#15558d] to-[#2ab5e1] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 relative z-10">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3 relative z-10 tracking-tight">Welcome to Doctor CRM</h2>
        <p className="text-lg relative z-10">Use the navigation menu or the quick links above to manage your clinic operations.</p>
        <p className="mt-6 text-sm font-medium text-blue-600 bg-blue-50 inline-block px-4 py-2 rounded-full relative z-10">Consultation tracking will be available in the next phase.</p>
      </div>
    </div>
  );
}
