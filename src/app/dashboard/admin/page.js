"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, Building2, Stethoscope, Calendar, Activity,
  RefreshCw, TrendingUp, TrendingDown, ClipboardList, ListOrdered, IndianRupee, Server
} from "lucide-react";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";

/* ─── Helpers ────────────────────────────────────────────────── */
function fmt(n) { return (n || 0).toLocaleString("en-IN"); }
function fmtRupee(n) { return "₹" + fmt(n); }

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend, trendLabel, href, sub }) {
  const content = (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={20} className={iconColor} strokeWidth={2.2} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}% {trendLabel || ""}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
          {sub && <p className="text-[11px] text-slate-400 font-medium mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to load dashboard data");
      
      if (data.success) {
        setStats(data.stats);
        setLastRefresh(new Date());
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [fetchData, user]);

  if (user?.role !== "admin") return null;

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100">
        <h3 className="font-bold">Error loading dashboard</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-bold transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Overview</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Admin Control Center • Last updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">Clinics Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Clinics"
          value={fmt(stats?.totalClinics)}
          icon={Building2}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          href="/dashboard/admin/clinics"
        />
        <StatCard
          label="Active Clinics"
          value={fmt(stats?.activeClinics)}
          icon={Activity}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          href="/dashboard/admin/clinics?status=active"
        />
        <StatCard
          label="Pending Approvals"
          value={fmt(stats?.pendingClinics)}
          icon={Server}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          href="/dashboard/admin/clinics?status=pending"
        />
        <StatCard
          label="Suspended Clinics"
          value={fmt(stats?.suspendedClinics)}
          icon={Server}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          href="/dashboard/admin/clinics?status=suspended"
        />
      </div>

      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-8 mb-2">Platform Metrics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Doctors"
          value={fmt(stats?.totalDoctors)}
          icon={Stethoscope}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          href="/dashboard/admin/doctors"
        />
        <StatCard
          label="Total Patients"
          value={fmt(stats?.totalPatients)}
          icon={Users}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          href="/dashboard/admin/patients"
        />
        <StatCard
          label="Total Appointments"
          value={fmt(stats?.totalAppointments)}
          icon={Calendar}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          href="/dashboard/admin/appointments"
          sub={`Today: ${fmt(stats?.todayAppointments)}`}
        />
        <StatCard
          label="Platform Revenue"
          value={fmtRupee(stats?.revenue)}
          icon={IndianRupee}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          href="/dashboard/admin/payments"
          sub="All successful payments"
        />
      </div>
    </div>
  );
}
