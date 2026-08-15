"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { ClipboardList, Building2 } from "lucide-react";

export default function AdminStaffPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/staff`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to load staff");
      
      if (data.success) {
        setStaff(data.staff);
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
      fetchStaff();
    }
  }, [user, router, fetchStaff]);

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Members</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Platform-wide clinic staff directory</p>
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
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Staff Info</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinic</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staff.length > 0 ? staff.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                          <ClipboardList size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{st.userId?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{st.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-xs font-medium text-slate-700 capitalize">{st.role}</p>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Building2 size={12} className="text-slate-400" />
                        <span className="font-bold">{st.clinicId?.name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      {st.userId?.isActive ? (
                        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500">Inactive</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-400 font-medium">
                      No staff members found.
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
