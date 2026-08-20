"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Calendar, Activity, IndianRupee } from "lucide-react";

export default function OwnerDashboard() {
  return (
    <div className="space-y-6 pb-10 w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Welcome to Admin Panel</p>
        </div>
      </div>
    </div>
  );
}
