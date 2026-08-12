import { useState } from "react";
import Button from "@/frontend/components/ui/Button";
import { checkInAppointment } from "@/frontend/services/queueApi";

export default function CheckInModal({ appointment, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [form, setForm] = useState({
    priority: "normal",
    notes: ""
  });

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await checkInAppointment(appointment._id || appointment.id, form);
      setSuccessMsg(`Token #${res.queueEntry.tokenNumber} generated successfully!`);
      setTimeout(() => {
        onSuccess(res.queueEntry);
        onClose();
        setSuccessMsg("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check-in Complete</h2>
          <p className="text-gray-600 font-medium">{successMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Check In Patient</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>}

        <div className="bg-gray-50 p-4 rounded mb-5 text-sm space-y-2 border border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">Patient:</span>
            <span className="font-medium text-gray-900">{appointment.patientId?.fullName || "Unknown"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Doctor:</span>
            <span className="font-medium text-gray-900">{appointment.doctorId?.userId?.name || "Unknown"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Time:</span>
            <span className="font-medium text-gray-900">{appointment.startTime} - {appointment.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Visit Type:</span>
            <span className="font-medium text-gray-900 capitalize">{appointment.visitType?.replace(/_/g, " ")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Queue Priority</label>
            <select 
              value={form.priority} 
              onChange={e => setForm({...form, priority: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea 
              rows={2}
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              placeholder="Any special instructions for the doctor"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Checking in..." : "Confirm Check-in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
