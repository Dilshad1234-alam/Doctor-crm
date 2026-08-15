"use client";

import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OwnerDashboard from "@/frontend/components/dashboard/OwnerDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role === "doctor") {
      router.push("/dashboard/doctor");
    }
  }, [user, router]);

  if (!user) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (user.role === "clinic_owner" || user.role === "admin") {
    return <OwnerDashboard />;
  }

  if (user.role === "doctor") {
    return null; // Render nothing while redirecting
  }

  // Fallback for other roles (receptionist, assistant) - could be expanded later
  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center text-[#64748B] shadow-sm mt-10 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#EFF6FF] rounded-full opacity-50"></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#EFF6FF] rounded-full opacity-50"></div>
        
        <div className="w-20 h-20 mx-auto bg-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-md relative z-10">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] mb-3 relative z-10 tracking-tight">Welcome to Clinora</h2>
        <p className="text-base font-medium relative z-10">Use the navigation menu to manage clinic operations.</p>
      </div>
    </div>
  );
}
