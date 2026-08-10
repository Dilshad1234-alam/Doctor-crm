import PatientForm from "@/frontend/components/patients/PatientForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewPatientPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
          <p className="text-gray-500 text-sm mt-1">Register a new patient to the clinic.</p>
        </div>
      </div>

      <PatientForm isEdit={false} />
    </div>
  );
}
