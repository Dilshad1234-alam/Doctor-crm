"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  Activity,
  ArrowRight,
  Play,
  FileSignature,
  Calendar,
  Stethoscope,
  DollarSign,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  FileText,
  BarChart2,
  UserCheck,
  ListOrdered,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertCircle,
  Circle,
} from "lucide-react";
import { getMyQueue } from "@/frontend/services/queueApi";
import { getAppointments } from "@/frontend/services/appointmentApi";
import { getMyDoctorProfile, updateDoctorStatus } from "@/frontend/services/doctorApi";
import { useAuth } from "@/frontend/context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patientsToday: 0,
    waitingQueue: 0,
    completedToday: 0,
    earningsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [myQueue, setMyQueue] = useState([]);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

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
      const waiting = Array.isArray(queueRes)
        ? queueRes.filter((q) => q.status === "waiting")
        : [];
      setMyQueue(waiting.slice(0, 5));

      // Fetch today's appointments
      const todayApptsRes = await getAppointments({
        doctorId: user.doctorId,
        dateFrom: todayIso,
        dateTo: endOfTodayIso,
      }).catch(() => ({ appointments: [] }));
      const todayAppts = todayApptsRes.appointments || [];
      setTodaysSchedule(todayAppts.slice(0, 5));

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
        sort: "appointmentDate",
      }).catch(() => ({ appointments: [] }));

      const followUps = followUpsRes.appointments || [];
      setUpcomingFollowUps(followUps);

      // Recent patients seen
      const recentApptsRes = await getAppointments({
        doctorId: user.doctorId,
        status: "completed",
        limit: 5,
        sort: "-appointmentDate",
      }).catch(() => ({ appointments: [] }));
      setRecentPatients(recentApptsRes.appointments || []);

      const completedToday = todayAppts.filter((a) => a.status === "completed").length;

      setStats({
        patientsToday: todayAppts.length,
        waitingQueue: waiting.length,
        completedToday,
        earningsToday: 0, // placeholder — billing API can be wired here
      });

      // Fetch doctor profile for availability status
      const profile = await getMyDoctorProfile().catch(() => null);
      if (profile) {
        setIsAvailable(profile.isActive !== false);
      }
    } catch (error) {
      console.error("Failed to load doctor dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!user?.doctorId) return;
    try {
      setTogglingStatus(true);
      const newStatus = !isAvailable;
      await updateDoctorStatus(user.doctorId, newStatus);
      setIsAvailable(newStatus);
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="h-32 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-gray-100 shadow-sm" />
          <div className="h-72 bg-white rounded-2xl border border-gray-100 shadow-sm" />
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Doctor";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      label: "Today's Appointments",
      value: stats.patientsToday,
      icon: Calendar,
      href: "/dashboard/appointments",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      borderHover: "hover:border-blue-200",
      badge: stats.patientsToday > 0 ? "Active" : null,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      label: "In Queue",
      value: stats.waitingQueue,
      icon: ListOrdered,
      href: "/dashboard/queue",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      borderHover: "hover:border-amber-200",
      badge: stats.waitingQueue > 0 ? "Waiting" : null,
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      label: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle2,
      href: "/dashboard/appointments",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderHover: "hover:border-emerald-200",
      badge: null,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Earnings Today",
      value: `₹${stats.earningsToday}`,
      icon: DollarSign,
      href: "/dashboard/billing",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      borderHover: "hover:border-violet-200",
      badge: null,
      badgeColor: "bg-violet-100 text-violet-700",
    },
  ];

  const quickActions = [
    {
      label: "Start Consultation",
      href: "/dashboard/consultations/new",
      icon: Stethoscope,
      description: "Begin patient visit",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-200",
    },
    {
      label: "Write Prescription",
      href: "/dashboard/prescriptions/new",
      icon: FileSignature,
      description: "New prescription",
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-200",
    },
    {
      label: "View Patients",
      href: "/dashboard/patients",
      icon: Users,
      description: "Patient directory",
      gradient: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-200",
    },
    {
      label: "View Reports",
      href: "/dashboard/reports",
      icon: BarChart2,
      description: "Analytics & reports",
      gradient: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-200",
    },
  ];

  return (
    <div className="space-y-6 pb-12 w-full">

      {/* Hero Welcome Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #10b981 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-44 h-44 bg-white/10 rounded-full" />
        <div className="absolute top-6 right-32 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 left-14 w-32 h-32 bg-emerald-400/20 rounded-full" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span className="text-blue-100 text-sm font-semibold">{greeting}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Dr. {firstName} 👨‍⚕️
            </h1>
            <p className="text-blue-100 mt-1.5 text-sm font-medium">{todayStr}</p>
          </div>

          {/* Availability Toggle */}
          <div className="shrink-0 flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
            <div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-wide">Status</p>
              <p className="text-sm font-black text-white">
                {isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={togglingStatus}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                isAvailable ? "bg-emerald-400" : "bg-white/30"
              } ${togglingStatus ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Toggle availability"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isAvailable ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm ${card.borderHover} hover:shadow-md transition-all duration-200 flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                {card.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  {card.label}
                </p>
                <p className="text-3xl font-black text-slate-800 leading-none">{card.value}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                View details <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`group relative overflow-hidden bg-gradient-to-br ${action.gradient} text-white rounded-2xl p-4 shadow-md ${action.shadow} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
                <div className="relative">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-bold text-sm leading-snug">{action.label}</p>
                  <p className="text-white/70 text-xs mt-0.5 font-medium">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Today's Schedule + Queue Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-slate-800 text-[15px]">Today's Schedule</h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {todaysSchedule.length > 0 ? (
              todaysSchedule.map((appt, idx) => {
                const isCompleted = appt.status === "completed";
                const isScheduled = appt.status === "scheduled";
                return (
                  <div
                    key={appt._id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Time */}
                    <div className="shrink-0 text-center w-16">
                      <p className="text-xs font-black text-slate-700">{appt.timeSlot || "—"}</p>
                    </div>

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {appt.patientId?.name || appt.patientName || "Patient"}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Consultation</p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 capitalize ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : isScheduled
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {appt.status}
                    </span>

                    {/* Action */}
                    {isScheduled && (
                      <Link
                        href={`/dashboard/consultations/new?patientId=${appt.patientId?._id}`}
                        className="shrink-0 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors group-hover:scale-105"
                      >
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
                    )}
                    {isCompleted && (
                      <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Calendar className="w-7 h-7 text-blue-300" />
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">No appointments today</p>
                <p className="text-xs text-slate-400 font-medium">Your schedule is clear</p>
              </div>
            )}
          </div>
        </div>

        {/* Queue Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-bold text-slate-800 text-[15px]">Queue Status</h2>
            </div>
            <Link
              href="/dashboard/queue"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Queue Summary */}
          <div className="px-5 py-3 border-b border-gray-50 bg-amber-50/50">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-amber-700">
                {stats.waitingQueue} patient{stats.waitingQueue !== 1 ? "s" : ""} waiting
              </p>
              <span
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stats.waitingQueue > 3
                    ? "bg-red-100 text-red-600"
                    : stats.waitingQueue > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                <Circle className={`w-1.5 h-1.5 fill-current ${stats.waitingQueue > 3 ? "text-red-500" : stats.waitingQueue > 0 ? "text-amber-500" : "text-emerald-500"} animate-pulse`} />
                {stats.waitingQueue > 3 ? "Busy" : stats.waitingQueue > 0 ? "Active" : "Clear"}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {myQueue.length > 0 ? (
              myQueue.map((item, idx) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-sm hover:border hover:border-amber-100 transition-all duration-200 group border border-transparent"
                >
                  {/* Token badge */}
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-amber-700">#{item.tokenNumber}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {item.patientId?.name || "Unknown"}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {Math.floor((new Date() - new Date(item.joinedAt)) / 60000)} min wait
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/consultations/new?queueId=${item._id}&patientId=${item.patientId?._id}`}
                    className="shrink-0 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-slate-500 mb-0.5">Queue is empty</p>
                <p className="text-xs text-slate-400 font-medium">All patients seen</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Follow-ups + Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-800 text-[15px]">Upcoming Follow-ups</h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              Schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 space-y-2">
            {upcomingFollowUps.length > 0 ? (
              upcomingFollowUps.map((appt) => (
                <Link
                  key={appt._id}
                  href={`/dashboard/patients/${appt.patientId?._id}?tab=appointments`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {appt.patientId?.name || appt.patientName}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {appt.timeSlot ? `at ${appt.timeSlot}` : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-emerald-300" />
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">No follow-ups this week</p>
                <p className="text-xs text-slate-400 font-medium">Schedule is clear ahead</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="font-bold text-slate-800 text-[15px]">Recent Patients</h2>
            </div>
            <Link
              href="/dashboard/patients"
              className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors"
            >
              All Patients <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 space-y-2">
            {recentPatients.length > 0 ? (
              recentPatients.map((appt) => {
                const initials = (appt.patientId?.name || appt.patientName || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <Link
                    key={appt._id}
                    href={`/dashboard/patients/${appt.patientId?._id}?tab=overview`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-violet-700">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {appt.patientId?.name || appt.patientName || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                      Consulted
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-violet-300" />
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">No recent patients</p>
                <p className="text-xs text-slate-400 font-medium">Completed consultations appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
