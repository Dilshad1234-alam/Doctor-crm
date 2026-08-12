import { useState, useEffect } from "react";
import VitalsForm from "./VitalsForm";
import { recordVitals, updateVitals, getAppointmentVitals } from "@/frontend/services/vitalsApi";

export default function RecordVitalsModal({ isOpen, onClose, appointment }) {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      loadVitals();
    }
  }, [isOpen, appointment]);

  const loadVitals = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);
      const data = await getAppointmentVitals(appointment._id || appointment.id);
      setInitialData(data || {});
    } catch (err) {
      setError(err.message || "Failed to load existing vitals");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError("");
      
      const aptId = appointment._id || appointment.id;
      // If we have an ID in initialData, we are updating
      if (initialData && initialData.id) {
        await updateVitals(aptId, payload);
      } else {
        await recordVitals(aptId, payload);
      }
      
      setSuccess(true);
      setTimeout(() => {
        onClose(true); // pass true to indicate success/refresh needed
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to save vitals");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {initialData && initialData.id ? "Update Vitals" : "Record Vitals"}
          </h3>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Context Header */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4 text-sm">
            <div className="flex-1 min-w-[200px]">
              <p className="text-blue-700 font-semibold mb-1">Patient</p>
              <p className="text-gray-800">{appointment.patientId?.fullName || "Unknown Patient"}</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-blue-700 font-semibold mb-1">Doctor</p>
              <p className="text-gray-800">Dr. {appointment.doctorId?.userId?.name || appointment.doctorId?.name || "Unknown"}</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-blue-700 font-semibold mb-1">Appointment Time</p>
              <p className="text-gray-800">{appointment.startTime} - {appointment.endTime}</p>
            </div>
            {appointment.tokenNumber && (
              <div className="flex-1 min-w-[100px]">
                <p className="text-blue-700 font-semibold mb-1">Token</p>
                <p className="text-gray-800 text-lg font-bold">#{appointment.tokenNumber}</p>
              </div>
            )}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">Vitals saved successfully!</div>}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            !success && <VitalsForm initialData={initialData} onSubmit={handleSubmit} isSubmitting={submitting} />
          )}
        </div>
      </div>
    </div>
  );
}
