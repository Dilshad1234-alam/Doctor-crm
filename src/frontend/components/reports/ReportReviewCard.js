"use client";

import React, { useState } from "react";
import Button from "@/frontend/components/ui/Button";
import { reviewReport } from "@/frontend/services/reportApi";

export default function ReportReviewCard({ report, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Review notes are required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await reviewReport(report._id, { doctorReviewNotes: notes });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (report.reviewStatus === "reviewed") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-green-900 uppercase tracking-wider mb-4">Doctor's Review</h3>
        <div className="bg-white p-4 rounded-lg text-sm text-gray-800 border border-green-100 mb-4 whitespace-pre-wrap">
          {report.doctorReviewNotes}
        </div>
        <div className="flex items-center text-xs text-green-700 font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Reviewed by Dr. {report.reviewedByDoctorId?.userId?.name || "Unknown"} on {new Date(report.reviewedAt).toLocaleDateString()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-blue-200 shadow-sm rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Submit Clinical Review</h3>
      <p className="text-sm text-gray-500 mb-4">Add your medical interpretation and notes for this report.</p>
      
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
        
        <textarea
          rows="4"
          required
          placeholder="e.g. CBC is within normal limits. Continue current medication."
          className="w-full border-gray-300 rounded-lg text-sm mb-4 focus:ring-blue-500 focus:border-blue-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
        
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Submitting..." : "Mark as Reviewed"}
          </Button>
        </div>
      </form>
    </div>
  );
}
