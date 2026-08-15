"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Building2, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, 
  MapPin, Phone, Mail, User, ShieldAlert, Check, X
} from "lucide-react";

function StatusBadge({ status }) {
  const map = {
    active: { cls: "bg-emerald-50 text-emerald-600", icon: CheckCircle2, label: "Active" },
    suspended: { cls: "bg-red-50 text-red-500", icon: XCircle, label: "Suspended" },
    rejected: { cls: "bg-slate-100 text-slate-500", icon: XCircle, label: "Rejected" },
    pending: { cls: "bg-amber-50 text-amber-600", icon: Clock, label: "Pending" },
  };
  const s = map[status] || { cls: "bg-slate-100 text-slate-500", icon: AlertCircle, label: status };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full capitalize ${s.cls}`}>
      <Icon size={14} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

export default function AdminClinicDetailsPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const clinicId = resolvedParams.clinicId;
  
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null); // 'suspend' | 'reject' | 'approve' | 'activate'

  const fetchClinic = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/clinics/${clinicId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to load clinic");
      
      if (data.success) {
        setClinic(data.clinic);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    } else if (user?.role === "admin") {
      fetchClinic();
    }
  }, [user, router, fetchClinic]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/clinics/${clinicId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");
      
      setClinic(data.clinic);
      setShowConfirm(null);
      // Optionally re-fetch stats
      fetchClinic(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.role !== "admin") return null;

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!clinic) return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1000px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* ── Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Confirm Action</h3>
            <p className="text-sm text-slate-600 mb-6 font-medium">
              Are you sure you want to {showConfirm} <strong>{clinic.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleStatusUpdate(showConfirm === "approve" ? "active" : showConfirm)}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-colors flex justify-center items-center ${
                  showConfirm === 'suspend' || showConfirm === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                disabled={actionLoading}
              >
                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <Link href="/dashboard/admin/clinics" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Clinics
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
              {clinic.logoUrl ? (
                <img src={clinic.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={24} className="text-slate-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{clinic.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <StatusBadge status={clinic.status} />
                <span className="text-xs text-slate-500 font-medium capitalize">
                  Since {new Date(clinic.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {clinic.status === "pending" && (
              <>
                <button onClick={() => setShowConfirm('reject')} className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors">Reject</button>
                <button onClick={() => setShowConfirm('approve')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-sm transition-colors">
                  <Check size={14} /> Approve
                </button>
              </>
            )}
            {clinic.status === "active" && (
              <button onClick={() => setShowConfirm('suspend')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors">
                <X size={14} /> Suspend Clinic
              </button>
            )}
            {clinic.status === "suspended" && (
              <button onClick={() => setShowConfirm('active')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-600 font-bold text-xs hover:bg-emerald-50 transition-colors">
                <Check size={14} /> Activate Clinic
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Clinic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {clinic.address?.line1}<br/>
                    {clinic.address?.city}, {clinic.address?.state} {clinic.address?.pincode}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Contact</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {clinic.phone || "No phone"}<br/>
                    <span className="text-slate-500">{clinic.email || "No email"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Owner Information</h2>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{clinic.ownerId?.name}</p>
                <p className="text-sm text-slate-500 font-medium flex gap-3 mt-1">
                  <span className="flex items-center gap-1"><Mail size={12}/> {clinic.ownerId?.email}</span>
                  <span className="flex items-center gap-1"><Phone size={12}/> {clinic.ownerId?.phone || "N/A"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Platform Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Doctors</span>
                <span className="text-sm font-black text-slate-900">{clinic.stats?.totalDoctors || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Patients</span>
                <span className="text-sm font-black text-slate-900">{clinic.stats?.totalPatients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Staff</span>
                <span className="text-sm font-black text-slate-900">{clinic.stats?.totalStaff || 0}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Total Appointments</span>
                <span className="text-lg font-black text-blue-600">{clinic.stats?.totalAppointments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
