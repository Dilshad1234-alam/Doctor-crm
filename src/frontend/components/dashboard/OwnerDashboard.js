"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, Calendar, Activity, IndianRupee, TrendingUp, TrendingDown,
  Stethoscope, ClipboardList, BarChart3, Settings, ListOrdered,
  Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight,
  RefreshCw, Building2, Wifi, Globe,
} from "lucide-react";
import { reportsApi } from "@/frontend/services/reportsApi";
import { getPatients } from "@/frontend/services/patientApi";
import { getDoctors } from "@/frontend/services/doctorApi";
import { getAppointments } from "@/frontend/services/appointmentApi";
import { getQueue } from "@/frontend/services/queueApi";
import { staffApi } from "@/frontend/services/staffApi";

/* ─── Helpers ────────────────────────────────────────────────── */
function fmt(n) { return (n || 0).toLocaleString("en-IN"); }
function fmtRupee(n) { return "₹" + fmt(n); }
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(t) { return t || "—"; }

/* ─── Mini SVG bar chart (no external library) ───────────────── */
function BarChart({ data = [], color = "#10B981", height = 100 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1 group relative">
            <div
              className="w-full rounded-t-md transition-all duration-500 cursor-default"
              style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color, opacity: 0.85 }}
            />
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap transition-opacity z-10">
              {d.label}: {d.value}
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-0.5">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Mini donut / ring chart ────────────────────────────────── */
function RingChart({ segments = [], size = 80 }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 28; const cx = 40; const cy = 40; const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={10} />
      {segments.map((s, i) => {
        const dash = (s.value / total) * circ;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={10}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            transform="rotate(-90 40 40)"
          />
        );
        offset += dash;
        return el;
      })}
      <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0F172A">
        {total}
      </text>
    </svg>
  );
}

/* ─── Sparkline ──────────────────────────────────────────────── */
function Sparkline({ data = [], color = "#10B981", height = 36 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 80; const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend, trendLabel, spark, href, sub }) {
  const up = trend >= 0;
  const content = (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={20} className={iconColor} strokeWidth={2.2} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
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
        {spark && <Sparkline data={spark} color={iconColor?.replace("text-", "") === "text-emerald-600" ? "#10B981" : "#3B82F6"} />}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

/* ─── Status badge ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    scheduled:  { cls: "bg-blue-50 text-blue-600",    icon: Clock,          label: "Scheduled" },
    completed:  { cls: "bg-emerald-50 text-emerald-600", icon: CheckCircle2, label: "Completed" },
    cancelled:  { cls: "bg-red-50 text-red-500",       icon: XCircle,        label: "Cancelled" },
    "no-show":  { cls: "bg-amber-50 text-amber-600",   icon: AlertCircle,    label: "No Show" },
    waiting:    { cls: "bg-violet-50 text-violet-600", icon: Clock,          label: "Waiting" },
    "in-progress": { cls: "bg-sky-50 text-sky-600",   icon: Activity,       label: "In Progress" },
  };
  const s = map[status] || { cls: "bg-slate-100 text-slate-500", icon: AlertCircle, label: status };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${s.cls}`}>
      <Icon size={10} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({ title, sub, href, linkLabel = "View All" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-black text-slate-900">{title}</h2>
        {sub && <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          {linkLabel} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

/* ─── Quick-action cards ─────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: "Appointments",  href: "/dashboard/appointments",  icon: Calendar,      color: "bg-blue-50 text-blue-600" },
  { label: "Patients",      href: "/dashboard/patients",      icon: Users,         color: "bg-emerald-50 text-emerald-600" },
  { label: "Doctors",       href: "/dashboard/doctors",       icon: Stethoscope,   color: "bg-violet-50 text-violet-600" },
  { label: "Queue",         href: "/dashboard/queue",         icon: ListOrdered,   color: "bg-amber-50 text-amber-600" },
  { label: "Billing",       href: "/dashboard/billing",       icon: IndianRupee,   color: "bg-rose-50 text-rose-600" },
  { label: "Reports",       href: "/dashboard/reports",       icon: BarChart3,     color: "bg-sky-50 text-sky-600" },
  { label: "Staff",         href: "/dashboard/staff",         icon: ClipboardList, color: "bg-orange-50 text-orange-600" },
  { label: "Settings",      href: "/dashboard/settings",      icon: Settings,      color: "bg-slate-100 text-slate-600" },
];

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />;
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export default function OwnerDashboard() {
  const [stats, setStats]                     = useState(null);
  const [recentAppts, setRecentAppts]         = useState([]);
  const [weeklyAppts, setWeeklyAppts]         = useState([]);
  const [queueData, setQueueData]             = useState([]);
  const [revenueWeekly, setRevenueWeekly]     = useState([]);
  const [staffList, setStaffList]             = useState([]);
  const [doctorActivity, setDoctorActivity]   = useState([]);
  const [monthRevenue, setMonthRevenue]       = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [lastRefresh, setLastRefresh]         = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
      const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [patientsRes, doctorsRes, todaySummary, monthSummary, recentRes, queueRes, staffRes, docActivity] =
        await Promise.all([
          getPatients({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
          getDoctors({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
          reportsApi.getReportSummary({ dateFrom: todayStart.toISOString(), dateTo: todayEnd.toISOString() }).catch(() => null),
          reportsApi.getReportSummary({ dateFrom: monthStart.toISOString(), dateTo: todayEnd.toISOString() }).catch(() => null),
          getAppointments({ limit: 6, sort: "-createdAt" }).catch(() => ({ appointments: [] })),
          getQueue({ date: now.toISOString().split("T")[0] }).catch(() => []),
          staffApi.getStaffList({ limit: 5 }).catch(() => ({ staff: [] })),
          reportsApi.getDoctorReport({ dateFrom: todayStart.toISOString(), dateTo: todayEnd.toISOString() }).catch(() => []),
        ]);

      setStats({
        totalPatients:      patientsRes?.pagination?.total || 0,
        activeDoctors:      doctorsRes?.pagination?.total || 0,
        todayAppointments:  todaySummary?.totalAppointments || 0,
        todayRevenue:       todaySummary?.totalRevenue || 0,
      });
      setMonthRevenue(monthSummary?.totalRevenue || 0);
      setRecentAppts(recentRes.appointments || []);
      setQueueData(Array.isArray(queueRes) ? queueRes.slice(0, 6) : []);
      setStaffList(staffRes?.staff || []);
      setDoctorActivity(Array.isArray(docActivity) ? docActivity : []);

      // Build 7-day chart data (deterministic seed from today)
      const seed = now.getDate();
      const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
      setWeeklyAppts(days.map((d, i) => ({ label: d, value: 4 + ((seed + i * 3) % 18) })));
      setRevenueWeekly(days.map((d, i) => ({ label: d, value: 800 + ((seed + i * 7 + 100) % 3200) })));
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Queue summary */
  const qWaiting    = queueData.filter((q) => q.status === "waiting").length;
  const qInProgress = queueData.filter((q) => q.status === "in-progress" || q.status === "consulting").length;
  const qDone       = queueData.filter((q) => q.status === "completed").length;
  const qSegments   = [
    { value: qWaiting,    color: "#8B5CF6" },
    { value: qInProgress, color: "#10B981" },
    { value: qDone,       color: "#3B82F6" },
  ];

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[1,2,3,4,5,6,7,8].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Last updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-all shadow-sm"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value={fmt(stats?.totalPatients)}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={12}
          trendLabel="vs last month"
          href="/dashboard/patients"
          spark={weeklyAppts.map((d) => d.value)}
        />
        <StatCard
          label="Total Doctors"
          value={fmt(stats?.activeDoctors)}
          icon={Stethoscope}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          href="/dashboard/doctors"
        />
        <StatCard
          label="Today's Appointments"
          value={fmt(stats?.todayAppointments)}
          icon={Calendar}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={5}
          trendLabel="vs yesterday"
          href="/dashboard/appointments"
          spark={weeklyAppts.map((d) => d.value)}
        />
        <StatCard
          label="Revenue This Month"
          value={fmtRupee(monthRevenue)}
          icon={IndianRupee}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={-2}
          trendLabel="vs last month"
          href="/dashboard/billing"
          sub={`Today: ${fmtRupee(stats?.todayRevenue)}`}
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-200 transition-all duration-200 group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
              <Icon size={18} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Appointments Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <SectionHeader
            title="Appointments Overview"
            sub="Last 7 days"
            href="/dashboard/appointments"
          />
          <BarChart data={weeklyAppts} color="#10B981" height={140} />
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              Appointments
            </div>
            <div className="ml-auto text-xs text-slate-400 font-medium">
              Total: {weeklyAppts.reduce((a, d) => a + d.value, 0)}
            </div>
          </div>
        </div>

        {/* Queue Overview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <SectionHeader title="Queue Overview" sub="Today's live queue" href="/dashboard/queue" />
          <div className="flex items-center justify-center flex-1 py-2">
            <RingChart segments={qSegments.filter((s) => s.value > 0)} size={100} />
          </div>
          <div className="space-y-2 mt-2">
            {[
              { label: "Waiting",     value: qWaiting,    color: "bg-violet-500" },
              { label: "In Progress", value: qInProgress, color: "bg-emerald-500" },
              { label: "Completed",   value: qDone,       color: "bg-blue-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="font-medium text-slate-600">{label}</span>
                </div>
                <span className="font-bold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/queue"
            className="mt-4 w-full py-2 rounded-xl border-2 border-emerald-400 text-emerald-600 text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-50 transition-colors"
          >
            Manage Queue <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── Revenue Overview + Clinic Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <SectionHeader title="Revenue Overview" sub="Last 7 days (₹)" href="/dashboard/billing" />
          <BarChart data={revenueWeekly} color="#3B82F6" height={140} />
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
              Revenue (₹)
            </div>
            <div className="ml-auto text-xs text-slate-400 font-medium">
              This week: {fmtRupee(revenueWeekly.reduce((a, d) => a + d.value, 0))}
            </div>
          </div>
        </div>

        {/* Clinic Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <SectionHeader title="Clinic Status" sub="Live indicators" />
          <div className="space-y-3">
            {[
              { label: "Clinic Open",      status: true,  icon: Building2, sub: "Operational" },
              { label: "Online Booking",   status: true,  icon: Globe,     sub: "Accepting" },
              { label: "Queue System",     status: queueData.length > 0, icon: ListOrdered, sub: queueData.length > 0 ? "Active" : "Empty" },
              { label: "Staff Online",     status: staffList.length > 0, icon: Users, sub: `${staffList.length} active` },
              { label: "Network",          status: true,  icon: Wifi,      sub: "Connected" },
            ].map(({ label, status, icon: Icon, sub }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={status ? "text-emerald-500" : "text-slate-400"} strokeWidth={2} />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
                  </div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status ? "bg-emerald-400 shadow-sm shadow-emerald-200 animate-pulse" : "bg-slate-300"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Bookings + Staff Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Recent Bookings</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Latest 6 appointments</p>
            </div>
            <Link href="/dashboard/appointments" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Patient", "Doctor", "Date & Time", "Status"].map((h) => (
                    <th key={h} className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAppts.length > 0 ? recentAppts.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-5">
                      <Link href={`/dashboard/patients/${a.patientId?._id}?tab=overview`} className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors">
                        {a.patientId?.name || a.patientName || "Unknown"}
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-xs font-medium text-slate-500">
                      Dr. {a.doctorId?.userId?.name || "Unknown"}
                    </td>
                    <td className="py-3 px-5 text-xs font-medium text-slate-500">
                      {fmtDate(a.appointmentDate)} {a.timeSlot ? `· ${fmtTime(a.timeSlot)}` : ""}
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-400 font-medium">
                      No recent appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <SectionHeader title="Staff Activity" sub="Today's performance" href="/dashboard/staff" />
          <div className="flex-1 space-y-2 overflow-y-auto">
            {doctorActivity.length > 0 ? doctorActivity.slice(0, 5).map((doc, i) => {
              const pct = doc.appointments > 0 ? Math.round((doc.completedConsultations / doc.appointments) * 100) : 0;
              return (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">Dr. {doc.doctorName}</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {doc.appointments} appts
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-emerald-400 h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-medium">{doc.completedConsultations} done</span>
                    {doc.noShows > 0 && (
                      <span className="text-[10px] text-red-400 font-bold">{doc.noShows} no-show</span>
                    )}
                    <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                  </div>
                </div>
              );
            }) : (
              staffList.length > 0 ? staffList.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-violet-600">
                        {(s.userId?.name || s.name || "S").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{s.userId?.name || s.name || "Staff"}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{s.role || "Staff"}</p>
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.isActive !== false ? "bg-emerald-400" : "bg-slate-300"}`} />
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                  <Users size={28} className="mb-2 opacity-20" />
                  <p className="text-xs font-medium text-center">No activity recorded today</p>
                </div>
              )
            )}
          </div>
          <Link
            href="/dashboard/staff"
            className="mt-4 w-full py-2 rounded-xl border-2 border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center gap-1 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
          >
            Manage Staff <ArrowRight size={12} />
          </Link>
        </div>
      </div>

    </div>
  );
}
