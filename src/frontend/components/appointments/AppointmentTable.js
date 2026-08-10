import Link from "next/link";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import { Eye, Calendar, XCircle, UserX } from "lucide-react";

export default function AppointmentTable({ appointments, role, onReschedule, onCancel, onNoShow }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by booking a new appointment.</p>
      </div>
    );
  }

  const formatVisitType = (type) => {
    return type ? type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "N/A";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((apt) => (
            <tr key={apt._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{formatDate(apt.appointmentDate)}</div>
                <div className="text-sm text-gray-500">{apt.startTime} - {apt.endTime}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {apt.appointmentCode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{apt.patientId?.fullName || "Unknown"}</div>
                <div className="text-sm text-gray-500">{apt.patientId?.phone || "N/A"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{apt.doctorId?.userId?.name || "Unknown"}</div>
                <div className="text-sm text-gray-500">{apt.doctorId?.specialization || "N/A"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatVisitType(apt.visitType)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <AppointmentStatusBadge status={apt.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link href={`/dashboard/appointments/${apt._id}`} className="text-blue-600 hover:text-blue-900" title="View Details">
                    <Eye className="w-5 h-5" />
                  </Link>
                  {["scheduled", "confirmed"].includes(apt.status) && (
                    <>
                      <button onClick={() => onReschedule && onReschedule(apt)} className="text-indigo-600 hover:text-indigo-900" title="Reschedule">
                        <Calendar className="w-5 h-5" />
                      </button>
                      <button onClick={() => onCancel && onCancel(apt)} className="text-red-600 hover:text-red-900" title="Cancel">
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => onNoShow && onNoShow(apt)} className="text-gray-500 hover:text-gray-700" title="Mark No Show">
                        <UserX className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
