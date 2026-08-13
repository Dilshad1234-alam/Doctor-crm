"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Pill,
  FileText,
  Activity,
  Clock,
  ArrowRight,
  PlusCircle,
  CreditCard,
  CalendarPlus,
  Eye,
  Receipt,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/frontend/context/AuthContext";
import { getAppointments } from "@/frontend/services/appointmentApi";

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

      const apptsRes = await getAppointments({ patientId: user.patientId }).catch(() => ({
        appointments: [],
      }));
      const allAppts = apptsRes.appointments || [];

      const upcomingAppts = allAppts
        .filter((a) => new Date(a.appointmentDate) >= new Date() && a.status === "scheduled")
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

      const pastAppts = allAppts
        .filter((a) => new Date(a.appointmentDate) < new Date() || a.status === "completed")
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

      setUpcomingVisit(upcomingAppts.length > 0 ? upcomingAppts[0] : null);
      setRecentActivity(pastAppts.slice(0, 4));

      setStats({
        upcomingAppointments: upcomingAppts.length,
        prescriptions: pastAppts.filter((a) => a.status === "completed").length,
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
      <div className="space-y-6 animate-pulse p-1">
        <div className="h-32 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-2xl border border-gray-100 shadow-sm" />
          <div className="h-64 bg-white rounded-2xl border border-gray-100 shadow-sm" />
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Patient";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      label: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      icon: Calendar,
      href: "/patient/appointments",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      badge: stats.upcomingAppointments > 0 ? "Active" : null,
      badgeColor: "bg-blue-100 text-blue-700",
      borderHover: "hover:border-blue-200",
    },
    {
      label: "Prescriptions",
      value: stats.prescriptions,
      icon: Pill,
      href: "/patient/prescriptions",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      badge: null,
      badgeColor: "bg-emerald-100 text-emerald-700",
      borderHover: "hover:border-emerald-200",
    },
    {
      label: "Medical Reports",
      value: stats.reports,
      icon: FileText,
      href: "/patient/medical-reports",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      badge: null,
      badgeColor: "bg-violet-100 text-violet-700",
      borderHover: "hover:border-violet-200",
    },
    {
      label: "Pending Bills",
      value: stats.pendingBills,
      icon: CreditCard,
      href: "/patient/billing",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      badge: stats.pendingBills > 0 ? "Due" : null,
      badgeColor: "bg-amber-100 text-amber-700",
      borderHover: "hover:border-amber-200",
    },
  ];

  const quickActions = [
    {
      label: "Book Appointment",
      href: "/patient/book",
      icon: CalendarPlus,
      description: "Schedule a new visit",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-200",
    },
    {
      label: "View Prescriptions",
      href: "/patient/prescriptions",
      icon: Pill,
      description: "See your medications",
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-200",
    },
    {
      label: "View Reports",
      href: "/patient/medical-reports",
      icon: Eye,
      description: "Access lab results",
      gradient: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-200",
    },
    {
      label: "Pay Bills",
      href: "/patient/billing",
      icon: Receipt,
      description: "Manage payments",
      gradient: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-200",
    },
  ];

  return (
    <div className="space-y-6 w-full pb-12">

      {/* Hero Welcome Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 40%, #2563eb 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-28 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 right-14 w-32 h-32 bg-blue-400/20 rounded-full" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span className="text-emerald-100 text-sm font-semibold">{greeting}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-emerald-100 mt-1.5 text-sm md:text-base font-medium">
              {upcomingVisit
                ? `You have an appointment on ${new Date(upcomingVisit.appointmentDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.`
                : "No upcoming appointments. Book one today!"}
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/patient/book"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-sm px-5 py-2.5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              Book Appointment
            </Link>
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
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
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
                <p className="text-3xl font-black text-slate-800 leading-none">
                  {card.value}
                </p>
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

      {/* Bottom Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Visit */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-slate-800 text-[15px]">Upcoming Visit</h2>
            </div>
            <Link
              href="/patient/appointments"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5">
            {upcomingVisit ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full mb-2">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        SCHEDULED
                      </span>
                      <h3 className="font-black text-slate-800 text-lg leading-tight">
                        Dr. {upcomingVisit.doctorId?.userId?.name || "Doctor"}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium mt-0.5">General Consultation</p>
                    </div>
                    {upcomingVisit.token && (
                      <div className="bg-white px-3.5 py-2.5 rounded-xl border border-blue-100 shadow-sm text-center min-w-[60px]">
                        <span className="block text-[9px] uppercase font-black text-slate-400 mb-0.5 tracking-wider">Token</span>
                        <span className="block font-black text-blue-600 text-lg leading-none">{upcomingVisit.token}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/80 rounded-xl p-3.5 border border-blue-100/80 mb-3">
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                        {upcomingVisit.timeSlot}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                        {new Date(upcomingVisit.appointmentDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/patient/book?doctorId=${upcomingVisit.doctorId?._id || upcomingVisit.doctorId}`}
                      className="flex-1 text-center text-xs font-bold px-3 py-2 rounded-xl border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Reschedule
                    </Link>
                    <Link
                      href="/patient/appointments"
                      className="flex-1 text-center text-xs font-bold px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Calendar className="w-7 h-7 text-blue-300" />
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">No Upcoming Appointments</p>
                <p className="text-xs text-slate-400 font-medium mb-5">
                  Schedule a visit with a doctor
                </p>
                <Link
                  href="/patient/book"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-100"
                >
                  <PlusCircle className="w-4 h-4" /> Book Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-800 text-[15px]">Recent Activity</h2>
            </div>
            <Link
              href="/patient/appointments"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4">
            {recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((activity, idx) => {
                  const isCompleted = activity.status === "completed";
                  const isCancelled = activity.status === "cancelled";
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-emerald-50"
                            : isCancelled
                            ? "bg-red-50"
                            : "bg-slate-50"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : isCancelled ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {isCompleted
                            ? "Completed visit"
                            : isCancelled
                            ? "Appointment cancelled"
                            : "Appointment"}{" "}
                          <span className="text-slate-500 font-semibold">
                            with Dr. {activity.doctorId?.userId?.name || "Doctor"}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                          {new Date(activity.appointmentDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 capitalize ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : isCancelled
                            ? "bg-red-100 text-red-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-emerald-300" />
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">No Recent Activity</p>
                <p className="text-xs text-slate-400 font-medium">
                  Your past appointments will appear here
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
