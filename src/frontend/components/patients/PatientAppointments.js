"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPatientAppointments } from "@/frontend/services/appointmentApi";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export default function PatientAppointments({ patientId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getPatientAppointments(patientId);
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetchAppointments();
    }
  }, [patientId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading appointments...</div>;
  }

  return (
    <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={18} /></div>
          Appointments
        </h3>
        <Link href={`/dashboard/appointments/new?patientId=${patientId}`} className="flex items-center px-4 py-2 bg-gradient-to-r from-[#0f3d69] to-[#15558d] hover:from-[#15558d] hover:to-[#2ab5e1] text-white rounded-xl font-bold text-sm transition-all shadow-sm">
          Book New
        </Link>
      </div>
      
      {appointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Date & Time</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Doctor</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Reason</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-4 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((a) => (
                <tr key={a._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-4 py-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {new Date(a.date).toLocaleDateString()} {a.startTime}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-600">
                    Dr. {a.doctorId?.userId?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-600 truncate max-w-[200px]">
                    {a.reason || "N/A"}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize border 
                     ${a.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                       a.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                       a.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                       'bg-gray-50 text-gray-700 border-gray-200'}`}>
                     {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold">
                    <Link href={`/dashboard/appointments?search=${a.appointmentCode}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-100 bg-gray-50/50 rounded-2xl">
          <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Calendar size={24} />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">No appointments found</p>
          <p className="text-sm font-medium text-gray-500">There are no appointments recorded for this patient.</p>
        </div>
      )}
    </div>
  );
}
