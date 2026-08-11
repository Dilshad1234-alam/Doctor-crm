import { Activity } from "lucide-react";

export const metadata = {
  title: "Billing & Payments | Patient Portal",
};

export default function PatientBillingPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600">Track your consultation invoices and payment history.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Billing Records</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You have no pending invoices or payment history on this account.
        </p>
      </div>
    </div>
  );
}
