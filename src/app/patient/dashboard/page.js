"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Pill, FileText, Activity, Clock, FileSignature, ArrowRight, PlusCircle, CreditCard } from "lucide-react";
import { useAuth } from "@/frontend/context/AuthContext";
import { getAppointments } from "@/frontend/services/appointmentApi";
import { reportsApi } from "@/frontend/services/reportsApi";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    prescriptions: 0,
    reports: 0,
    pendingBills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [upcomingVisit, setUpcomingVisit] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user) {
      if (user.patientId) {
        fetchPatientData();
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      const now = new Date().toISOString();

      // Fetch appointments
      const apptsRes = await getAppointments({ patientId: user.patientId }).catch(() => ({ appointments: [] }));
      const allAppts = apptsRes.appointments || [];
      
      const upcomingAppts = allAppts.filter(a => new Date(a.appointmentDate) >= new Date() && a.status === 'scheduled');
      const pastAppts = allAppts.filter(a => new Date(a.appointmentDate) < new Date() || a.status === 'completed').sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

      setUpcomingVisit(upcomingAppts.length > 0 ? upcomingAppts[0] : null);
      
      setRecentActivity(pastAppts.slice(0, 3));

      setStats({
        upcomingAppointments: upcomingAppts.length,
        prescriptions: pastAppts.filter(a => a.status === 'completed').length,
        reports: 0,
        pendingBills: 0,
      });
      
    } catch (error) {
      console.error("Failed to load patient data", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white border border-[#E2E8F0] rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/patient/book" className="flex items-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-medium text-sm transition-colors shadow-sm">
          <PlusCircle className="w-4 h-4 mr-2" /> Book Appointment
        </Link>
        <Link href="/patient/appointments" className="flex items-center px-4 py-2 bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#0F172A] rounded-xl font-medium text-sm transition-colors shadow-sm">
          <Calendar className="w-4 h-4 mr-2 text-[#64748B]" /> My Appointments
        </Link>
        <Link href="/patient/prescriptions" className="flex items-center px-4 py-2 bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#0F172A] rounded-xl font-medium text-sm transition-colors shadow-sm">
          <Pill className="w-4 h-4 mr-2 text-[#64748B]" /> View Prescriptions
        </Link>
        <Link href="/patient/medical-reports" className="flex items-center px-4 py-2 bg-white border border-[#E2E8F0] hover:border-[#F59E0B] hover:bg-[#FEF3C7] text-[#0F172A] rounded-xl font-medium text-sm transition-colors shadow-sm">
          <FileText className="w-4 h-4 mr-2 text-[#64748B]" /> View Reports
        </Link>
        <Link href="/patient/billing" className="flex items-center px-4 py-2 bg-white border border-[#E2E8F0] hover:border-[#EF4444] hover:bg-[#FEF2F2] text-[#0F172A] rounded-xl font-medium text-sm transition-colors shadow-sm">
          <CreditCard className="w-4 h-4 mr-2 text-[#64748B]" /> Pay Bills
        </Link>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/patient/appointments" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#2563EB] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Upcoming</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.upcomingAppointments}</p>
          </div>
        </Link>
        
        <Link href="/patient/prescriptions" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#2563EB] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <Pill className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Prescriptions</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.prescriptions}</p>
          </div>
        </Link>

        <Link href="/patient/medical-reports" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#F59E0B] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#F59E0B] group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Reports</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.reports}</p>
          </div>
        </Link>

        <Link href="/patient/billing" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#EF4444] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#EF4444] group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Pending Bills</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.pendingBills}</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Visit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#0F172A]">Upcoming Visit</h3>
            <Link href="/patient/appointments" className="text-sm font-bold text-[#2563EB] hover:underline">View All</Link>
          </div>
          {upcomingVisit ? (
             <div className="bg-[#EFF6FF] rounded-xl p-5 border border-[#2563EB]/20 flex-1 flex flex-col justify-center">
               <div className="flex items-start justify-between mb-4">
                 <div>
                   <span className="inline-block px-2.5 py-1 bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold rounded-md mb-3 uppercase tracking-wide">Scheduled</span>
                   <h4 className="font-bold text-[#0F172A] text-lg">Dr. {upcomingVisit.doctorId?.userId?.name || "Doctor"}</h4>
                   <p className="text-[#64748B] font-medium text-sm mt-1">Consultation</p>
                 </div>
                 {upcomingVisit.token && (
                   <div className="bg-white px-3 py-2 rounded-lg border border-[#2563EB]/30 shadow-sm text-center min-w-[70px]">
                     <span className="block text-[10px] uppercase font-bold text-[#64748B] mb-0.5">Token</span>
                     <span className="block font-black text-[#2563EB] text-sm">{upcomingVisit.token}</span>
                   </div>
                 )}
               </div>
               <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm font-bold text-[#0F172A] shadow-sm border border-[#E2E8F0] mt-2">
                 <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-[#64748B]" /> {upcomingVisit.timeSlot}</div>
                   <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-[#64748B]" /> {new Date(upcomingVisit.appointmentDate).toLocaleDateString()}</div>
                 </div>
                 <div className="flex gap-2">
                   <Link href={`/patient/book?doctorId=${upcomingVisit.doctorId?._id || upcomingVisit.doctorId}`} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-white transition-colors">
                     Reschedule
                   </Link>
                 </div>
               </div>
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48 text-[#64748B] border-2 border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
               <Calendar className="w-8 h-8 mb-2 opacity-20" />
               <p className="text-sm text-[#64748B] mb-4 font-medium">No upcoming appointments</p>
               <Link href="/patient/book" className="inline-block bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] font-bold py-2 px-5 rounded-xl transition-colors text-sm shadow-sm">
                 Book Now
               </Link>
             </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#0F172A]">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] shrink-0">
                    {activity.status === 'completed' ? <FileSignature className="w-4 h-4 text-[#2563EB]" /> : <Calendar className="w-4 h-4" />}
                  </div>
                  {idx !== recentActivity.length - 1 && <div className="w-px h-full bg-[#E2E8F0] my-1"></div>}
                </div>
                <div className="pb-4 pt-2">
                  <p className="text-sm font-bold text-[#0F172A]">
                    {activity.status === 'completed' ? 'Completed Visit' : 'Appointment Cancelled'} with Dr. {activity.doctorId?.userId?.name || "Doctor"}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1 font-semibold">{new Date(activity.appointmentDate).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-[#64748B] py-8 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] border-dashed font-medium">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
