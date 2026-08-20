"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar, User, UserCheck, Phone, FileText, Fingerprint } from "lucide-react";
import { getAppointmentById, cancelAppointment, markAppointmentNoShow } from "@/frontend/services/appointmentApi";
import AppointmentStatusBadge from "@/frontend/components/appointments/AppointmentStatusBadge";

export default function AppointmentDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const { appointmentId } = unwrappedParams;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentById(appointmentId);
      if (data.success) {
        setAppointment(data.appointment);
      } else {
        setError(data.message || "Failed to load appointment details");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) fetchDetails();
  }, [appointmentId]);

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      const reason = window.prompt("Cancellation reason:");
      if (!reason) return;
      try {
        await cancelAppointment(appointmentId, { reason });
        fetchDetails();
      } catch (err) {
        alert(err.response?.data?.message || "Error cancelling appointment");
      }
    }
  };

  const handleNoShow = async () => {
    if (window.confirm("Mark this appointment as No-Show?")) {
      try {
        await markAppointmentNoShow(appointmentId);
        fetchDetails();
      } catch (err) {
        alert(err.response?.data?.message || "Error updating appointment");
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;
  if (!appointment) return <div className="p-8 text-center">Appointment not found</div>;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/appointments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Appointments
        </Link>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-gray-500 text-sm mt-1">Booked on {new Date(appointment.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex space-x-3">
            {["PENDING", "CONFIRMED"].includes(appointment.status) && (
              <>
                <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleNoShow} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
                  Mark No-Show
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Schedule Details</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Fingerprint className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Booking ID</p>
                    <p className="text-sm text-gray-500 font-mono">{appointment.bookingId}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                    <p className="text-sm text-gray-500">{appointment.appointmentTime} ({appointment.durationMinutes} mins)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Service</p>
                    <p className="text-sm text-gray-500">{appointment.serviceId?.name || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Customer Information</h3>
              <div className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-100">
                <User className="w-10 h-10 text-blue-600 bg-white p-2 rounded-full border border-blue-200 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">
                    {appointment.patientName || "Unknown Customer"}
                  </p>
                  <p className="text-sm text-blue-700">{appointment.patientAge || "-"} yrs • {appointment.patientGender || "-"}</p>
                  {appointment.patientPhone && <p className="text-sm text-blue-700 mt-1 flex items-center"><Phone className="w-3 h-3 mr-1" /> {appointment.patientPhone}</p>}
                  {appointment.patientEmail && <p className="text-sm text-blue-700 mt-1">{appointment.patientEmail}</p>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Doctor Information</h3>
              <div className="flex items-start">
                <UserCheck className="w-10 h-10 text-gray-500 bg-gray-100 p-2 rounded-full border border-gray-200 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.doctorId?.name || appointment.doctorId?.userId?.name || "Unknown Doctor"}</p>
                  <p className="text-sm text-gray-500">{appointment.doctorId?.specialization || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Service Price</span>
            <span className="text-lg font-bold text-gray-900">₹{appointment.serviceId?.price || 0}</span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
             <div className="text-sm text-gray-500">Manage billing and payments for this appointment.</div>
             <Link href={`/dashboard/appointments/${appointmentId}/billing`}>
               <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm">
                 Create / View Invoice
               </button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
