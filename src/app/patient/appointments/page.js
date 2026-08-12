"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by patient" })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments();
      } else {
        alert(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReschedule = (app) => {
    // Navigate to slot picker for doctor
    router.push(`/doctors/${app.doctorId._id || app.doctorId}/slots`);
  };

  const filteredAppointments = appointments.filter((app) => {
    const status = (app.status || "").toLowerCase();
    if (activeTab === "upcoming") {
      return ["scheduled", "confirmed", "checked_in", "waiting"].includes(status);
    }
    if (activeTab === "completed") {
      return status === "completed";
    }
    if (activeTab === "cancelled") {
      return ["cancelled", "no_show"].includes(status);
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A]">My Appointments</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage and track your doctor consultations.</p>
        </div>
        <Link href="/clinics" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#10B981] text-white font-bold hover:bg-[#047857] shadow-md transition-all text-sm">
          Book New Appointment
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] space-x-8">
        {[
          { id: "upcoming", label: "Upcoming" },
          { id: "completed", label: "Completed" },
          { id: "cancelled", label: "Cancelled" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab.id
                ? "text-[#10B981]"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm">
          <Calendar className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">No {activeTab} appointments</h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto mb-6">You don't have any appointments in this section.</p>
          <Link href="/clinics" className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-bold hover:bg-[#E2E8F0] transition-colors text-sm">
            Find a Clinic
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((app) => (
            <div key={app._id} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md">
                    Token: {app.token || app.appointmentCode}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                    app.status === 'completed' ? 'bg-[#ECFDF5] text-[#10B981]' :
                    app.status === 'cancelled' ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#FFFBEB] text-[#F59E0B]'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                  {app.doctorId?.user?.name || app.doctorId?.specialization || "Specialist Doctor"}
                </h3>
                <p className="text-xs text-[#10B981] font-bold mb-4">{app.doctorId?.specialization || "General Consultation"}</p>

                <div className="space-y-2 text-xs text-[#64748B] mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#10B981]" />
                    <span>{new Date(app.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#10B981]" />
                    <span>{app.startTime} - {app.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A]">Fee: ₹{app.consultationFee}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              {activeTab === "upcoming" && (
                <div className="border-t border-[#F1F5F9] pt-4 flex gap-3">
                  <button 
                    onClick={() => handleReschedule(app)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-[#E2E8F0] text-[#0F172A] font-bold text-xs hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                  </button>
                  <button 
                    disabled={actionLoading === app._id}
                    onClick={() => handleCancel(app._id)}
                    className="py-2.5 px-3 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] text-[#EF4444] font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> {actionLoading === app._id ? 'Cancelling...' : 'Cancel'}
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
