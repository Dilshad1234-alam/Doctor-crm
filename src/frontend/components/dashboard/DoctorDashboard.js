"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  BarChart2,
  Globe
} from "lucide-react";
import { getAppointments } from "@/frontend/services/appointmentApi";
import { getMyDoctorProfile, updateDoctorStatus } from "@/frontend/services/doctorApi";
import { useAuth } from "@/frontend/context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patientsToday: 0,
    completedToday: 0,
    earningsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString();
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const endOfTodayIso = endOfToday.toISOString();

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

        const completedToday = todayAppts.filter((a) => a.status === "completed").length;

        setStats({
          patientsToday: todayAppts.length,
          completedToday,
          earningsToday: 0,
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

    if (user?.doctorId) {
      fetchDashboardData();
    }
  }, [user]);

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
      </div>
    );
  }

  const cleanName = user?.name?.replace(/^Dr\.?\s*/i, '') || "Doctor";
  const firstName = cleanName.split(" ")[0];
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
      label: "Manage Website",
      href: "/dashboard/website",
      icon: Globe,
      description: "Edit public profile",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-200",
    },
    {
      label: "View Analytics",
      href: "/dashboard/analytics",
      icon: BarChart2,
      description: "Website & booking stats",
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
}
