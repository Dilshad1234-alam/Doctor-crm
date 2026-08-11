"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";
import { User, Phone, Calendar, Users, Activity, ArrowRight } from "lucide-react";

export default function PatientOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "patient") {
        router.push("/dashboard"); // Handled by layout guards
      } else if (user.onboardingCompleted) {
        router.push("/patient/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to setup patient profile");
      }

      await refreshUser();
      router.push("/patient/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#15558d] to-[#2ab5e1] flex items-center justify-center">
        <div className="animate-spin text-white">
          <Activity size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#15558d] to-[#2ab5e1] font-sans relative overflow-hidden pb-12">
      {/* Background abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center relative z-10 px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
              <User strokeWidth={2.5} size={36} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Patient Profile
          </h1>
          <p className="text-lg text-blue-100 font-medium max-w-lg mx-auto">
            Welcome, {user.name}! Please provide a few details to complete your account setup.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-white/20">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              
              {/* Phone */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Date of Birth *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Gender *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="pt-4 mt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:shadow-none"
              >
                <span>{loading ? "Saving..." : "Complete Profile & Open Portal"}</span>
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
