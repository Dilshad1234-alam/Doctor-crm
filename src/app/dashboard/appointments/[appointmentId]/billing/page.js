"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { getAppointmentById } from "@/frontend/services/appointmentApi";
import { createInvoice } from "@/frontend/services/billingApi";

export default function CreateInvoicePage({ params }) {
  const unwrappedParams = use(params);
  const appointmentId = unwrappedParams.appointmentId;
  const router = useRouter();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState({ type: "none", value: 0, reason: "" });
  const [tax, setTax] = useState({ enabled: false, percentage: 0 });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const data = await getAppointmentById(appointmentId);
      setAppointment(data);

      // Default item
      const fee = data.doctorId?.consultationFee || 500;
      setItems([{
        type: "consultation",
        description: `Consultation Fee - Dr. ${data.doctorId?.name || data.doctorId?.userId?.name || "Unknown"}`,
        quantity: 1,
        unitPrice: fee
      }]);
    } catch (err) {
      console.error(err);
      setError("Unable to load appointment details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { type: "other", description: "", quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (Math.max(0, item.quantity) * Math.max(0, item.unitPrice)), 0);
  };

  const subtotal = calculateSubtotal();

  const calculateDiscountAmount = () => {
    if (discount.type === "none") return 0;
    if (discount.type === "flat") return Math.min(Number(discount.value), subtotal);
    if (discount.type === "percentage") return (subtotal * Math.min(Number(discount.value), 100)) / 100;
    return 0;
  };

  const discountAmount = calculateDiscountAmount();
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const calculateTaxAmount = () => {
    if (!tax.enabled) return 0;
    return (taxableAmount * Number(tax.percentage)) / 100;
  };

  const taxAmount = calculateTaxAmount();
  const totalAmount = taxableAmount + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please add at least one item to the invoice.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })).filter(i => i.description.trim()),
        discount: {
          ...discount,
          value: Number(discount.value)
        },
        tax: {
          ...tax,
          percentage: Number(tax.percentage)
        },
        notes
      };

      const res = await createInvoice(appointmentId, payload);
      if (res.invoice) {
        router.push(`/dashboard/billing/invoices/${res.invoice._id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create invoice");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      <PageHeader title="Create Invoice" description="Generate an invoice for this appointment." />

      <form onSubmit={handleSubmit}>
        {/* Patient Info */}
        <div className="bg-white border rounded-lg shadow-sm p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
           <div>
             <p className="text-xs text-gray-500">Patient</p>
             <p className="font-bold text-gray-900">{appointment?.patientName || "Unknown Customer"}</p>
           </div>
           <div>
             <p className="text-xs text-gray-500">Patient Phone</p>
             <p className="font-bold text-gray-900">{appointment?.patientPhone || "N/A"}</p>
           </div>
           <div>
             <p className="text-xs text-gray-500">Doctor</p>
             <p className="font-bold text-gray-900">{appointment?.doctorId?.name || appointment?.doctorId?.userId?.name || appointment?.doctorId?.specialization}</p>
           </div>
           <div>
             <p className="text-xs text-gray-500">Appointment Code</p>
             <p className="font-bold text-gray-900">{appointment?.appointmentCode}</p>
           </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white border rounded-lg shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Invoice Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>+ Add Item</Button>
          </div>
          
          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 pb-2 border-b">
              <div className="col-span-2">Type</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Rate (₹)</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <div className="col-span-1 md:col-span-2">
                  <select 
                    className="w-full text-sm border-gray-300 rounded-md"
                    value={item.type} onChange={(e) => updateItem(i, 'type', e.target.value)} required
                  >
                    <option value="consultation">Consultation</option>
                    <option value="procedure">Procedure</option>
                    <option value="test">Test Charge</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-5">
                  <input 
                    type="text" required placeholder="Description"
                    className="w-full text-sm border-gray-300 rounded-md"
                    value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                  <span className="md:hidden text-xs text-gray-500">Qty:</span>
                  <input 
                    type="number" required min="1"
                    className="w-20 text-sm border-gray-300 rounded-md text-center"
                    value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end">
                  <span className="md:hidden text-xs text-gray-500">Rate:</span>
                  <input 
                    type="number" required min="0" step="0.01"
                    className="w-24 text-sm border-gray-300 rounded-md text-right"
                    value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="col-span-1 text-right md:text-center mt-2 md:mt-0">
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-sm hover:underline">Remove</button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-gray-500 py-2">No items added.</p>}
          </div>
        </div>

        {/* Totals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
              <div className="flex gap-2">
                <select 
                  className="w-1/3 text-sm border-gray-300 rounded-md"
                  value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                >
                  <option value="none">None</option>
                  <option value="flat">Flat (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
                {discount.type !== "none" && (
                  <input 
                    type="number" min="0" step="0.01" required
                    className="w-1/3 text-sm border-gray-300 rounded-md"
                    value={discount.value} onChange={(e) => setDiscount({ ...discount, value: e.target.value })}
                  />
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" className="rounded text-indigo-600"
                  checked={tax.enabled} onChange={(e) => setTax({ ...tax, enabled: e.target.checked })}
                />
                <span className="text-sm">Apply Tax (%)</span>
                {tax.enabled && (
                  <input 
                    type="number" min="0" step="0.01" required
                    className="w-24 text-sm border-gray-300 rounded-md"
                    value={tax.percentage} onChange={(e) => setTax({ ...tax, percentage: e.target.value })}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                rows="2" className="w-full text-sm border-gray-300 rounded-md"
                value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes or terms..."
              />
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Summary Preview</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount.type !== "none" && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {tax.enabled && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({tax.percentage}%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Grand Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
