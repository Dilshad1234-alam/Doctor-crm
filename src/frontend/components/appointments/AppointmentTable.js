import Link from "next/link";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import { Eye, Calendar, XCircle, UserX } from "lucide-react";

export default function AppointmentTable({ appointments, role, onReschedule, onCancel, onNoShow, onCheckIn }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mt-2 text-lg font-bold text-gray-900 tracking-tight">No appointments found</h3>
        <p className="mt-1 text-sm font-medium text-gray-500">Get started by booking a new appointment.</p>
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
    <div className="overflow-x-auto bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Appointment ID</th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Visit Type</th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {appointments.map((apt) => (
            <tr key={apt._id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="px-8 py-5 whitespace-nowrap">
                <div className="text-sm font-bold text-gray-900">{formatDate(apt.appointmentDate)}</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">{apt.startTime} - {apt.endTime}</div>
              </td>
              <td className="px-8 py-5 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                  {apt.appointmentCode}
                </span>
              </td>
              <td className="px-8 py-5 whitespace-nowrap">
                <div className="text-sm font-bold text-gray-900 group-hover:text-[#15558d] transition-colors">{apt.patientId?.fullName || "Unknown"}</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">{apt.patientId?.phone || "N/A"}</div>
              </td>
              <td className="px-8 py-5 whitespace-nowrap">
                <div className="text-sm font-bold text-gray-900">{apt.doctorId?.userId?.name || "Unknown"}</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">{apt.doctorId?.specialization || "N/A"}</div>
              </td>
              <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-600">
                {formatVisitType(apt.visitType)}
              </td>
              <td className="px-8 py-5 whitespace-nowrap">
                <AppointmentStatusBadge status={apt.status} />
              </td>
              <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold">
                <div className="flex justify-end space-x-2">
                  <Link href={`/dashboard/appointments/${apt._id}`} className="text-blue-600 hover:text-blue-900" title="View Details">
                    <Eye className="w-5 h-5" />
                  </Link>
                  {["scheduled", "confirmed"].includes(apt.status) && (
                    <>
                      {onCheckIn && (
                        <button onClick={() => onCheckIn(apt)} className="text-teal-600 hover:text-teal-900" title="Check In">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                      )}
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
