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
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Medical Reports</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">View all uploaded patient medical reports across the clinic.</p>
        </div>
        <Button variant="outline" onClick={fetchReports} disabled={loading} className="shadow-sm rounded-xl">
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 shadow-sm border border-red-100 font-medium">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Report Code</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title / Type</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Review Status</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-500 font-bold animate-pulse">Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-500 font-medium text-lg">No medical reports found.</td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-900 bg-gray-100 inline-flex items-center justify-center px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 group-hover:bg-white transition-colors">{r.reportCode}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="text-sm font-bold text-gray-900 group-hover:text-[#15558d] transition-colors">{r.title}</div>
                       <div className="text-xs font-medium text-gray-500 capitalize mt-0.5">{r.reportType.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="text-sm font-bold text-gray-900">{r.patientId?.fullName || "Unknown"}</div>
                       <div className="text-xs font-medium text-gray-500 mt-0.5">{r.patientId?.patientCode}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                      {new Date(r.reportDate).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <ReportStatusBadge status={r.reviewStatus} />
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold">
                      <Link href={`/dashboard/medical-reports/${r._id}`} className="text-[#15558d] hover:text-[#2ab5e1] transition-colors">
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
