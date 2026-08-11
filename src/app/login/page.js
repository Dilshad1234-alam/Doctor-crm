"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/frontend/services/authApi";
import { useAuth } from "@/frontend/context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Activity, ArrowLeft } from "lucide-react";
import { ROLES } from "@/backend/utils/permissions";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(formData);
      
      await refreshUser();
      
      const { user } = response;
      if (user.role === "unassigned") {
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
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#15558d] to-[#2ab5e1] font-sans relative overflow-hidden">
      {/* Background abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      </div>
      
      {/* Absolute Top Left Back Button */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-all hover:-translate-x-1 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>
      
      {/* Container - removed justify-center to move it up, added pt-24 */}
      <div className="flex-1 flex flex-col items-center relative z-10 px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-12">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
              <Activity strokeWidth={2.5} size={36} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Welcome Back
          </h1>
          <p className="text-lg text-blue-100 font-medium max-w-md mx-auto">
            Sign in to access your clinic dashboard and manage patients.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-white/20">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" strokeWidth={2} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={2} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:shadow-none"
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </form>

          {/* Footer inside card */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Sign up instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
