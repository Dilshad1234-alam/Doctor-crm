"use client";

import { useAuth } from "@/frontend/context/AuthContext";
import DoctorDashboard from "@/frontend/components/dashboard/DoctorDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "doctor" && user.role !== "clinic_owner" && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Clinic owner/admin could potentially view doctor dashboard, or we strict restrict to doctor
  if (user.role === "doctor") {
    return <DoctorDashboard />;
  }

  if (user.role === "clinic_owner" || user.role === "admin") {
    return <DoctorDashboard />; // Re-using for now, or could show "not found"
  }

  return null;
}
