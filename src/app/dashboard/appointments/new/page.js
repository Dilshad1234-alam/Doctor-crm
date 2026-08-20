"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function BookAppointmentPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center">
        <Link href="/dashboard/appointments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mr-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">The new SaaS booking engine is currently under construction. Please check back in Phase 4.</p>
      </div>
    </div>
  );
}
