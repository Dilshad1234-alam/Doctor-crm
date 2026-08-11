import { Pill } from "lucide-react";

export const metadata = {
  title: "My Prescriptions | Patient Portal",
};

export default function PatientPrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-600">Access your active and past prescriptions from your doctors.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pill className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Prescriptions Found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Your doctor has not issued any prescriptions to this account yet.
        </p>
      </div>
    </div>
  );
}
