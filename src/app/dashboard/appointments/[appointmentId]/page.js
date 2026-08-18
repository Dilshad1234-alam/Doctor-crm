"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar, User, UserCheck, CheckCircle2, Clock, MapPin, Edit, FileText, Phone } from "lucide-react";
import { getAppointmentById, cancelAppointment, markAppointmentNoShow } from "@/frontend/services/appointmentApi";
import { getQueueEntryByAppointment } from "@/frontend/services/queueApi";
import { getAppointmentVitals } from "@/frontend/services/vitalsApi";
import AppointmentStatusBadge from "@/frontend/components/appointments/AppointmentStatusBadge";
import QueueStatusBadge from "@/frontend/components/queue/QueueStatusBadge";
import CheckInModal from "@/frontend/components/queue/CheckInModal";
import RecordVitalsModal from "@/frontend/components/vitals/RecordVitalsModal";

export default function AppointmentDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const { appointmentId } = unwrappedParams;

  const [appointment, setAppointment] = useState(null);
  const [queueEntry, setQueueEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [vitals, setVitals] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentById(appointmentId);
      if (data.success) {
        setAppointment(data.appointment);
        
          if (["checked_in", "waiting", "called", "in_consultation"].includes(data.appointment.status)) {
          try {
            const queueData = await getQueueEntryByAppointment(appointmentId);
            setQueueEntry(queueData);
          } catch (e) {
            console.error("Failed to load queue entry", e);
          }
        }
        
        // Fetch Vitals
        try {
          const vitalsData = await getAppointmentVitals(appointmentId);
          setVitals(vitalsData);
        } catch (e) {
          console.error("Failed to load vitals", e);
        }
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

  const formatVisitType = (type) => {
    return type ? type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "N/A";
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
            <h1 className="text-2xl font-bold text-gray-900">Appointment {appointment.appointmentCode}</h1>
            <p className="text-gray-500 text-sm mt-1">Booked on {new Date(appointment.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex space-x-3">
            {["scheduled", "confirmed"].includes(appointment.status) && (
              <>
                <button 
                  onClick={() => setCheckInModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors shadow-sm"
                >
                  Check In Patient
                </button>
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
            
            {/* Queue Details Card */}
            {(queueEntry || ["checked_in", "waiting", "called", "in_consultation"].includes(appointment.status)) && (
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider mb-3">Queue Information</h3>
                
                {!queueEntry ? (
                  <p className="text-teal-600 text-sm">Loading queue details...</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                      <span className="text-teal-700 text-sm">Token Number</span>
                      <span className="text-2xl font-black text-teal-900">#{queueEntry.tokenNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-teal-700 text-sm">Queue Status</span>
                      <QueueStatusBadge status={queueEntry.status} />
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-teal-700 text-sm">Wait Time</span>
                      <span className="font-medium text-teal-900">
                        {queueEntry.status === "waiting" || queueEntry.status === "called" 
                          ? `${Math.floor((new Date() - new Date(queueEntry.waitingSince)) / 60000)} min` 
                          : "-"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Vitals Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Patient Vitals</h3>
                <button 
                  onClick={() => setVitalsModalOpen(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  {vitals ? "Edit Vitals" : "Record Vitals"}
                </button>
              </div>
              
              {!vitals ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-500 text-center">
                  Vitals have not been recorded yet.
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-2 gap-4 text-sm shadow-sm">
                  <div>
                    <p className="text-gray-500">Height / Weight</p>
                    <p className="font-medium">{vitals.heightCm || "-"} cm / {vitals.weightKg || "-"} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500">BMI</p>
                    <p className="font-medium">{vitals.bmi || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">BP (mmHg)</p>
                    <p className="font-medium">
                      {vitals.bloodPressure?.systolic && vitals.bloodPressure?.diastolic 
                        ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}` 
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Temp (°C)</p>
                    <p className="font-medium">{vitals.temperatureC || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pulse (bpm)</p>
                    <p className="font-medium">{vitals.pulseRate || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">SpO2 / Resp</p>
                    <p className="font-medium">{vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : "-"} / {vitals.respiratoryRate || "-"}</p>
                  </div>
                  <div className="col-span-2 border-t border-gray-100 pt-3 mt-1">
                    <p className="text-gray-500">Blood Sugar</p>
                    <p className="font-medium">
                      {vitals.bloodSugar?.value ? `${vitals.bloodSugar.value} mg/dL (${vitals.bloodSugar.type})` : "-"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Schedule Details</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                    <p className="text-sm text-gray-500">{appointment.startTime} - {appointment.endTime} ({appointment.durationMinutes} mins)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Visit Type</p>
                    <p className="text-sm text-gray-500">{formatVisitType(appointment.visitType)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {appointment.reason && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Reason for Visit</h3>
                <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">{appointment.reason}</p>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Patient Information</h3>
              <div className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-100">
                <User className="w-10 h-10 text-blue-600 bg-white p-2 rounded-full border border-blue-200 mr-3" />
                <div>
                  <Link href={`/dashboard/patients/${appointment.patientId?._id}`} className="font-medium text-blue-900 hover:underline">
                    {appointment.patientId?.name || appointment.patientId?.fullName || "Unknown Patient"}
                  </Link>
                  <p className="text-sm text-blue-700">{appointment.patientId?.patientCode} • {appointment.patientId?.age} yrs • {appointment.patientId?.gender}</p>
                  {appointment.patientId?.phone && <p className="text-sm text-blue-700 mt-1 flex items-center"><Phone className="w-3 h-3 mr-1" /> {appointment.patientId.phone}</p>}
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
            <span className="text-sm font-medium text-gray-500">Consultation Fee</span>
            <span className="text-lg font-bold text-gray-900">₹{appointment.consultationFee}</span>
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
      
      <CheckInModal 
        isOpen={checkInModalOpen}
        appointment={appointment}
        onClose={() => setCheckInModalOpen(false)}
        onSuccess={() => fetchDetails()}
      />
      
      {vitalsModalOpen && (
        <RecordVitalsModal
          isOpen={vitalsModalOpen}
          appointment={appointment}
          onClose={(shouldRefresh) => {
            setVitalsModalOpen(false);
            if (shouldRefresh === true) fetchDetails();
          }}
        />
      )}
    </div>
  );
}
