"use client";
import { useState } from "react";
import Button from "@/frontend/components/ui/Button";

export default function ClinicProfileTab({ clinic, onSave }) {
  const [formData, setFormData] = useState({
    name: clinic?.name || "",
    phone: clinic?.phone || "",
    email: clinic?.email || "",
    address: {
      line1: clinic?.address?.line1 || "",
      line2: clinic?.address?.line2 || "",
      city: clinic?.address?.city || "",
      state: clinic?.address?.state || "",
      pincode: clinic?.address?.pincode || "",
      country: clinic?.address?.country || "India",
    },
    timezone: clinic?.timezone || "Asia/Kolkata",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await onSave(formData);
      setMessage("Settings updated successfully.");
    } catch (err) {
      setError("Unable to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Clinic Profile</h3>
      
      {message && <div className="p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-sm">{message}</div>}
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full text-sm border-gray-300 rounded-md" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full text-sm border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full text-sm border-gray-300 rounded-md" />
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-sm font-bold text-gray-700">Address</h4>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Address Line 1</label>
            <input type="text" name="address.line1" value={formData.address.line1} onChange={handleChange} className="w-full text-sm border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Address Line 2</label>
            <input type="text" name="address.line2" value={formData.address.line2} onChange={handleChange} className="w-full text-sm border-gray-300 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">City</label>
              <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="w-full text-sm border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">State</label>
              <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} className="w-full text-sm border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">PIN Code</label>
              <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange} className="w-full text-sm border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Country</label>
              <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} className="w-full text-sm border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select name="timezone" value={formData.timezone} onChange={handleChange} className="w-full text-sm border-gray-300 rounded-md">
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
