import React, { useState } from "react";
import Button from "@/frontend/components/ui/Button";

export default function RecordPaymentModal({ isOpen, onClose, invoice, onSubmit }) {
  const [amount, setAmount] = useState(invoice?.pendingAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync amount when invoice changes or modal opens
  React.useEffect(() => {
    if (isOpen && invoice) {
      setAmount(invoice.pendingAmount);
      setPaymentMethod("upi");
      setReferenceNumber("");
      setNotes("");
      setError("");
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payAmount = Number(amount);
    if (payAmount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (payAmount > invoice.pendingAmount + 0.01) {
      setError(`Payment cannot exceed pending amount (₹${invoice.pendingAmount}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: payAmount,
        paymentMethod,
        referenceNumber,
        notes
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Record Payment</h2>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200 flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Invoice Total</p>
            <p className="font-bold text-gray-900">₹{invoice.totalAmount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Pending Amount</p>
            <p className="font-bold text-red-600">₹{invoice.pendingAmount}</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              max={invoice.pendingAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              required
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UPI transaction ID (Optional)"
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
