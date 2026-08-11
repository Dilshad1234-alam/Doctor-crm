import React from "react";

export default function InvoicePrintView({ invoice, clinicInfo }) {
  if (!invoice) return null;

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-IN");

  return (
    <div className="print-only p-8 bg-white text-black font-sans w-full max-w-4xl mx-auto" style={{ display: 'none' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{clinicInfo?.name || "Doctor CRM Clinic"}</h1>
          <p className="text-sm text-gray-600">{clinicInfo?.address || "123 Medical Center Drive"}</p>
          <p className="text-sm text-gray-600">Phone: {clinicInfo?.phone || "+91 9876543210"}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest mb-2">INVOICE</h2>
          <p className="font-medium text-gray-800 text-lg">{invoice.invoiceCode}</p>
          <p className="text-sm text-gray-600">Date: {formatDate(invoice.createdAt)}</p>
          {invoice.status === "paid" && <p className="text-sm font-bold text-green-600 mt-2 uppercase border-2 border-green-600 inline-block px-2 py-1 transform -rotate-12">PAID</p>}
        </div>
      </div>

      {/* Patient & Doctor Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Billed To</h3>
          <p className="font-bold text-gray-900 text-lg">{invoice.patientId?.fullName}</p>
          <p className="text-sm text-gray-600">Patient ID: {invoice.patientId?.patientCode}</p>
          {invoice.patientId?.phone && <p className="text-sm text-gray-600">Phone: {invoice.patientId?.phone}</p>}
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Treatment Details</h3>
          <p className="font-bold text-gray-900">Dr. {invoice.doctorId?.userId?.name || invoice.doctorId?.specialization || "Unknown"}</p>
          <p className="text-sm text-gray-600">Appointment: {invoice.appointmentId?.appointmentCode}</p>
          {invoice.consultationId && <p className="text-sm text-gray-600">Consultation: {invoice.consultationId?.consultationCode}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-3 px-2 font-bold text-gray-800 uppercase text-sm">Description</th>
              <th className="py-3 px-2 font-bold text-gray-800 uppercase text-sm text-center">Qty</th>
              <th className="py-3 px-2 font-bold text-gray-800 uppercase text-sm text-right">Rate</th>
              <th className="py-3 px-2 font-bold text-gray-800 uppercase text-sm text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 px-2">
                  <p className="font-medium text-gray-800">{item.description}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                </td>
                <td className="py-3 px-2 text-center text-gray-700">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 px-2 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="text-gray-800 font-medium">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discount?.amount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200 text-red-600">
              <span>Discount</span>
              <span>-{formatCurrency(invoice.discount.amount)}</span>
            </div>
          )}
          {invoice.tax?.amount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Tax ({invoice.tax.percentage}%)</span>
              <span className="text-gray-800">{formatCurrency(invoice.tax.amount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b-2 border-gray-800 text-lg font-bold text-gray-900">
            <span>Grand Total</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          
          <div className="flex justify-between py-2 mt-2">
            <span className="text-green-700 font-medium">Amount Paid</span>
            <span className="text-green-700 font-bold">{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between py-2 bg-gray-100 px-2 rounded">
            <span className="text-gray-900 font-bold">Balance Due</span>
            <span className="text-red-600 font-bold">{formatCurrency(invoice.pendingAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-6 text-sm text-gray-500 text-center">
        <p>This is a computer generated invoice and does not require a signature.</p>
        <p className="mt-1">Thank you for your visit!</p>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible !important; }
          .print-only {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          @page { size: auto; margin: 0mm; }
        }
      `}} />
    </div>
  );
}
