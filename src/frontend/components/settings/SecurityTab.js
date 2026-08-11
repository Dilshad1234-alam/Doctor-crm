"use client";
import { useState } from "react";
import Button from "@/frontend/components/ui/Button";

export default function SecurityTab({ onSave }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      setSaving(false);
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setSaving(false);
      return;
    }

    try {
      await onSave({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setMessage("Password updated successfully.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Unable to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Change Password</h3>
      
      {message && <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">{message}</div>}
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
          <input 
            type="password" 
            name="currentPassword" 
            value={formData.currentPassword} 
            onChange={handleChange} 
            required 
            className="w-full text-sm border-gray-300 rounded-md" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
          <input 
            type="password" 
            name="newPassword" 
            value={formData.newPassword} 
            onChange={handleChange} 
            required 
            className="w-full text-sm border-gray-300 rounded-md" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
            className="w-full text-sm border-gray-300 rounded-md" 
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={saving}>{saving ? "Updating..." : "Update Password"}</Button>
      </div>
    </form>
  );
}
