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
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Consultations</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Manage medical consultations.</p>
        </div>
        <Button variant="outline" onClick={fetchConsultations} disabled={loading} className="shadow-sm rounded-xl">
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 shadow-sm border border-red-100 font-medium">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-500 font-bold animate-pulse">Loading consultations...</td></tr>
              ) : consultations.length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-500 font-medium text-lg">No consultations found.</td></tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="text-sm font-bold text-gray-900 group-hover:text-[#15558d] transition-colors">{c.patient?.fullName || "Unknown Patient"}</div>
                       <div className="text-xs font-medium text-gray-500 mt-0.5">ID: {c.patient?.patientCode || c.patient}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className={`px-3 py-1 rounded-md text-xs font-bold capitalize border ${c.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                         {c.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold">
                      {c.status === "completed" ? (
                        <Link href={`/dashboard/consultations/${c.id}`} className="text-indigo-500 hover:text-indigo-700 transition-colors">
                          View Summary
                        </Link>
                      ) : (
                        <Link href={`/dashboard/consultations/${c.id}`} className="text-[#15558d] hover:text-[#2ab5e1] font-black transition-colors">
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
