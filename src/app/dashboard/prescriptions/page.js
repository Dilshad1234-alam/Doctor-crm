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
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Prescriptions</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">View and manage patient prescriptions.</p>
        </div>
        <Button variant="outline" onClick={fetchPrescriptions} disabled={loading} className="shadow-sm rounded-xl">
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 shadow-sm border border-red-100 font-medium">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">RX Code</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-500 font-bold animate-pulse">Loading prescriptions...</td></tr>
              ) : prescriptions.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-500 font-medium text-lg">No prescriptions found.</td></tr>
              ) : (
                prescriptions.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-900 bg-gray-100 inline-flex items-center justify-center px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 group-hover:bg-white transition-colors">{p.prescriptionCode}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="text-sm font-bold text-gray-900 group-hover:text-[#15558d] transition-colors">{p.patient?.fullName || "Unknown"}</div>
                       <div className="text-xs font-medium text-gray-500 mt-0.5">{p.patient?.patientCode}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="text-sm font-bold text-gray-900">{p.doctor?.userId?.name || "Unknown"}</div>
                       <div className="text-xs font-medium text-gray-500 mt-0.5">{p.doctor?.specialization}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className={`px-3 py-1 rounded-md text-xs font-bold capitalize border
                         ${p.status === 'finalized' ? 'bg-green-50 text-green-700 border-green-200' : 
                           p.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                         {p.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold">
                      {p.status === "draft" ? (
                        <Link href={`/dashboard/consultations/${p.consultationId}/prescription`} className="text-[#15558d] hover:text-[#2ab5e1] transition-colors">
                          Edit Draft
                        </Link>
                      ) : (
                        <Link href={`/dashboard/prescriptions/${p.id}`} className="text-indigo-500 hover:text-indigo-700 transition-colors">
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
