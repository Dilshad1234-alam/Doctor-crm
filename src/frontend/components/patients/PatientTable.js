"use client";

import Link from "next/link";


export default function PatientTable({ patients }) {
  if (!patients || patients.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50/80 text-gray-500 border-y border-gray-200">
          <tr>
            <th className="px-6 py-4 font-medium tracking-wider">Patient</th>
            <th className="px-6 py-4 font-medium tracking-wider">Patient ID</th>
            <th className="px-6 py-4 font-medium tracking-wider">Phone</th>
            <th className="px-6 py-4 font-medium tracking-wider">Age/Gender</th>
            <th className="px-6 py-4 font-medium tracking-wider">Blood Group</th>
            <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {patients.map((patient) => (
            <tr key={patient._id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{patient.fullName}</span>
                  {patient.email && <span className="text-xs text-gray-500">{patient.email}</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  {patient.patientCode}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{patient.phone}</td>
              <td className="px-6 py-4 text-gray-600">
                {patient.age !== undefined && patient.age !== null ? patient.age : '--'} / {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '--'}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {patient.bloodGroup || '--'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/dashboard/patients/${patient._id}`} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    View
                  </Link>
                  <Link href={`/dashboard/patients/${patient._id}/edit`} className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
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
