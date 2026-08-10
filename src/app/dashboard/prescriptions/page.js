"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import { getPrescriptions } from "@/frontend/services/prescriptionApi";
import Button from "@/frontend/components/ui/Button";

export default function PrescriptionsListPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Prescriptions" description="View and manage patient prescriptions." />
        <Button variant="outline" onClick={fetchPrescriptions} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">{error}</div>}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RX Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500 animate-pulse">Loading prescriptions...</td></tr>
              ) : prescriptions.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No prescriptions found.</td></tr>
              ) : (
                prescriptions.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {p.prescriptionCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{p.patient?.fullName || "Unknown"}</div>
                       <div className="text-xs text-gray-500">{p.patient?.patientCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{p.doctor?.userId?.name || "Unknown"}</div>
                       <div className="text-xs text-gray-500">{p.doctor?.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                         ${p.status === 'finalized' ? 'bg-green-100 text-green-800' : 
                           p.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                         {p.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {p.status === "draft" ? (
                        <Link href={`/dashboard/consultations/${p.consultationId}/prescription`} className="text-blue-600 hover:text-blue-900">
                          Edit Draft
                        </Link>
                      ) : (
                        <Link href={`/dashboard/prescriptions/${p.id}`} className="text-indigo-600 hover:text-indigo-900">
                          View / Print
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
