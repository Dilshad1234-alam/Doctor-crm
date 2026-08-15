"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Search, Filter, ArrowRight, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";

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
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${s.cls}`}>
      <Icon size={10} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

export default function AdminClinicsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusFilter = searchParams.get("status") || "all";
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/clinics?status=${statusFilter}&search=${searchTerm}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to load clinics");
      
      if (data.success) {
        setClinics(data.clinics);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    } else if (user?.role === "admin") {
      fetchClinics();
    }
  }, [user, router, fetchClinics]);

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinics</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage all clinics on the platform</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clinics by name or city..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchClinics()}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-600">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                className="bg-transparent border-none focus:outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => {
                  const url = new URL(window.location);
                  url.searchParams.set("status", e.target.value);
                  router.push(url.pathname + url.search);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinic Name</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Owner</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clinics.length > 0 ? clinics.map((clinic) => (
                  <tr key={clinic._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{clinic.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{clinic.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-xs font-bold text-slate-700">{clinic.ownerId?.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{clinic.ownerId?.email}</p>
                    </td>
                    <td className="py-3 px-5 text-xs font-medium text-slate-600">
                      {clinic.address?.city}, {clinic.address?.state}
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={clinic.status} />
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link 
                        href={`/dashboard/admin/clinics/${clinic._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 shadow-sm transition-all"
                      >
                        View <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-slate-400 font-medium">
                      No clinics found.
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
