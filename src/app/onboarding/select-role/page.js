"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";
import {
  User, Stethoscope, Building2, Activity,
  CheckCircle2, Calendar, FileText, Heart,
  ClipboardList, Users, BarChart3, ArrowRight,
  Sparkles, Shield, Clock
} from "lucide-react";

/* ─── Role definitions ───────────────────────────────────────── */
const ROLES = [
  {
    id: "patient",
    label: "Patient",
    tagline: "Take control of your health journey",
    icon: User,
    gradient: "from-emerald-400 to-teal-500",
    ringColor: "ring-emerald-400",
    borderActive: "border-emerald-400",
    bgActive: "bg-emerald-50",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    iconBgActive: "bg-emerald-500",
    badgeColor: "bg-emerald-100 text-emerald-700",
    badge: "Most Popular",
    features: [
      { icon: Calendar,   text: "Book appointments instantly" },
      { icon: FileText,   text: "View prescriptions & reports" },
      { icon: Heart,      text: "Manage your health records" },
    ],
  },
  {
    id: "doctor",
    label: "Doctor",
    tagline: "Streamline care, grow your practice",
    icon: Stethoscope,
    gradient: "from-blue-400 to-indigo-500",
    ringColor: "ring-blue-400",
    borderActive: "border-blue-400",
    bgActive: "bg-blue-50",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    iconBgActive: "bg-blue-500",
    badgeColor: "bg-blue-100 text-blue-700",
    badge: "For Clinicians",
    features: [
      { icon: ClipboardList, text: "Manage your daily schedule" },
      { icon: Users,         text: "Consult & track patients" },
      { icon: BarChart3,     text: "Grow your practice" },
    ],
  },
  {
    id: "clinic_owner",
    label: "Clinic Owner",
    tagline: "Run your clinic like a pro",
    icon: Building2,
    gradient: "from-violet-400 to-purple-500",
    ringColor: "ring-violet-400",
    borderActive: "border-violet-400",
    bgActive: "bg-violet-50",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    iconBgActive: "bg-violet-500",
    badgeColor: "bg-violet-100 text-violet-700",
    badge: "Full Control",
    features: [
      { icon: Building2,  text: "Manage your clinic & branches" },
      { icon: Users,      text: "Add doctors & staff" },
      { icon: BarChart3,  text: "Run operations & analytics" },
    ],
  },
];

/* ─── Spinner ────────────────────────────────────────────────── */
function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 tracking-wide">Loading…</p>
      </div>
    </div>
  );
}

/* ─── Progress Dots ──────────────────────────────────────────── */
function ProgressIndicator({ active }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-500 ${
            i === 0
              ? active
                ? "w-8 h-2.5 bg-emerald-500"
                : "w-8 h-2.5 bg-emerald-500"
              : "w-2.5 h-2.5 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Role Card ──────────────────────────────────────────────── */
function RoleCard({ role, selected, loading, onClick }) {
  const Icon = role.icon;
  const isSelected = selected === role.id;
  const isLoading = loading && isSelected;
  const isDisabled = loading && !isSelected;

  return (
    <button
      onClick={() => !loading && onClick(role.id)}
      disabled={isDisabled}
      className={`
        group relative flex flex-col text-left w-full rounded-2xl border-2 p-7
        transition-all duration-300 ease-out shadow-sm
        focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${role.ringColor}
        ${isSelected
          ? `${role.borderActive} ${role.bgActive} shadow-xl scale-[1.025]`
          : "border-slate-200 bg-white hover:-translate-y-1 hover:shadow-lg hover:border-slate-300"
        }
        ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Badge */}
      <span className={`
        absolute top-5 right-5 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide
        ${role.badgeColor}
      `}>
        {role.badge}
      </span>

      {/* Icon */}
      <div className={`
        w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 shadow-sm
        ${isSelected
          ? `${role.iconBgActive} text-white shadow-md`
          : `${role.iconBg} ${role.iconColor} group-hover:${role.iconBgActive} group-hover:text-white`
        }
      `}>
        <Icon size={26} strokeWidth={2.2} />
      </div>

      {/* Title & tagline */}
      <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{role.label}</h2>
      <p className="text-sm text-slate-500 font-medium mb-5 leading-relaxed">{role.tagline}</p>

      {/* Feature list */}
      <ul className="space-y-2.5 mb-7 flex-1">
        {role.features.map(({ icon: FIcon, text }) => (
          <li key={text} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              isSelected ? role.iconBgActive + " text-white" : role.iconBg + " " + role.iconColor
            }`}>
              <FIcon size={11} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-medium text-slate-600">{text}</span>
          </li>
        ))}
      </ul>

      {/* CTA row */}
      <div className={`flex items-center gap-2 text-sm font-bold transition-colors ${
        isSelected ? role.iconColor : "text-slate-400 group-hover:" + role.iconColor
      }`}>
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Setting up…</span>
          </>
        ) : isSelected ? (
          <>
            <CheckCircle2 size={16} strokeWidth={2.5} />
            <span>Selected</span>
          </>
        ) : (
          <>
            <span>Choose {role.label}</span>
            <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </div>
    </button>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function SelectRolePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "unassigned") {
        if (user.onboardingCompleted) {
          router.push(user.role === "patient" ? "/patient/dashboard" : "/dashboard");
        } else {
          router.push(`/onboarding/${user.role === "clinic_owner" ? "clinic" : user.role}`);
        }
      }
    }
  }, [user, authLoading, router]);

  const handleSelect = async (roleId) => {
    try {
      setSelectedRole(roleId);
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/select-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to select role");

      await refreshUser();
      router.push(`/onboarding/${roleId === "clinic_owner" ? "clinic" : roleId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setSelectedRole(null);
    }
  };

  if (authLoading || !mounted || !user || user.role !== "unassigned") {
    return <FullPageSpinner />;
  }

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* ── Subtle top gradient strip ── */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400" />

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow">
            <Activity size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">Clinora</span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
          <Shield size={14} />
          <span>Secure & encrypted</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <Clock size={14} />
          <span>Takes 30 seconds</span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">

        {/* Sparkle badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
          <Sparkles size={13} strokeWidth={2.5} />
          <span>Step 1 of 3 — Account Setup</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-10 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Choose Your Role
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
            Select how you'll use Clinora — we'll personalise your experience based on your role.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 w-full max-w-4xl flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
            <Shield size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
          {ROLES.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              selected={selectedRole}
              loading={loading}
              onClick={handleSelect}
            />
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <ProgressIndicator active={!!selectedRole} />
          <p className="text-xs text-slate-400 font-medium mt-1">
            {selectedRole
              ? `Great choice! Setting up your ${ROLES.find(r => r.id === selectedRole)?.label} account…`
              : "Select a role above to continue"}
          </p>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-5 text-xs text-slate-400 font-medium border-t border-slate-100">
        You can update your preferences later from account settings.
      </footer>
    </div>
  );
}
