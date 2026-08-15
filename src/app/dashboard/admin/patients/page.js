"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, Building2 } from "lucide-react";

export default function AdminPatientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/patients`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to load patients");
      
      if (data.success) {
        setPatients(data.patients);
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
      fetchPatients();
    }
  }, [user, router, fetchPatients]);

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patients</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Platform-wide patients directory</p>
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
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Patient Info</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Primary Clinic</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Registration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.length > 0 ? patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{pat.userId?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">ID: {pat.userId?._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-xs font-medium text-slate-700">{pat.userId?.email}</p>
                      <p className="text-[10px] text-slate-400">{pat.userId?.phone || "N/A"}</p>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Building2 size={12} className="text-slate-400" />
                        <span className="font-bold">{pat.clinicId?.name || "N/A"}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{pat.clinicId?.address?.city || "Unknown City"}</p>
                    </td>
                    <td className="py-3 px-5 text-xs font-medium text-slate-500">
                      {new Date(pat.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-400 font-medium">
                      No patients found.
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
