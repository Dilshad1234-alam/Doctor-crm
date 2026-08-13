"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/frontend/services/authApi";
import { useAuth } from "@/frontend/context/AuthContext";
import { ROLES } from "@/backend/utils/permissions";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Activity,
  ShieldCheck, CheckCircle2, Calendar, Stethoscope, Users
} from "lucide-react";

function Toast({ message, type, onClose }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-sm font-bold transition-all ${
      isSuccess
        ? "bg-[#ECFDF5] border-[#10B981] text-[#047857]"
        : "bg-[#FEF2F2] border-[#EF4444] text-[#DC2626]"
    }`}>
      {isSuccess
        ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        : <ShieldCheck className="w-5 h-5 flex-shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

const FEATURE_HIGHLIGHTS = [
  { icon: Stethoscope, label: "Doctor Dashboard" },
  { icon: Calendar, label: "Appointments" },
  { icon: Users, label: "Patient Records" },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Enter a valid email";
    if (!formData.password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setToast({ message: "", type: "" });

    try {
      const response = await loginUser(formData);
      await refreshUser();

      const { user } = response;
      const callbackUrl = searchParams.get("callbackUrl");

      setToast({ message: "Login successful! Redirecting…", type: "success" });

      setTimeout(() => {
        if (callbackUrl) {
          router.push(callbackUrl);
        } else if (user.role === "unassigned") {
          router.push("/onboarding/select-role");
        } else if (user.role === ROLES.CLINIC_OWNER && !user.onboardingCompleted) {
          router.push("/onboarding/clinic");
        } else if (user.role === "doctor" && !user.onboardingCompleted) {
          router.push("/onboarding/doctor");
        } else if (user.role === "patient" && !user.onboardingCompleted) {
          router.push("/onboarding/patient");
        } else if (user.role === "patient" && user.onboardingCompleted) {
          router.push("/patient/dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 900);
    } catch (err) {
      setToast({ message: err.message || "Invalid email or password.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="min-h-screen bg-[#F8FAFC] flex" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ===== LEFT BRANDING PANEL ===== */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#10B981] flex-col justify-between p-12 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-black/10 pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 text-[#10B981]" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Clinora</span>
            </Link>
          </div>

          {/* Center Hero */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-16">

            {/* Illustration card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-10 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <Activity className="w-8 h-8 text-[#10B981]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs text-[#A7F3D0] font-bold uppercase tracking-wider">Clinora Dashboard</p>
                  <p className="text-white font-black text-lg">All in one view</p>
                </div>
              </div>

              <div className="space-y-3">
                {FEATURE_HIGHLIGHTS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                    <Icon className="w-4 h-4 text-[#A7F3D0]" />
                    <span className="text-sm font-bold text-white">{label}</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-[#10B981]" />
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-[#A7F3D0] font-medium">Today's Appointments</span>
                <span className="text-white font-black text-xl">24</span>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              Welcome<br />
              <span className="text-[#A7F3D0]">Back!</span>
            </h2>
            <p className="text-[#6EE7B7] text-base font-medium max-w-xs leading-relaxed">
              Sign in to access your clinic dashboard, manage patients, and view appointments.
            </p>
          </div>

          {/* Bottom badges */}
          <div className="relative z-10 flex items-center gap-4 flex-wrap">
            {["Secure Login", "HIPAA Compliant", "256-bit SSL"].map((badge) => (
              <div key={badge} className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* ===== RIGHT FORM PANEL ===== */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center shadow">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black text-[#0F172A]">Clinora</span>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl border border-[#E2E8F0] p-8 md:p-10">

              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-1">Sign in to Clinora</h1>
                <p className="text-sm text-[#64748B]">
                  Don't have an account?{" "}
                  <Link href="/register" className="font-bold text-[#10B981] hover:underline">Create one free</Link>
                </p>
              </div>



              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                        fieldErrors.email ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]"
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider">
                      Password
                    </label>
                    <Link href="#" className="text-xs font-bold text-[#2563EB] hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`w-full pl-10 pr-11 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
                        fieldErrors.password ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#64748B] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      rememberMe
                        ? "bg-[#2563EB] border-[#2563EB]"
                        : "bg-white border-[#CBD5E1] group-hover:border-[#2563EB]"
                    }`}>
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#64748B]">Remember me for 30 days</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm shadow-lg shadow-[#2563EB]/25 hover:bg-[#1D4ED8] disabled:opacity-70 disabled:cursor-wait transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-[#F1F5F9] text-center">
                <p className="text-xs text-[#94A3B8]">
                  New to Clinora?{" "}
                  <Link href="/register" className="font-bold text-[#0F172A] hover:text-[#10B981] transition-colors">
                    Create a free account
                  </Link>
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-[#94A3B8] flex-wrap">
              {["Secure Login", "HIPAA Compliant", "Privacy Protected"].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
