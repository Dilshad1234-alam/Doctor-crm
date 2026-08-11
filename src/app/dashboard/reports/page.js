"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import { reportsApi } from "@/frontend/services/reportsApi";
import { getDoctors } from "@/frontend/services/doctorApi";
import { useAuth } from "@/frontend/context/AuthContext";
import { Calendar, Filter, IndianRupee, Users, Activity, Loader2, AlertCircle, FileText, XCircle, Stethoscope, RefreshCcw } from "lucide-react";

function getDateRanges() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const last30DaysStart = new Date(today);
  last30DaysStart.setDate(today.getDate() - 30);

  return {
    today: { from: todayStr, to: todayStr },
    thisWeek: { from: thisWeekStart.toISOString().split("T")[0], to: todayStr },
    thisMonth: { from: thisMonthStart.toISOString().split("T")[0], to: todayStr },
    last30Days: { from: last30DaysStart.toISOString().split("T")[0], to: todayStr },
  };
}

const ranges = getDateRanges();

export default function ReportsPage() {
  const { user } = useAuth();
  
  const [dateRangeType, setDateRangeType] = useState("thisMonth");
  const [customDateFrom, setCustomDateFrom] = useState(ranges.thisMonth.from);
  const [customDateTo, setCustomDateTo] = useState(ranges.thisMonth.to);
  const [doctorId, setDoctorId] = useState("");
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summaryData, setSummaryData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [doctorPerformanceData, setDoctorPerformanceData] = useState(null);
  const [patientData, setPatientData] = useState(null);

  const isClinicOwner = user?.role === "clinic_owner";
  const canViewRevenue = user && !["assistant", "receptionist"].includes(user.role);
  const canViewDoctorReport = user && user.role !== "doctor" && !["assistant", "receptionist"].includes(user.role);

  useEffect(() => {
    if (isClinicOwner) {
      getDoctors().then(res => setDoctors(res.doctors || res)).catch(err => console.error(err));
    }
  }, [isClinicOwner]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let dateFrom = customDateFrom;
      let dateTo = customDateTo;

      if (dateRangeType !== "custom") {
        dateFrom = ranges[dateRangeType].from;
        dateTo = ranges[dateRangeType].to;
      }

      const params = { dateFrom, dateTo };
      if (doctorId) params.doctorId = doctorId;

      const [summary, appointments, patients] = await Promise.all([
        reportsApi.getReportSummary(params),
        reportsApi.getAppointmentReport(params),
        reportsApi.getPatientReport(params)
      ]);

      setSummaryData(summary);
      setAppointmentData(appointments);
      setPatientData(patients);

      if (canViewRevenue) {
        const revenue = await reportsApi.getRevenueReport(params);
        setRevenueData(revenue);
      }

      if (canViewDoctorReport) {
        const docPerf = await reportsApi.getDoctorReport(params);
        setDoctorPerformanceData(docPerf);
      }

    } catch (err) {
      setError(err.message || "Unable to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateRangeType, customDateFrom, customDateTo, doctorId, canViewRevenue, canViewDoctorReport]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [fetchReports, user]);

  const handleDateRangeChange = (e) => {
    const val = e.target.value;
    setDateRangeType(val);
    if (val !== "custom") {
      setCustomDateFrom(ranges[val].from);
      setCustomDateTo(ranges[val].to);
    }
  };

  const renderSummaryCards = () => {
    if (!summaryData) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Total Appointments</p>
            <p className="text-4xl font-black text-gray-900">{summaryData.totalAppointments}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl text-blue-600 shadow-sm relative z-10 border border-blue-200"><Calendar size={28} /></div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Completed Consults</p>
            <p className="text-4xl font-black text-gray-900">{summaryData.completedConsultations}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl text-green-600 shadow-sm relative z-10 border border-green-200"><Stethoscope size={28} /></div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">New Patients</p>
            <p className="text-4xl font-black text-gray-900">{summaryData.newPatients}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl text-purple-600 shadow-sm relative z-10 border border-purple-200"><Users size={28} /></div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Cancelled / No Show</p>
            <p className="text-4xl font-black text-gray-900">{summaryData.cancelledAppointments} <span className="text-gray-300 text-2xl">/</span> {summaryData.noShows}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl text-red-600 shadow-sm relative z-10 border border-red-200"><XCircle size={28} /></div>
        </div>
        {canViewRevenue && (
          <>
            <div className="bg-gradient-to-br from-[#0f3d69] to-[#15558d] p-6 rounded-[1.5rem] border-none shadow-md flex items-center justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <p className="text-xs font-bold tracking-widest text-blue-100 uppercase mb-1">Total Revenue</p>
                <p className="text-4xl font-black text-white">₹{summaryData.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl text-white backdrop-blur-sm relative z-10 border border-white/20"><IndianRupee size={28} /></div>
            </div>
            <div className="bg-white p-6 rounded-[1.5rem] border border-orange-100 bg-orange-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-1">Pending Payments</p>
                <p className="text-4xl font-black text-orange-600">₹{summaryData.pendingPayments?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl text-orange-600 shadow-sm relative z-10 border border-orange-200"><AlertCircle size={28} /></div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderRevenueOverview = () => {
    if (!revenueData || !canViewRevenue) return null;
    const { summary, trend } = revenueData;
    const maxRev = trend?.length ? Math.max(...trend.map(t => t.revenue)) : 0;

    return (
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><IndianRupee size={20} /></div>
          Revenue Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Total Collected</p>
            <p className="text-2xl font-black text-emerald-600">₹{summary.totalCollected?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Total Invoiced</p>
            <p className="text-2xl font-black text-gray-800">₹{summary.totalInvoiced?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Pending Amount</p>
            <p className="text-2xl font-black text-orange-500">₹{summary.totalPending?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Paid Invoices</p>
            <p className="text-2xl font-black text-gray-800">{summary.paidInvoices}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Partially Paid</p>
            <p className="text-2xl font-black text-gray-800">{summary.partiallyPaidInvoices}</p>
          </div>
        </div>

        {trend && trend.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-2">Daily Revenue Trend</p>
            <div className="flex items-end h-40 space-x-2 border-b border-gray-200 pb-2">
              {trend.map((day, i) => {
                const height = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div className="w-full bg-emerald-400 rounded-t-sm hover:bg-emerald-500 transition-colors" style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                      {day.date}: ₹{day.revenue}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{trend[0].date}</span>
              <span>{trend[trend.length - 1].date}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No revenue data for the selected period.</p>
        )}
      </div>
    );
  };

  const renderAppointmentOverview = () => {
    if (!appointmentData) return null;
    const { summary, trend } = appointmentData;
    const maxAppts = trend?.length ? Math.max(...trend.map(t => t.appointments)) : 0;

    return (
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Calendar size={20} /></div>
          Appointment Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Scheduled</p>
            <p className="text-2xl font-black text-blue-600">{summary.scheduled || 0}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Confirmed</p>
            <p className="text-2xl font-black text-indigo-600">{summary.confirmed || 0}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Completed</p>
            <p className="text-2xl font-black text-green-600">{summary.completed || 0}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Cancelled</p>
            <p className="text-2xl font-black text-red-500">{summary.cancelled || 0}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">No Show</p>
            <p className="text-2xl font-black text-gray-500">{summary.no_show || 0}</p>
          </div>
        </div>

        {trend && trend.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-2">Daily Appointment Trend</p>
            <div className="flex items-end h-40 space-x-2 border-b border-gray-200 pb-2">
              {trend.map((day, i) => {
                const height = maxAppts > 0 ? (day.appointments / maxAppts) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div className="w-full bg-blue-400 rounded-t-sm hover:bg-blue-500 transition-colors" style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                      {day.date}: {day.appointments} Appts
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{trend[0].date}</span>
              <span>{trend[trend.length - 1].date}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No appointment data for the selected period.</p>
        )}
      </div>
    );
  };

  const renderDoctorPerformance = () => {
    if (!doctorPerformanceData || !canViewDoctorReport) return null;

    return (
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Activity size={20} /></div>
          Doctor Performance
        </h3>
        {doctorPerformanceData.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Appointments</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patients Seen</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No Shows</th>
                  {canViewRevenue && <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>}
                </tr>
              </thead>
              <tbody>
                {doctorPerformanceData.map((doc, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4 text-sm font-bold text-gray-900 group-hover:text-[#15558d]">{doc.doctorName}</td>
                    <td className="p-4 text-sm font-bold text-gray-600">{doc.appointments}</td>
                    <td className="p-4 text-sm font-bold text-green-600">{doc.completedConsultations}</td>
                    <td className="p-4 text-sm font-bold text-gray-600">{doc.patientsSeen}</td>
                    <td className="p-4 text-sm font-bold text-red-500">{doc.noShows}</td>
                    {canViewRevenue && <td className="p-4 text-sm font-black text-emerald-600">₹{doc.revenue?.toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-gray-100">
            <p className="text-sm font-bold text-gray-400">No doctor data for the selected period.</p>
          </div>
        )}
      </div>
    );
  };

  const renderPatientOverview = () => {
    if (!patientData) return null;

    return (
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-500"><Users size={20} /></div>
          Patient Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-[1.5rem] border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Total Patients (Seen)</p>
              <p className="text-4xl font-black text-gray-900">{patientData.totalPatients}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-500"><Users size={32} /></div>
          </div>
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-[1.5rem] border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">New Registrations</p>
              <p className="text-4xl font-black text-gray-900">{patientData.newPatients}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl text-green-500"><Users size={32} /></div>
          </div>
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-[1.5rem] border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Returning Patients</p>
              <p className="text-4xl font-black text-gray-900">{patientData.returningPatients}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl text-purple-500"><RefreshCcw size={32} /></div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Clinic Reports & Analytics</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">View detailed reports and insights for your clinic.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 flex flex-wrap gap-6 items-end">
        <div>
          <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Date Range</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#15558d]" size={18} />
            <select
              className="pl-10 pr-8 py-3 w-56 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#15558d] cursor-pointer"
              value={dateRangeType}
              onChange={handleDateRangeChange}
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="last30Days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {dateRangeType === "custom" && (
          <>
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">From Date</label>
              <input
                type="date"
                className="px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#15558d]"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">To Date</label>
              <input
                type="date"
                className="px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#15558d]"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
              />
            </div>
          </>
        )}

        {isClinicOwner && (
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Doctor Filter</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#15558d]" size={18} />
              <select
                className="pl-10 pr-8 py-3 w-56 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#15558d] cursor-pointer"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">All Doctors</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-[1.5rem] flex items-center gap-3 font-bold shadow-sm">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <div className="p-4 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-4">
            <Loader2 className="animate-spin text-[#15558d]" size={40} />
          </div>
          <p className="font-bold tracking-wide">Crunching numbers...</p>
        </div>
      ) : (!summaryData || summaryData.totalAppointments === 0) ? (
        <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FileText size={40} className="text-gray-300" />
          </div>
          <p className="text-2xl font-black text-gray-900 mb-2">No report data found</p>
          <p className="text-gray-500 font-medium">There is no data for the selected date range and filters.</p>
        </div>
      ) : (
        <>
          {renderSummaryCards()}
          {renderRevenueOverview()}
          {renderAppointmentOverview()}
          {renderDoctorPerformance()}
          {renderPatientOverview()}
        </>
      )}
    </div>
  );
}
