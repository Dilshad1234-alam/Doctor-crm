"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { getAppointments, cancelAppointment, markAppointmentNoShow } from "@/frontend/services/appointmentApi";
import AppointmentTable from "@/frontend/components/appointments/AppointmentTable";
import { useAuth } from "@/frontend/context/AuthContext";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const data = await getAppointments(params);
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        setError(data.message || "Failed to load appointments");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, searchTerm, statusFilter, dateFilter]);

  const handleCancel = async (apt) => {
    if (window.confirm(`Are you sure you want to cancel appointment ${apt.appointmentCode}?`)) {
      try {
        const reason = window.prompt("Reason for cancellation:");
        if (!reason) return;
        const res = await cancelAppointment(apt._id, { reason });
        if (res.success) fetchAppointments();
      } catch (err) {
        alert(err.response?.data?.message || "Error cancelling appointment");
      }
    }
  };

  const handleNoShow = async (apt) => {
    if (window.confirm(`Mark ${apt.appointmentCode} as No-Show?`)) {
      try {
        const res = await markAppointmentNoShow(apt._id);
        if (res.success) fetchAppointments();
      } catch (err) {
        alert(err.response?.data?.message || "Error updating appointment");
      }
    }
  };

  const handleReschedule = (apt) => {
    alert("Please click 'View Details' to reschedule this appointment.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage clinic appointments and doctor schedules.</p>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Book Appointment
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border-b border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <AppointmentTable 
              appointments={appointments} 
              role={user?.role}
              onCancel={handleCancel}
              onNoShow={handleNoShow}
              onReschedule={handleReschedule}
            />
          )}
        </div>
      </div>
    </div>
  );
}
