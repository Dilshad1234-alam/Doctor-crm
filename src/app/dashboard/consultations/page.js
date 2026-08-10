"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import { getConsultations } from "@/frontend/services/consultationApi";
import Button from "@/frontend/components/ui/Button";

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const data = await getConsultations();
      setConsultations(data);
    } catch (err) {
      setError(err.message || "Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Consultations" description="Manage medical consultations." />
        <Button variant="outline" onClick={fetchConsultations} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">{error}</div>}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 animate-pulse">Loading consultations...</td></tr>
              ) : consultations.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No consultations found.</td></tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{c.patient?.fullName || "Unknown Patient"}</div>
                       <div className="text-xs text-gray-500">ID: {c.patient?.patientCode || c.patient}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${c.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                         {c.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {c.status === "completed" ? (
                        <Link href={`/dashboard/consultations/${c.id}`} className="text-indigo-600 hover:text-indigo-900">
                          View Summary
                        </Link>
                      ) : (
                        <Link href={`/dashboard/consultations/${c.id}`} className="text-blue-600 hover:text-blue-900 font-bold">
                          Resume Consultation
                        </Link>
                      )}
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
