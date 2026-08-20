"use client";

import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { BarChart3, Building2, Users, Stethoscope, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    } else if (user?.role === "admin") {
      fetchReports();
    }
  }, [user, router, fetchReports]);

  if (user?.role !== "admin") return null;

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          System Reports
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Platform-wide analytics and reporting</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : reportData ? (
        <div className="space-y-8 mt-6">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Clinics</p>
              <h3 className="text-3xl font-black text-slate-900">{reportData.kpis.clinics}</h3>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Stethoscope size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Doctors</p>
              <h3 className="text-3xl font-black text-slate-900">{reportData.kpis.doctors}</h3>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Patients</p>
              <h3 className="text-3xl font-black text-slate-900">{reportData.kpis.patients}</h3>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CalendarIcon size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Appointments</p>
              <h3 className="text-3xl font-black text-slate-900">{reportData.kpis.appointments}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Appointment Analytics */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
              <h2 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                <ActivityIcon /> Appointment Status Breakdown
              </h2>
              
              <div className="space-y-6">
                <StatusRow 
                  label="Completed" 
                  count={reportData.appointmentsByStatus.completed} 
                  total={reportData.kpis.appointments} 
                  colorClass="bg-emerald-500" 
                  icon={<CheckCircle2 size={16} className="text-emerald-500" />}
                />
                <StatusRow 
                  label="Scheduled" 
                  count={reportData.appointmentsByStatus.scheduled} 
                  total={reportData.kpis.appointments} 
                  colorClass="bg-blue-500" 
                  icon={<Clock size={16} className="text-blue-500" />}
                />
                <StatusRow 
                  label="In Progress" 
                  count={reportData.appointmentsByStatus.in_progress} 
                  total={reportData.kpis.appointments} 
                  colorClass="bg-amber-500" 
                  icon={<ActivityIcon size={16} className="text-amber-500" />}
                />
                <StatusRow 
                  label="Canceled" 
                  count={reportData.appointmentsByStatus.canceled} 
                  total={reportData.kpis.appointments} 
                  colorClass="bg-red-500" 
                  icon={<XCircle size={16} className="text-red-500" />}
                />
              </div>
            </div>

            {/* Recent Clinics */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Building2 size={20} className="text-slate-400" /> Newest Clinics
                </h2>
                <Link href="/dashboard/admin/clinics" className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:text-blue-800 transition-colors">
                  View All
                </Link>
              </div>
              
              <div className="flex-1 space-y-4">
                {reportData.recentClinics?.length > 0 ? reportData.recentClinics.map(clinic => (
                  <Link href={`/dashboard/admin/clinics/${clinic._id}`} key={clinic._id} className="block group">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{clinic.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{new Date(clinic.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-slate-500 text-center py-4">No clinics registered yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500">Failed to load reports.</div>
      )}
    </div>
  );
}

function StatusRow({ label, count, total, colorClass, icon }) {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
  
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-slate-900">{count}</span>
          <span className="text-xs font-bold text-slate-400 ml-2">({percentage}%)</span>
        </div>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function ActivityIcon(props) {
  return (
    <svg {...props} width={props.size || "24"} height={props.size || "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}
