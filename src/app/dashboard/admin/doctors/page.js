"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { Stethoscope, Building2 } from "lucide-react";

export default function AdminDoctorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/doctors`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to load doctors");
      
      if (data.success) {
        setDoctors(data.doctors);
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
      fetchDoctors();
    }
  }, [user, router, fetchDoctors]);

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctors</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Platform-wide doctors directory</p>
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
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Doctor Info</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Specialization</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinic</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {doctors.length > 0 ? doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                          <Stethoscope size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{doc.userId?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{doc.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-xs font-medium text-slate-700">{doc.specialization || "General"}</p>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Building2 size={12} className="text-slate-400" />
                        <span className="font-bold">{doc.clinicId?.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{doc.clinicId?.address?.city || "Unknown City"}</p>
                    </td>
                    <td className="py-3 px-5">
                      {doc.userId?.isActive ? (
                        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500">Inactive</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-400 font-medium">
                      No doctors found.
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
