"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import InvoiceStatusBadge from "@/frontend/components/billing/InvoiceStatusBadge";
import RecordPaymentModal from "@/frontend/components/billing/RecordPaymentModal";
import InvoicePrintView from "@/frontend/components/billing/InvoicePrintView";
import { getInvoiceById, recordPayment, getPayments } from "@/frontend/services/billingApi";

export default function InvoiceDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const invoiceId = unwrappedParams.invoiceId;
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Hardcoded for print demo. Ideally fetched from context/API.
  const clinicInfo = {
    name: "Doctor CRM Clinic",
    address: "123 Medical Center Drive, Health City",
    phone: "+91 9876543210"
  };

  const fetchData = async () => {
    try {
      const data = await getInvoiceById(invoiceId);
      setInvoice(data.invoice);
      
      const paymentsData = await getPayments(invoiceId);
      setPayments(paymentsData.payments || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load invoice details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPaymentSubmit = async (payload) => {
    await recordPayment(invoiceId, payload);
    await fetchData(); // Refresh
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Invoice...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>;

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      {/* Hide layout on print, show print view */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
        }
      `}} />

      <div className="no-print">
        <div className="flex justify-between items-center mb-6">
          <PageHeader 
            title={`Invoice ${invoice.invoiceCode}`} 
            description={`Generated on ${formatDate(invoice.createdAt)}`} 
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint}>Print Invoice</Button>
            {invoice.pendingAmount > 0 && invoice.status !== "cancelled" && (
              <Button onClick={() => setIsPaymentModalOpen(true)}>Record Payment</Button>
            )}
          </div>
        </div>

        {/* Status Header */}
        <div className="bg-white border rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="mt-1"><InvoiceStatusBadge status={invoice.status} /></div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Balance Due</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(invoice.pendingAmount)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Patient Details */}
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Billed To</h3>
            <p className="font-bold text-gray-900 text-lg">{invoice.patientId?.fullName}</p>
            <p className="text-sm text-gray-600">Patient ID: {invoice.patientId?.patientCode}</p>
            <p className="text-sm text-gray-600">Phone: {invoice.patientId?.phone || "N/A"}</p>
          </div>
          {/* Appointment Details */}
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Treatment Details</h3>
            <p className="font-bold text-gray-900">Dr. {invoice.doctorId?.userId?.name || invoice.doctorId?.specialization || "Unknown"}</p>
            <p className="text-sm text-gray-600">Appointment: {invoice.appointmentId?.appointmentCode}</p>
            {invoice.consultationId && <p className="text-sm text-gray-600">Consultation: {invoice.consultationId?.consultationCode}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white border rounded-lg shadow-sm p-5 mb-6 overflow-x-auto">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Invoice Items</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 text-xs font-medium text-gray-500">Description</th>
                <th className="py-2 text-xs font-medium text-gray-500 text-center">Qty</th>
                <th className="py-2 text-xs font-medium text-gray-500 text-right">Rate</th>
                <th className="py-2 text-xs font-medium text-gray-500 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-0">
                  <td className="py-3">
                    <p className="font-medium text-gray-900 text-sm">{item.description}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                  </td>
                  <td className="py-3 text-center text-sm text-gray-700">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-gray-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right font-medium text-gray-900 text-sm">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount?.amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(invoice.discount.amount)}</span>
                </div>
              )}
              {invoice.tax?.amount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({invoice.tax.percentage}%)</span>
                  <span>{formatCurrency(invoice.tax.amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                <span>Grand Total</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-blue-700 pt-2">
                <span>Paid</span>
                <span className="font-medium">{formatCurrency(invoice.paidAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-2 px-3 text-xs font-medium text-gray-500">Date</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500">Receipt</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500">Method</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500">Ref</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => (
                    <tr key={pay._id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-3 text-sm text-gray-600">{formatDate(pay.paidAt)}</td>
                      <td className="py-3 px-3 text-sm font-medium text-indigo-600">{pay.paymentCode}</td>
                      <td className="py-3 px-3 text-sm text-gray-600 uppercase">{pay.paymentMethod.replace("_", " ")}</td>
                      <td className="py-3 px-3 text-sm text-gray-600">{pay.referenceNumber || "-"}</td>
                      <td className="py-3 px-3 text-sm font-bold text-blue-700 text-right">{formatCurrency(pay.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <InvoicePrintView invoice={invoice} clinicInfo={clinicInfo} />
      
      <RecordPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        invoice={invoice} 
        onSubmit={handleRecordPaymentSubmit} 
      />
    </div>
  );
}
