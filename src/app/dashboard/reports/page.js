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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{summaryData.totalAppointments}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Calendar size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Completed Consults</p>
            <p className="text-2xl font-bold text-gray-900">{summaryData.completedConsultations}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600"><Stethoscope size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">New Patients</p>
            <p className="text-2xl font-bold text-gray-900">{summaryData.newPatients}</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Users size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Cancelled / No Show</p>
            <p className="text-2xl font-bold text-gray-900">{summaryData.cancelledAppointments} / {summaryData.noShows}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600"><XCircle size={24} /></div>
        </div>
        {canViewRevenue && (
          <>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{summaryData.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><IndianRupee size={24} /></div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">₹{summaryData.pendingPayments?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full text-orange-600"><AlertCircle size={24} /></div>
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
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-lg font-bold text-emerald-600">₹{summary.totalCollected?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Invoiced</p>
            <p className="text-lg font-bold text-gray-800">₹{summary.totalInvoiced?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Amount</p>
            <p className="text-lg font-bold text-orange-500">₹{summary.totalPending?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Paid Invoices</p>
            <p className="text-lg font-bold text-gray-800">{summary.paidInvoices}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Partially Paid</p>
            <p className="text-lg font-bold text-gray-800">{summary.partiallyPaidInvoices}</p>
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
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Appointment Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="text-lg font-bold text-blue-600">{summary.scheduled || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-lg font-bold text-indigo-600">{summary.confirmed || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-lg font-bold text-green-600">{summary.completed || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-lg font-bold text-red-500">{summary.cancelled || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">No Show</p>
            <p className="text-lg font-bold text-gray-500">{summary.no_show || 0}</p>
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
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Doctor Performance</h3>
        {doctorPerformanceData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-3 text-sm font-semibold text-gray-600">Doctor</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Appointments</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Completed</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Patients Seen</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">No Shows</th>
                  {canViewRevenue && <th className="p-3 text-sm font-semibold text-gray-600">Revenue</th>}
                </tr>
              </thead>
              <tbody>
                {doctorPerformanceData.map((doc, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-800">{doc.doctorName}</td>
                    <td className="p-3 text-sm text-gray-600">{doc.appointments}</td>
                    <td className="p-3 text-sm text-gray-600">{doc.completedConsultations}</td>
                    <td className="p-3 text-sm text-gray-600">{doc.patientsSeen}</td>
                    <td className="p-3 text-sm text-gray-600">{doc.noShows}</td>
                    {canViewRevenue && <td className="p-3 text-sm text-gray-600">₹{doc.revenue?.toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No doctor data for the selected period.</p>
        )}
      </div>
    );
  };

  const renderPatientOverview = () => {
    if (!patientData) return null;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Patient Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Patients (Seen)</p>
              <p className="text-2xl font-bold text-gray-900">{patientData.totalPatients}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">New Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{patientData.newPatients}</p>
            </div>
            <Users className="text-green-400" size={32} />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Returning Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patientData.returningPatients}</p>
            </div>
            <RefreshCcw className="text-purple-400" size={32} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Clinic Reports & Analytics" description="View detailed reports and insights for your clinic." />

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="pl-9 pr-8 py-2 w-48 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
              />
            </div>
          </>
        )}

        {isClinicOwner && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Filter</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                className="pl-9 pr-8 py-2 w-48 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
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
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
          <p>Loading reports...</p>
        </div>
      ) : (!summaryData || summaryData.totalAppointments === 0) ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center text-gray-500">
          <FileText size={48} className="text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-1">No report data found</p>
          <p className="text-sm">There is no data for the selected date range and filters.</p>
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
