"use client";
import { useState } from "react";
import Button from "@/frontend/components/ui/Button";

export default function AppointmentSettingsTab({ settings, onSave }) {
  const [formData, setFormData] = useState({
    defaultSlotDuration: settings?.defaultSlotDuration || 15,
    allowSameDayBooking: settings?.allowSameDayBooking ?? true,
    allowWalkIn: settings?.allowWalkIn ?? true,
    requireVitalsBeforeConsultation: settings?.requireVitalsBeforeConsultation ?? false,
    allowAppointmentCancellation: settings?.allowAppointmentCancellation ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await onSave({ appointmentSettings: formData });
      setMessage("Appointment settings updated successfully.");
    } catch (err) {
      setError("Unable to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Appointment Settings</h3>
      
      {message && <div className="p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-sm">{message}</div>}
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Slot Duration (minutes)</label>
          <select 
            name="defaultSlotDuration" 
            value={formData.defaultSlotDuration} 
            onChange={handleChange}
            className="w-1/2 text-sm border-gray-300 rounded-md"
          >
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Used to generate available slots for booking.</p>
        </div>

        <div className="space-y-3 pt-3 border-t">
          <label className="flex items-center">
            <input type="checkbox" name="allowSameDayBooking" checked={formData.allowSameDayBooking} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Allow Same-Day Booking</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" name="allowWalkIn" checked={formData.allowWalkIn} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Allow Walk-In Patients</span>
          </label>

          <label className="flex items-center">
            <input type="checkbox" name="allowAppointmentCancellation" checked={formData.allowAppointmentCancellation} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Allow Appointment Cancellation</span>
          </label>

          <label className="flex items-center">
            <input type="checkbox" name="requireVitalsBeforeConsultation" checked={formData.requireVitalsBeforeConsultation} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Require Vitals Before Consultation</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
