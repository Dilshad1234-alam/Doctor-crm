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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
      <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase relative z-10">Today's Collection</p>
        <p className="text-3xl font-black text-gray-900 mt-1 relative z-10">{formatCurrency(data.todayCollection)}</p>
      </div>
      <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-teal-50 rounded-full opacity-50"></div>
        <p className="text-xs font-bold tracking-widest text-teal-600/70 uppercase relative z-10">Total Invoiced</p>
        <p className="text-3xl font-black text-gray-900 mt-1 relative z-10">{formatCurrency(data.totalInvoiced)}</p>
      </div>
      <div className="bg-white p-6 rounded-[1.5rem] border border-red-100 bg-red-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-100 rounded-full opacity-50"></div>
        <p className="text-xs font-bold tracking-widest text-red-500 uppercase relative z-10">Pending</p>
        <p className="text-3xl font-black text-red-600 mt-1 relative z-10">{formatCurrency(data.pendingAmount)}</p>
      </div>
      <div className="bg-white p-6 rounded-[1.5rem] border border-green-100 bg-green-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-100 rounded-full opacity-50"></div>
        <p className="text-xs font-bold tracking-widest text-green-600/70 uppercase relative z-10">Paid</p>
        <p className="text-3xl font-black text-green-600 mt-1 relative z-10">{data.paidInvoices}</p>
      </div>
      <div className="bg-white p-6 rounded-[1.5rem] border border-yellow-100 bg-yellow-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-100 rounded-full opacity-50"></div>
        <p className="text-xs font-bold tracking-widest text-yellow-600/70 uppercase relative z-10">Partially Paid</p>
        <p className="text-3xl font-black text-yellow-600 mt-1 relative z-10">{data.partiallyPaidInvoices}</p>
      </div>
    </div>
  );
}
