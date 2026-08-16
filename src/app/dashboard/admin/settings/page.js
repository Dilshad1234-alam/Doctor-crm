"use client";

import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Settings, Sparkles } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Manage global configuration and platform defaults</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center justify-center p-20 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 relative">
          <Settings size={28} />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Sparkles size={14} className="text-amber-500" />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Coming Soon</h2>
        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
          The admin settings panel is currently under development. You will soon be able to configure core platform features, notification templates, and system preferences.
        </p>
      </div>
    </div>
  );
}
