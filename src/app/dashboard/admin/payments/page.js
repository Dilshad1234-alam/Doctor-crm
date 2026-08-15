"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { IndianRupee, Building2, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

function StatusBadge({ status }) {
  const map = {
    success: { cls: "bg-emerald-50 text-emerald-600", icon: CheckCircle2, label: "Success" },
    failed: { cls: "bg-red-50 text-red-500", icon: XCircle, label: "Failed" },
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

function fmt(n) { return (n || 0).toLocaleString("en-IN"); }

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/payments`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to load payments");
      
      if (data.success) {
        setPayments(data.payments);
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
      fetchPayments();
    }
  }, [user, router, fetchPayments]);

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments & Revenue</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Platform-wide payment history</p>
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
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinic & Patient</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Amount & Method</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.length > 0 ? payments.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <IndianRupee size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 font-mono text-[10px]">{pay._id.slice(-8).toUpperCase()}</p>
                          <p className="text-[10px] text-slate-400 font-medium capitalize">{pay.paymentType || "Payment"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-0.5">
                        <Building2 size={12} className="text-slate-400" />
                        <span className="font-bold">{pay.clinicId?.name || "N/A"}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {pay.patientId?.name || "Unknown Patient"}
                      </p>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-sm font-black text-slate-800">₹{fmt(pay.amount)}</p>
                      <p className="text-[10px] text-slate-400 font-medium capitalize">{pay.paymentMethod || "Unknown"}</p>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{new Date(pay.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={pay.status} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-slate-400 font-medium">
                      No payments found.
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
