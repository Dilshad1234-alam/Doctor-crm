"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar, Building2, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

function StatusBadge({ status }) {
  const map = {
    scheduled:  { cls: "bg-blue-50 text-blue-600",    icon: Clock,          label: "Scheduled" },
    completed:  { cls: "bg-emerald-50 text-emerald-600", icon: CheckCircle2, label: "Completed" },
    cancelled:  { cls: "bg-red-50 text-red-500",       icon: XCircle,        label: "Cancelled" },
    "no-show":  { cls: "bg-amber-50 text-amber-600",   icon: AlertCircle,    label: "No Show" },
  };
  const s = map[status] || { cls: "bg-slate-100 text-slate-500", icon: AlertCircle, label: status };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${s.cls}`}>
      <Icon size={10} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

export default function AdminAppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/appointments`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to load appointments");
      
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    } else if (user?.role === "admin") {
      fetchAppointments();
    }
  }, [user, router, fetchAppointments]);

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appointments</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Platform-wide appointments</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Patient & Doctor</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinic</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.length > 0 ? appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{appt.patientId?.name || appt.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Dr. {appt.doctorId?.userId?.name || "Unknown"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Building2 size={12} className="text-slate-400" />
                        <span className="font-bold">{appt.clinicId?.name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-xs font-medium text-slate-700">{new Date(appt.appointmentDate).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400">{appt.timeSlot || "No Time"}</p>
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={appt.status} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-400 font-medium">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
