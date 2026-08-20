import { Activity, Download, CheckCircle2, Clock } from "lucide-react";
import { connectDB } from "@/backend/database/connectDB";
import Invoice from "@/backend/models/Invoice";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";

export const metadata = {
  title: "Billing & Payments | Patient Portal",
};

export default async function PatientBillingPage() {
  await connectDB();
  const authUser = await getAuthenticatedUser();
  
  let invoices = [];
  if (authUser && authUser.patientId) {
    invoices = await Invoice.find({ patientId: authUser.patientId })
      .populate('clinicId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .lean();
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600">Track your consultation invoices and payment history.</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Billing Records</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You have no pending invoices or payment history on this account.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Clinic & Doctor</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{inv.invoiceCode}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(inv.issuedAt || inv.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{inv.clinicId?.name}</div>
                      <div className="text-xs text-gray-500">Dr. {inv.doctorId?.name || inv.doctorId?.specialization || 'Consultation'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-gray-900">₹{inv.totalAmount}</div>
                    </td>
                    <td className="px-6 py-4">
                      {inv.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase tracking-wider">
                          <Clock className="w-3 h-3" /> {inv.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1 transition-colors">
                        <Download className="w-4 h-4" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
