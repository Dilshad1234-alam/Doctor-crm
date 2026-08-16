"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/frontend/services/authApi";
import {
  User, Mail, Lock, Eye, EyeOff, Phone, ArrowRight, 
  CheckCircle2, Calendar, FileText, Heart, ShieldCheck, Activity
} from "lucide-react";
import { useAuth } from "@/frontend/context/AuthContext";

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#EF4444" };
  if (score <= 3) return { score, label: "Fair", color: "#F59E0B" };
  if (score <= 4) return { score, label: "Good", color: "#10B981" };
  return { score: 5, label: "Strong", color: "#047857" };
}

function Toast({ message, type, onClose }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-sm font-bold transition-all animate-fade-in ${
      isSuccess ? "bg-[#ECFDF5] border-[#10B981] text-[#047857]" : "bg-[#FEF2F2] border-[#EF4444] text-[#DC2626]"
    }`}>
      {isSuccess ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <ShieldCheck className="w-5 h-5 flex-shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

const BENEFITS = [
  { icon: Calendar, title: "Manage Appointments", desc: "Smart scheduling for patients and clinics" },
  { icon: FileText, title: "Digital Prescriptions", desc: "Paperless prescriptions, always accessible" },
  { icon: Heart, title: "Health Records", desc: "Complete patient history in one place" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Enter a valid email address";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (formData.phone.replace(/\D/g, "").length < 10) errors.phone = "Phone must be at least 10 digits";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!agreed) errors.terms = "You must agree to the Terms & Privacy Policy";
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
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        accountType: "patient"
      });
      if (refreshUser) await refreshUser(); 

      setToast({ message: "Account created! Redirecting to onboarding…", type: "success" });
      setTimeout(() => {
        router.push("/onboarding/patient");
      }, 1500);
    } catch (err) {
      setToast({ message: err.message || "Registration failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

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
          {/* Background circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-black/5 pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 text-[#10B981]" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Clinora</span>
            </Link>
          </div>

          {/* Center Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              Join Clinora<br />
              <span className="text-[#A7F3D0]">Today</span>
            </h2>
            <p className="text-[#6EE7B7] text-lg font-medium mb-12 max-w-xs leading-relaxed">
              The all-in-one platform for modern clinic management and patient care.
            </p>

            <div className="space-y-6">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{title}</p>
                    <p className="text-[#A7F3D0] text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stat chips */}
          <div className="relative z-10 flex items-center gap-4 flex-wrap">
            {["10,000+ Clinics", "50,000+ Patients", "99.9% Uptime"].map((stat) => (
              <div key={stat} className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-white">
                {stat}
              </div>
            ))}
          </div>
        </div>

        {/* ===== RIGHT FORM PANEL ===== */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center shadow">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black text-[#0F172A]">Clinora</span>
          </div>

          <div className="w-full max-w-md">

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-[#E2E8F0] p-8 md:p-10">

              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-1">Create your account</h1>
                <p className="text-sm text-[#64748B]">Already have one? <Link href="/login" className="font-bold text-[#10B981] hover:underline">Sign in here</Link></p>
              </div>

              {/* Google OAuth (UI only) */}
              <button
                type="button"
                onClick={() => setToast({ message: "Google login coming soon!", type: "success" })}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-[#E2E8F0] rounded-xl bg-white text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all mb-6"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative flex items-center mb-6">
                <div className="flex-1 border-t border-[#E2E8F0]" />
                <span className="mx-3 text-xs font-bold text-[#94A3B8] bg-white px-2">or register with email</span>
                <div className="flex-1 border-t border-[#E2E8F0]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Dr. Rohit Kumar"
                      className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all ${
                        fieldErrors.name ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]"
                      }`}
                    />
                  </div>
                  {fieldErrors.name && <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{fieldErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Email Address</label>
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
                      className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all ${
                        fieldErrors.email ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]"
                      }`}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{fieldErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all ${
                        fieldErrors.phone ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]"
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{fieldErrors.phone}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className={`w-full pl-10 pr-11 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all ${
                        fieldErrors.password ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]"
                      }`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#64748B] transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{fieldErrors.password}</p>}

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2.5">
                      <div className="flex gap-1.5 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: i <= strength.score ? strength.color : "#E2E8F0"
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-bold" style={{ color: strength.color }}>
                        {strength.label} password
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      className={`w-full pl-10 pr-11 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all ${
                        fieldErrors.confirmPassword ? "border-[#EF4444] bg-[#FEF2F2]" : 
                        (formData.confirmPassword && formData.confirmPassword === formData.password) ? "border-[#10B981] bg-[#F0FDF4]" :
                        "border-[#E2E8F0]"
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#64748B] transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {formData.confirmPassword && formData.confirmPassword === formData.password && (
                      <div className="absolute inset-y-0 right-8 pr-1 flex items-center pointer-events-none">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      </div>
                    )}
                  </div>
                  {fieldErrors.confirmPassword && <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{fieldErrors.confirmPassword}</p>}
                </div>

                {/* Terms & Privacy Checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => {
                          setAgreed(e.target.checked);
                          if (fieldErrors.terms) setFieldErrors(prev => ({ ...prev, terms: "" }));
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        agreed ? "bg-[#10B981] border-[#10B981]" : "bg-white border-[#CBD5E1] group-hover:border-[#10B981]"
                      }`}>
                        {agreed && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <span className="text-xs text-[#64748B] leading-relaxed">
                      I agree to the{" "}
                      <Link href="#" className="font-bold text-[#2563EB] hover:underline">Terms of Service</Link>
                      {" "}and{" "}
                      <Link href="#" className="font-bold text-[#2563EB] hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                  {fieldErrors.terms && <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{fieldErrors.terms}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#10B981] text-white font-bold text-sm shadow-lg shadow-[#10B981]/25 hover:bg-[#047857] disabled:opacity-70 disabled:cursor-wait transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Divider */}
              <div className="mt-6 pt-6 border-t border-[#F1F5F9] text-center">
                <p className="text-xs text-[#94A3B8]">
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold text-[#0F172A] hover:text-[#10B981] transition-colors">Sign in instead</Link>
                </p>
              </div>

            </div>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-[#94A3B8]">
              {["256-bit Encryption", "HIPAA Compliant", "Privacy Protected"].map((badge) => (
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
