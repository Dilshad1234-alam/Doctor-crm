"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ClipboardList, Activity, ArrowRight, Play, FileSignature, Calendar } from "lucide-react";
import { getMyQueue } from "@/frontend/services/queueApi";
import { getAppointments } from "@/frontend/services/appointmentApi";
import { useAuth } from "@/frontend/context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patientsToday: 0,
    waitingQueue: 0,
    prescriptionsToday: 0,
    followUps: 0,
  });
  const [loading, setLoading] = useState(true);
  const [myQueue, setMyQueue] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);

  useEffect(() => {
    if (user?.doctorId) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const endOfTodayIso = endOfToday.toISOString();

      // Fetch queue
      const queueRes = await getMyQueue().catch(() => []);
      const waiting = Array.isArray(queueRes) ? queueRes.filter(q => q.status === 'waiting') : [];
      setMyQueue(waiting.slice(0, 5)); // show top 5

      // Fetch today's appointments
      const todayApptsRes = await getAppointments({ 
        doctorId: user.doctorId, 
        dateFrom: todayIso, 
        dateTo: endOfTodayIso 
      }).catch(() => ({ appointments: [] }));
      
      const todayAppts = todayApptsRes.appointments || [];

      // Fetch upcoming follow-ups
      const tomorrow = new Date(endOfToday);
      tomorrow.setMilliseconds(tomorrow.getMilliseconds() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const followUpsRes = await getAppointments({
        doctorId: user.doctorId,
        dateFrom: tomorrow.toISOString(),
        dateTo: nextWeek.toISOString(),
        limit: 5,
        sort: "appointmentDate"
      }).catch(() => ({ appointments: [] }));

      const followUps = followUpsRes.appointments || [];
      setUpcomingFollowUps(followUps);

      // Recent patients seen (completed appointments)
      const recentApptsRes = await getAppointments({
        doctorId: user.doctorId,
        status: "completed",
        limit: 5,
        sort: "-appointmentDate"
      }).catch(() => ({ appointments: [] }));

      setRecentPatients(recentApptsRes.appointments || []);

      setStats({
        patientsToday: todayAppts.length,
        waitingQueue: waiting.length,
        prescriptionsToday: todayAppts.filter(a => a.status === 'completed').length, // approximation
        followUps: followUps.length,
      });

    } catch (error) {
      console.error("Failed to load doctor dashboard data", error);
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
        {/* Patients Today */}
        <div className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Patients Today</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.patientsToday}</p>
          </div>
        </div>

        {/* Waiting Queue */}
        <Link href="/dashboard/queue" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#F59E0B] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#F59E0B] group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Waiting Queue</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.waitingQueue}</p>
          </div>
        </Link>

        {/* Prescriptions Today */}
        <div className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <FileSignature className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Rx Today</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.prescriptionsToday}</p>
          </div>
        </div>

        {/* Follow-ups */}
        <Link href="/dashboard/appointments" className="group rounded-2xl bg-white p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:border-[#2563EB] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Follow-ups</h3>
            <p className="text-3xl font-black text-[#0F172A]">{stats.followUps}</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Queue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#F59E0B]" /> My Queue
            </h3>
            <Link href="/dashboard/queue" className="text-sm font-bold text-[#2563EB] hover:underline">View All</Link>
          </div>
          
          <div className="flex-1 space-y-2">
            {myQueue.length > 0 ? myQueue.map((item, idx) => (
              <div key={item._id} className="p-3 rounded-xl border border-transparent bg-[#F8FAFC] hover:bg-white hover:shadow-sm hover:border-[#E2E8F0] transition-all duration-200 flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-[#0F172A] text-sm">{item.patientId?.name || "Unknown Patient"}</h4>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">Token: <span className="font-bold text-[#0F172A]">{item.tokenNumber}</span> • Waiting: {Math.floor((new Date() - new Date(item.joinedAt)) / 60000)} mins</p>
                </div>
                <Link href={`/dashboard/consultations/new?queueId=${item._id}&patientId=${item.patientId?._id}`} className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors">
                  <Play className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-40 text-[#64748B]">
                <ClipboardList className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Queue is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2563EB]" /> Upcoming Follow-ups
            </h3>
            <Link href="/dashboard/appointments" className="text-sm font-bold text-[#2563EB] hover:underline">View Schedule</Link>
          </div>

          <div className="flex-1 space-y-2">
            {upcomingFollowUps.length > 0 ? upcomingFollowUps.map((appt) => (
              <Link key={appt._id} href={`/dashboard/patients/${appt.patientId?._id}?tab=appointments`} className="p-3 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:shadow-sm transition-all duration-200 flex items-center justify-between block group">
                <div>
                  <h4 className="font-bold text-[#0F172A] text-sm">{appt.patientId?.name || appt.patientName}</h4>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">{new Date(appt.appointmentDate).toLocaleDateString()} at {appt.timeSlot}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#2563EB] transition-colors" />
              </Link>
            )) : (
              <div className="flex flex-col items-center justify-center h-40 text-[#64748B]">
                <Calendar className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No follow-ups scheduled soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#0F172A]">Recent Patients</h3>
            <Link href="/dashboard/patients" className="text-sm font-bold text-[#2563EB] hover:underline">Patient Directory</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8FAFC]">
                <tr className="border-b border-[#E2E8F0] text-xs uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-5 font-bold">Patient Name</th>
                  <th className="py-3 px-5 font-bold">Last Visit</th>
                  <th className="py-3 px-5 font-bold">Status</th>
                  <th className="py-3 px-5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentPatients.length > 0 ? recentPatients.map((appt) => (
                  <tr key={appt._id} className="group hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-bold text-[#0F172A] text-sm">{appt.patientId?.name || appt.patientName || "Unknown"}</div>
                      <div className="text-xs text-[#64748B] font-medium mt-0.5">{appt.patientId?.phone || "No contact"}</div>
                    </td>
                    <td className="py-3 px-5 text-[#64748B] text-sm font-medium">
                      {new Date(appt.appointmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#EFF6FF] text-[#2563EB]">
                        Consulted
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link href={`/dashboard/patients/${appt.patientId?._id}?tab=overview`} className="text-sm font-bold text-[#2563EB] hover:underline">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-sm text-[#64748B] font-medium">
                      No recent patients found.
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
