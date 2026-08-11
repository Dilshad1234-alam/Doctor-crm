"use client";

import Link from "next/link";


export default function PatientTable({ patients }) {
  if (!patients || patients.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50/50 text-gray-500 border-y border-gray-100">
          <tr>
            <th className="px-8 py-4 font-bold tracking-wider uppercase text-xs">Patient</th>
            <th className="px-8 py-4 font-bold tracking-wider uppercase text-xs">Patient ID</th>
            <th className="px-8 py-4 font-bold tracking-wider uppercase text-xs">Phone</th>
            <th className="px-8 py-4 font-bold tracking-wider uppercase text-xs">Age/Gender</th>
            <th className="px-8 py-4 font-bold tracking-wider uppercase text-xs">Blood Group</th>
            <th className="px-8 py-4 font-bold tracking-wider uppercase text-xs text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {patients.map((patient) => (
            <tr key={patient._id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="px-8 py-5">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 group-hover:text-[#15558d] transition-colors">{patient.fullName}</span>
                  {patient.email && <span className="text-xs font-medium text-gray-500 mt-0.5">{patient.email}</span>}
                </div>
              </td>
              <td className="px-8 py-5">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                  {patient.patientCode}
                </span>
              </td>
              <td className="px-8 py-5 text-sm font-medium text-gray-600">{patient.phone}</td>
              <td className="px-8 py-5 text-sm font-medium text-gray-600">
                {patient.age !== undefined && patient.age !== null ? patient.age : '--'} / {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '--'}
              </td>
              <td className="px-8 py-5 text-sm font-bold text-gray-600">
                {patient.bloodGroup || '--'}
              </td>
              <td className="px-8 py-5">
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/dashboard/patients/${patient._id}`} className="text-[#15558d] hover:text-[#2ab5e1] font-bold transition-colors">
                    View
                  </Link>
                  <Link href={`/dashboard/patients/${patient._id}/edit`} className="text-indigo-500 hover:text-indigo-700 font-bold transition-colors">
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
