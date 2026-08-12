"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Calendar, Activity, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { reportsApi } from "@/frontend/services/reportsApi";
import { getPatients } from "@/frontend/services/patientApi";
import { getDoctors } from "@/frontend/services/doctorApi";
import { getAppointments } from "@/frontend/services/appointmentApi";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    activeDoctors: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [doctorActivity, setDoctorActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const endOfTodayIso = endOfToday.toISOString();

      // Fetch basic stats
      const [patientsRes, doctorsRes, summaryTodayRes] = await Promise.all([
        getPatients({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        getDoctors({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        reportsApi.getReportSummary({ dateFrom: todayIso, dateTo: endOfTodayIso }).catch(() => null)
      ]);

      const totalPatients = patientsRes?.pagination?.total || 0;
      const activeDoctors = doctorsRes?.pagination?.total || 0;
      const todayAppointments = summaryTodayRes?.totalAppointments || 0;
      const todayRevenue = summaryTodayRes?.totalRevenue || 0;

      setStats({
        totalPatients,
        todayAppointments,
        activeDoctors,
        todayRevenue,
      });

      // Fetch recent appointments
      const recentApptsRes = await getAppointments({ limit: 5, sort: "-createdAt" }).catch(() => ({ appointments: [] }));
      setRecentAppointments(recentApptsRes.appointments || []);

      // Fetch doctor performance / activity
      const docActivityRes = await reportsApi.getDoctorReport({ dateFrom: todayIso, dateTo: endOfTodayIso }).catch(() => []);
      setDoctorActivity(Array.isArray(docActivityRes) ? docActivityRes : []);

      // Fake weekly data chart
      setWeeklyData([
        { day: 'Mon', count: Math.floor(Math.random() * 20) },
        { day: 'Tue', count: Math.floor(Math.random() * 20) },
        { day: 'Wed', count: Math.floor(Math.random() * 20) },
        { day: 'Thu', count: Math.floor(Math.random() * 20) },
        { day: 'Fri', count: Math.floor(Math.random() * 20) },
        { day: 'Sat', count: Math.floor(Math.random() * 20) },
        { day: 'Sun', count: Math.floor(Math.random() * 20) },
      ]);

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white border border-[#E2E8F0] rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="h-64 bg-white border border-[#E2E8F0] rounded-2xl"></div>
          <div className="h-64 bg-white border border-[#E2E8F0] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Patients */}
        <Link href="/dashboard/patients" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#2563EB] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              <span>+12%</span>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Total Patients</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.totalPatients}</p>
          </div>
        </Link>

        {/* Today Appointments */}
        <div className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" />
              <span>4 new</span>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Today Appointments</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.todayAppointments}</p>
          </div>
        </div>

        {/* Active Doctors */}
        <Link href="/dashboard/doctors" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#2563EB] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Active Doctors</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.activeDoctors}</p>
          </div>
        </Link>

        {/* Today Revenue */}
        <Link href="/dashboard/billing" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#2563EB] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-md">
              <ArrowDownRight className="w-3 h-3" />
              <span>-2%</span>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Today Revenue</h3>
            <p className="text-3xl font-black text-[#0F172A]">₹{stats.todayRevenue.toLocaleString()}</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <h3 className="text-base font-bold text-[#0F172A] mb-6">Weekly Appointments</h3>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {weeklyData.map((d, i) => {
              const max = Math.max(...weeklyData.map(w => w.count)) || 1;
              const height = (d.count / max) * 100;
              return (
                <div key={i} className="flex flex-col items-center w-full group">
                  <div className="relative w-full flex justify-center h-40 items-end">
                    <div 
                      className="w-full max-w-[2rem] bg-[#EFF6FF] rounded-t-md relative group-hover:bg-[#2563EB] transition-colors"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#0F172A] text-white text-xs py-1 px-2 rounded shadow-md transition-opacity">
                        {d.count}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#64748B] mt-3 font-bold">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0F172A]">Doctor Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {doctorActivity.length > 0 ? doctorActivity.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#E2E8F0] shadow-sm">
                <div>
                  <p className="font-bold text-[#0F172A] text-sm">Dr. {doc.doctorName}</p>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">{doc.appointments} Appointments</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="inline-block px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-bold rounded-md">
                    {doc.completedConsultations} Completed
                  </span>
                  {doc.noShows > 0 && <span className="text-[10px] text-[#EF4444] font-bold mt-1">{doc.noShows} No Shows</span>}
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-32 text-[#64748B]">
                <Activity className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No activity recorded today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#0F172A]">Recent Appointments</h3>
            <Link href="/dashboard/appointments" className="text-sm font-bold text-[#2563EB] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8FAFC]">
                <tr className="border-b border-[#E2E8F0] text-xs uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-5 font-bold">Patient</th>
                  <th className="py-3 px-5 font-bold">Doctor</th>
                  <th className="py-3 px-5 font-bold">Date & Time</th>
                  <th className="py-3 px-5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentAppointments.length > 0 ? recentAppointments.map((appt) => (
                  <tr key={appt._id} className="group hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-5">
                      <Link href={`/dashboard/patients/${appt.patientId?._id}?tab=overview`} className="font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors text-sm">
                        {appt.patientId?.name || appt.patientName || "Unknown"}
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-[#64748B] text-sm font-medium">
                      Dr. {appt.doctorId?.userId?.name || "Unknown"}
                    </td>
                    <td className="py-3 px-5 text-[#64748B] text-sm font-medium">
                      {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.timeSlot}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize
                        ${appt.status === 'scheduled' ? 'bg-[#EFF6FF] text-[#2563EB]' :
                          appt.status === 'completed' ? 'bg-[#EFF6FF] text-[#2563EB]' :
                          appt.status === 'cancelled' ? 'bg-[#FEF2F2] text-[#EF4444]' :
                          'bg-[#F1F5F9] text-[#64748B]'}
                      `}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-sm text-[#64748B] font-medium">
                      No recent appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
