import { Calendar } from "lucide-react";

export const metadata = {
  title: "Book Appointment | Patient Portal",
};

export default function BookAppointmentPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600">Find a doctor and schedule your consultation.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Booking System Coming Soon</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The public clinic directory and booking flow is currently under development. Please check back later or contact your clinic directly to book.
        </p>
      </div>
    </div>
  );
}
