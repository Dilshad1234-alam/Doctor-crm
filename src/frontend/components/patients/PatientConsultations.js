"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getConsultations } from "@/frontend/services/consultationApi";
import { FileText, ArrowRight } from "lucide-react";

export default function PatientConsultations({ patientId }) {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await getConsultations(`patientId=${patientId}`);
        setConsultations(data || []);
      } catch (err) {
        console.error("Failed to fetch consultations", err);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetchConsultations();
    }
  }, [patientId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading consultations...</div>;
  }

  return (
    <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={18} /></div>
          Consultations History
        </h3>
      </div>
      
      {consultations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Consultation Code</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Date</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Doctor</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Chief Complaint</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-4 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {consultations.map((c) => (
                <tr key={c._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-4 py-4 font-bold text-gray-900">{c.consultationCode || c._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-4 font-medium text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 font-medium text-gray-600">
                    Dr. {c.doctorId?.userId?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-600 truncate max-w-[200px]">
                    {c.chiefComplaint || "N/A"}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize border 
                     ${c.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                     {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold">
                    {c.status === 'in_progress' ? (
                      <Link href={`/dashboard/consultations/${c._id}?fromPatient=${patientId}`} className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1">
                        Continue <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link href={`/dashboard/consultations/${c._id}?fromPatient=${patientId}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-100 bg-gray-50/50 rounded-2xl">
          <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FileText size={24} />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">No consultations found</p>
          <p className="text-sm font-medium text-gray-500">There are no consultations recorded for this patient.</p>
        </div>
      )}
    </div>
  );
}
