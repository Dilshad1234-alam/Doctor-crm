import Payment from "../models/Payment.js";

import "../models/Appointment.js";
import "../models/Invoice.js";
import "../models/User.js";

export async function createPayment(data, session = null) {
  const [payment] = await Payment.create([data], session ? { session } : {});
  return payment;
}

export async function findPaymentById(paymentId, clinicId) {
  return Payment.findOne({ _id: paymentId, clinicId })
    .populate("invoiceId", "invoiceCode totalAmount status")
    .populate("receivedById", "name email phone");
}

export async function findPaymentsByInvoice(invoiceId, clinicId) {
  return Payment.find({ invoiceId, clinicId })
    .populate("receivedById", "name email phone")
    .sort({ paidAt: -1 });
}

export async function findPaymentsByClinic(clinicId, query = {}) {
  let filter = { clinicId };

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  if (query.method && query.method !== "all") {
    filter.paymentMethod = query.method;
  }
  
  if (query.dateFrom || query.dateTo) {
    filter.paidAt = {};
    if (query.dateFrom) filter.paidAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const endTo = new Date(query.dateTo);
      endTo.setHours(23, 59, 59, 999);
      filter.paidAt.$lte = endTo;
    }
  }

  return Payment.find(filter)
    .populate("invoiceId", "invoiceCode totalAmount")
    .populate("receivedById", "name email phone")
    .sort({ paidAt: -1 });
}

// findPaymentsByPatient removed as patientId no longer on Payment

export async function sumSuccessfulPaymentsForInvoice(invoiceId, clinicId) {
  const result = await Payment.aggregate([
    {
      $match: {
        invoiceId: invoiceId, // Note: might need to cast to ObjectId if not already
        clinicId: clinicId,
        status: "success"
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: "$amount" }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalPaid : 0;
}
