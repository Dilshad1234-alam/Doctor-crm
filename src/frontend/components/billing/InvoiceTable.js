import React from "react";
import Link from "next/link";
import Button from "@/frontend/components/ui/Button";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

export default function InvoiceTable({ invoices, loading }) {
  if (loading) {
    return <div className="text-center p-8 text-gray-500 animate-pulse">Loading invoices...</div>;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center p-20 border border-gray-100 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🧾</div>
        <p className="text-lg font-bold text-gray-900 tracking-tight">No invoices found.</p>
        <p className="text-sm font-medium text-gray-500 mt-1">Create an invoice from a completed consultation or appointment.</p>
      </div>
    );
  }

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
            <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
            <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</th>
            <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {invoices.map((inv) => (
            <tr key={inv._id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-indigo-600">
                <Link href={`/dashboard/billing/invoices/${inv._id}`} className="hover:text-indigo-800 transition-colors">{inv.invoiceCode}</Link>
              </td>
              <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">{formatDate(inv.createdAt)}</td>
              <td className="px-8 py-5 whitespace-nowrap">
                <div className="text-sm font-bold text-gray-900 group-hover:text-[#15558d] transition-colors">{inv.patientId?.name || inv.patientId?.fullName || "Unknown Patient"}</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">{inv.patientId?.patientIdString || inv.patientId?.patientCode || inv.patientId?.email || inv.patientId?.phone || "N/A"}</div>
              </td>
              <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                {inv.doctorId?.name ? (inv.doctorId.name.startsWith("Dr.") ? inv.doctorId.name : `Dr. ${inv.doctorId.name}`) : (inv.doctorId?.userId?.name ? `Dr. ${inv.doctorId.userId.name}` : `Dr. ${inv.doctorId?.specialization || "Unknown"}`)}
              </td>
              <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-gray-900 text-right">{formatCurrency(inv.totalAmount)}</td>
              <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-blue-600 text-right">{formatCurrency(inv.paidAmount)}</td>
              <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-red-600 text-right">{formatCurrency(inv.pendingAmount)}</td>
              <td className="px-8 py-5 whitespace-nowrap text-center">
                <InvoiceStatusBadge status={inv.status} />
              </td>
              <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold">
                <Link href={`/dashboard/billing/invoices/${inv._id}`} className="text-[#15558d] hover:text-[#2ab5e1] transition-colors">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
