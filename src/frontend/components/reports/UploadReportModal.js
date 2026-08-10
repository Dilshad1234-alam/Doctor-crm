"use client";

import React, { useState, useEffect } from "react";
import Button from "@/frontend/components/ui/Button";
import { uploadReport, getPatientTests } from "@/frontend/services/reportApi";

const REPORT_TYPES = [
  { value: "blood_test", label: "Blood Test" },
  { value: "xray", label: "X-Ray" },
  { value: "mri", label: "MRI" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "ultrasound", label: "Ultrasound" },
  { value: "ecg", label: "ECG" },
  { value: "pathology", label: "Pathology" },
  { value: "prescription", label: "External Prescription" },
  { value: "other", label: "Other" }
];

export default function UploadReportModal({ patientId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tests, setTests] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    reportType: "blood_test",
    reportDate: new Date().toISOString().split("T")[0],
    notes: "",
    recommendedTestId: ""
  });
  
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Fetch pending tests to link
    getPatientTests(patientId, "status=pending")
      .then(setTests)
      .catch(() => setTests([]));
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("reportType", formData.reportType);
      data.append("reportDate", formData.reportDate);
      if (formData.notes) data.append("notes", formData.notes);
      if (formData.recommendedTestId) data.append("recommendedTestId", formData.recommendedTestId);
      data.append("file", file);

      await uploadReport(patientId, data);
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to upload report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Upload Medical Report</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link to Recommended Test (Optional)</label>
            <select 
              name="recommendedTestId" 
              value={formData.recommendedTestId} 
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Do not link --</option>
              {tests.map(test => (
                <option key={test._id} value={test._id}>
                  {test.name} (Ordered {new Date(test.recommendedAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="title" 
              required 
              value={formData.title} 
              onChange={handleChange}
              placeholder="e.g. Complete Blood Count Results"
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type <span className="text-red-500">*</span></label>
              <select 
                name="reportType" 
                required 
                value={formData.reportType} 
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {REPORT_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="reportDate" 
                required 
                value={formData.reportDate} 
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Upload (PDF, JPG, PNG) <span className="text-red-500">*</span></label>
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              required 
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Max recommended size: 10MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea 
              name="notes" 
              rows="3" 
              value={formData.notes} 
              onChange={handleChange}
              placeholder="Any remarks about this report..."
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Uploading..." : "Upload Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
