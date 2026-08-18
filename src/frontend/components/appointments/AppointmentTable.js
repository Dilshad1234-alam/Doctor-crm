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
    <div className="overflow-x-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-sm max-h-[600px] overflow-y-auto">
      <table className="min-w-full divide-y divide-[#E2E8F0] relative">
        <thead className="bg-[#F8FAFC] sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Date & Time</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Appointment ID</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Patient</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Doctor</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Visit Type</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 text-right text-xs font-bold text-[#64748B] uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#E2E8F0]">
          {appointments.map((apt) => (
            <tr key={apt._id} className="hover:bg-[#F8FAFC] transition-colors group">
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="text-sm font-bold text-[#0F172A]">{formatDate(apt.appointmentDate)}</div>
                <div className="text-xs font-semibold text-[#64748B] mt-0.5">{apt.startTime} - {apt.endTime}</div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                  {apt.appointmentCode}
                </span>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{apt.patientId?.name || apt.patientId?.fullName || "Unknown"}</div>
                <div className="text-xs font-semibold text-[#64748B] mt-0.5">{apt.patientId?.phone || "N/A"}</div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="text-sm font-bold text-[#0F172A]">{apt.doctorId?.name || apt.doctorId?.userId?.name || "Unknown"}</div>
                <div className="text-xs font-semibold text-[#64748B] mt-0.5">{apt.doctorId?.specialization || "N/A"}</div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-sm font-bold text-[#64748B]">
                {formatVisitType(apt.visitType)}
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <AppointmentStatusBadge status={apt.status} />
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-bold">
                <div className="flex justify-end space-x-2">
                  <Link href={`/dashboard/appointments/${apt._id}`} className="p-1 text-[#2563EB] hover:bg-[#EFF6FF] rounded transition-colors" title="View Details">
                    <Eye className="w-4 h-4" />
                  </Link>
                  {["scheduled", "confirmed"].includes(apt.status) && (
                    <>
                      {onCheckIn && (
                        <button onClick={() => onCheckIn(apt)} className="p-1 text-[#2563EB] hover:bg-[#EFF6FF] rounded transition-colors" title="Check In">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                      )}
                      <button onClick={() => onReschedule && onReschedule(apt)} className="p-1 text-[#F59E0B] hover:bg-[#FEF3C7] rounded transition-colors" title="Reschedule">
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button onClick={() => onCancel && onCancel(apt)} className="p-1 text-[#EF4444] hover:bg-[#FEF2F2] rounded transition-colors" title="Cancel">
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => onNoShow && onNoShow(apt)} className="p-1 text-[#64748B] hover:bg-[#F1F5F9] rounded transition-colors" title="Mark No Show">
                        <UserX className="w-4 h-4" />
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
