"use client";
import { useState } from "react";
import Button from "@/frontend/components/ui/Button";

export default function PrescriptionSettingsTab({ settings, onSave }) {
  const [formData, setFormData] = useState({
    showClinicAddress: settings?.showClinicAddress ?? true,
    showClinicPhone: settings?.showClinicPhone ?? true,
    showDoctorRegistrationNumber: settings?.showDoctorRegistrationNumber ?? true,
    showPatientId: settings?.showPatientId ?? true,
    showFollowUpInformation: settings?.showFollowUpInformation ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await onSave({ prescriptionSettings: formData });
      setMessage("Prescription settings updated successfully.");
    } catch (err) {
      setError("Unable to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Prescription Print Settings</h3>
      
      {message && <div className="p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-sm">{message}</div>}
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>}

      <div className="space-y-4">
        <label className="flex items-center">
          <input type="checkbox" name="showClinicAddress" checked={formData.showClinicAddress} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
          <span className="text-sm font-medium text-gray-700">Show Clinic Address on Print</span>
        </label>
        
        <label className="flex items-center">
          <input type="checkbox" name="showClinicPhone" checked={formData.showClinicPhone} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
          <span className="text-sm font-medium text-gray-700">Show Clinic Phone Number on Print</span>
        </label>

        <label className="flex items-center">
          <input type="checkbox" name="showDoctorRegistrationNumber" checked={formData.showDoctorRegistrationNumber} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
          <span className="text-sm font-medium text-gray-700">Show Doctor's Registration Number</span>
        </label>

        <label className="flex items-center">
          <input type="checkbox" name="showPatientId" checked={formData.showPatientId} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
          <span className="text-sm font-medium text-gray-700">Show Patient ID/Code</span>
        </label>

        <label className="flex items-center">
          <input type="checkbox" name="showFollowUpInformation" checked={formData.showFollowUpInformation} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
          <span className="text-sm font-medium text-gray-700">Show Follow-up Instructions</span>
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
