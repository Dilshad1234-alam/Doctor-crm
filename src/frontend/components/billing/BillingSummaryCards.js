import React from "react";

export default function BillingSummaryCards({ summary }) {
  const data = summary || {
    todayCollection: 0,
    totalInvoiced: 0,
    pendingAmount: 0,
    paidInvoices: 0,
    partiallyPaidInvoices: 0
  };

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 font-medium">Today's Collection</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.todayCollection)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 font-medium">Total Invoiced</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.totalInvoiced)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
        <p className="text-xs text-red-500 font-medium">Pending</p>
        <p className="text-xl font-bold text-red-700 mt-1">{formatCurrency(data.pendingAmount)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
        <p className="text-xs text-green-600 font-medium">Paid</p>
        <p className="text-xl font-bold text-green-700 mt-1">{data.paidInvoices}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-yellow-100 shadow-sm">
        <p className="text-xs text-yellow-600 font-medium">Partially Paid</p>
        <p className="text-xl font-bold text-yellow-700 mt-1">{data.partiallyPaidInvoices}</p>
      </div>
    </div>
  );
}
