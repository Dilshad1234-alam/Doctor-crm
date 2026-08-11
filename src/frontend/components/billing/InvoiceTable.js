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
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-500 font-medium">No invoices found.</p>
        <p className="text-sm text-gray-400 mt-1">Create an invoice from a completed consultation or appointment.</p>
      </div>
    );
  }

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((inv) => (
            <tr key={inv._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                <Link href={`/dashboard/billing/invoices/${inv._id}`}>{inv.invoiceCode}</Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.createdAt)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{inv.patientId?.fullName}</div>
                <div className="text-xs text-gray-500">{inv.patientId?.patientCode}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dr. {inv.doctorId?.userId?.name || inv.doctorId?.specialization || "Unknown"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatCurrency(inv.totalAmount)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">{formatCurrency(inv.paidAmount)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">{formatCurrency(inv.pendingAmount)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <InvoiceStatusBadge status={inv.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/dashboard/billing/invoices/${inv._id}`}>
                  <Button variant="secondary" size="sm">View</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
