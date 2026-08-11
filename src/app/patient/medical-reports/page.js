import { FileText } from "lucide-react";

export const metadata = {
  title: "Medical Reports | Patient Portal",
};

export default function PatientReportsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
        <p className="text-gray-600">View and download your test results and clinical reports.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Medical Reports</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You don't have any medical reports uploaded to your account.
        </p>
      </div>
    </div>
  );
}
