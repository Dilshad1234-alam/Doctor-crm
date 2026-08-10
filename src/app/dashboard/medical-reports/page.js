"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import { getAllReports } from "@/frontend/services/reportApi";
import Button from "@/frontend/components/ui/Button";
import { ReportStatusBadge } from "@/frontend/components/reports/StatusBadge";

export default function MedicalReportsListPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      setError(err.message || "Failed to load medical reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Medical Reports" description="View all uploaded patient medical reports across the clinic." />
        <Button variant="outline" onClick={fetchReports} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">{error}</div>}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500 animate-pulse">Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No medical reports found.</td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {r.reportCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{r.title}</div>
                       <div className="text-xs text-gray-500 capitalize">{r.reportType.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{r.patientId?.fullName || "Unknown"}</div>
                       <div className="text-xs text-gray-500">{r.patientId?.patientCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(r.reportDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <ReportStatusBadge status={r.reviewStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/medical-reports/${r._id}`} className="text-blue-600 hover:text-blue-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
