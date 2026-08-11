"use client";
import { useState } from "react";
import Button from "@/frontend/components/ui/Button";

export default function BillingSettingsTab({ settings, onSave }) {
  const [formData, setFormData] = useState({
    currency: settings?.currency || "INR",
    taxEnabled: settings?.taxEnabled ?? false,
    defaultTaxPercentage: settings?.defaultTaxPercentage || 0,
    invoicePrefix: settings?.invoicePrefix || "INV",
    paymentReceiptPrefix: settings?.paymentReceiptPrefix || "REC",
    invoiceFooter: settings?.invoiceFooter || "Thank you for visiting our clinic.",
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
      await onSave({ billingSettings: formData });
      setMessage("Billing settings updated successfully.");
    } catch (err) {
      setError("Unable to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Billing Settings</h3>
      
      {message && <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">{message}</div>}
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select name="currency" value={formData.currency} onChange={handleChange} className="w-1/2 text-sm border-gray-300 rounded-md">
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
            <input type="text" name="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} required className="w-full text-sm border-gray-300 rounded-md uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Prefix</label>
            <input type="text" name="paymentReceiptPrefix" value={formData.paymentReceiptPrefix} onChange={handleChange} required className="w-full text-sm border-gray-300 rounded-md uppercase" />
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t">
          <label className="flex items-center">
            <input type="checkbox" name="taxEnabled" checked={formData.taxEnabled} onChange={handleChange} className="rounded text-indigo-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Enable Tax on Invoices</span>
          </label>
          
          {formData.taxEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Percentage (%)</label>
              <input type="number" name="defaultTaxPercentage" value={formData.defaultTaxPercentage} onChange={handleChange} min="0" max="100" step="0.01" className="w-1/3 text-sm border-gray-300 rounded-md" />
            </div>
          )}
        </div>

        <div className="pt-3 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Footer Message</label>
          <textarea name="invoiceFooter" value={formData.invoiceFooter} onChange={handleChange} rows="2" className="w-full text-sm border-gray-300 rounded-md"></textarea>
          <p className="text-xs text-gray-500 mt-1">This message will appear at the bottom of printed invoices.</p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
