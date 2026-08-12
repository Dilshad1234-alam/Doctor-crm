"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getInvoices } from "@/frontend/services/billingApi";
import { Receipt, FileText } from "lucide-react";

export default function PatientBilling({ patientId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices({ patientId });
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetchInvoices();
    }
  }, [patientId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading billing data...</div>;
  }

  return (
    <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Receipt size={18} /></div>
          Billing History
        </h3>
      </div>
      
      {invoices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Invoice Code</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Date</th>
                <th className="px-4 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Total</th>
                <th className="px-4 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Paid</th>
                <th className="px-4 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Pending</th>
                <th className="px-4 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-4 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-4 py-4 font-bold text-gray-900">{inv.invoiceCode}</td>
                  <td className="px-4 py-4 font-medium text-gray-600">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 font-bold text-gray-900 text-right">${inv.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-4 font-medium text-green-600 text-right">${inv.paidAmount?.toFixed(2)}</td>
                  <td className="px-4 py-4 font-bold text-red-600 text-right">${inv.pendingAmount?.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize border 
                     ${inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 
                       inv.status === 'partially_paid' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                       'bg-red-50 text-red-700 border-red-200'}`}>
                     {inv.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold">
                    <Link href={`/dashboard/billing?search=${inv.invoiceCode}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-100 bg-gray-50/50 rounded-2xl">
          <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Receipt size={24} />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">No invoices found</p>
          <p className="text-sm font-medium text-gray-500">There is no billing history for this patient.</p>
        </div>
      )}
    </div>
  );
}
