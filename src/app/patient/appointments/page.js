import { Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Appointments | Patient Portal",
};

export default function PatientAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">View and manage your upcoming and past appointments.</p>
        </div>
        <Link href="/patient/book" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm">
          Book Appointment
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Appointments Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You don't have any appointments scheduled. When you book a consultation, it will appear here.
        </p>
      </div>
    </div>
  );
}
