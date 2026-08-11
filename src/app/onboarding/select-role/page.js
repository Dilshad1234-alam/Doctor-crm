"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";
import { Stethoscope, User, Building2, ArrowRight, Activity } from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "unassigned") {
        // User already has a role, redirect to their specific onboarding or dashboard
        if (user.onboardingCompleted) {
          router.push(user.role === "patient" ? "/patient/dashboard" : "/dashboard");
        } else {
          router.push(`/onboarding/${user.role === "clinic_owner" ? "clinic" : user.role}`);
        }
      }
    }
  }, [user, authLoading, router]);

  const handleRoleSelection = async (role) => {
    try {
      setSelectedRole(role);
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/select-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to select role");
      }

      await refreshUser();
      router.push(`/onboarding/${role === "clinic_owner" ? "clinic" : role}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setSelectedRole(null);
    }
  };

  if (authLoading || !user || user.role !== "unassigned") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#15558d] to-[#2ab5e1] flex items-center justify-center">
        <div className="animate-spin text-white">
          <Activity size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#15558d] to-[#2ab5e1] font-sans relative overflow-hidden">
      {/* Background abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            How would you like to use Doctor CRM?
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl mx-auto">
            Choose the option that best describes you to customize your experience.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl max-w-4xl w-full">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Role Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full">
          
          {/* Doctor Card */}
          <button
            onClick={() => handleRoleSelection("doctor")}
            disabled={loading}
            className={`group flex flex-col items-start p-8 rounded-[2rem] bg-white border-2 text-left transition-all duration-300 shadow-2xl shadow-blue-900/20 ${
              selectedRole === "doctor" ? "border-blue-500 scale-105" : "border-white/20 hover:border-blue-300 hover:-translate-y-2"
            } disabled:opacity-70 disabled:hover:transform-none`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-colors ${
              selectedRole === "doctor" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            }`}>
              <Stethoscope strokeWidth={2.5} size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Doctor</h2>
            <p className="text-gray-600 mb-8 flex-1 font-medium leading-relaxed">
              Manage patients, consultations, prescriptions, and your daily clinic workflow.
            </p>
            <div className="mt-auto flex items-center text-blue-600 font-bold group-hover:text-blue-700">
              {loading && selectedRole === "doctor" ? "Setting up..." : "Continue as Doctor"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Patient Card */}
          <button
            onClick={() => handleRoleSelection("patient")}
            disabled={loading}
            className={`group flex flex-col items-start p-8 rounded-[2rem] bg-white border-2 text-left transition-all duration-300 shadow-2xl shadow-blue-900/20 ${
              selectedRole === "patient" ? "border-blue-500 scale-105" : "border-white/20 hover:border-blue-300 hover:-translate-y-2"
            } disabled:opacity-70 disabled:hover:transform-none`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-colors ${
              selectedRole === "patient" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            }`}>
              <User strokeWidth={2.5} size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Patient</h2>
            <p className="text-gray-600 mb-8 flex-1 font-medium leading-relaxed">
              Book appointments and access your prescriptions, reports, and visit history.
            </p>
            <div className="mt-auto flex items-center text-blue-600 font-bold group-hover:text-blue-700">
              {loading && selectedRole === "patient" ? "Setting up..." : "Continue as Patient"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Clinic Card */}
          <button
            onClick={() => handleRoleSelection("clinic_owner")}
            disabled={loading}
            className={`group flex flex-col items-start p-8 rounded-[2rem] bg-white border-2 text-left transition-all duration-300 shadow-2xl shadow-blue-900/20 ${
              selectedRole === "clinic_owner" ? "border-blue-500 scale-105" : "border-white/20 hover:border-blue-300 hover:-translate-y-2"
            } disabled:opacity-70 disabled:hover:transform-none`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-colors ${
              selectedRole === "clinic_owner" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            }`}>
              <Building2 strokeWidth={2.5} size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Clinic</h2>
            <p className="text-gray-600 mb-8 flex-1 font-medium leading-relaxed">
              Manage doctors, staff, patients, appointments, billing, and complete clinic operations.
            </p>
            <div className="mt-auto flex items-center text-blue-600 font-bold group-hover:text-blue-700">
              {loading && selectedRole === "clinic_owner" ? "Setting up..." : "Continue as Clinic"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
