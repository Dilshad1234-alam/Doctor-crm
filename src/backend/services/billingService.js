import mongoose from "mongoose";
import { connectDB } from "../database/connectDB.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import AuditLog from "../models/AuditLog.js";
import Counter from "../models/Counter.js";
import { findAppointmentById } from "../repositories/appointmentRepository.js";
import { 
  createInvoice, findInvoiceById, findInvoicesByClinic, findInvoiceByAppointment 
} from "../repositories/invoiceRepository.js";
import { 
  createPayment, findPaymentsByInvoice 
} from "../repositories/paymentRepository.js";
import { calculateInvoiceTotals } from "./billingCalculationService.js";
import { canManageBilling, canViewBilling, canRecordPayment } from "../utils/permissions.js";

async function generateInvoiceCode(clinicId, session) {
  const counter = await Counter.findOneAndUpdate(
    { clinicId, key: "invoice" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session }
  );
  return `INV-${String(counter.sequence).padStart(6, "0")}`;
}

async function generatePaymentCode(clinicId, session) {
  const counter = await Counter.findOneAndUpdate(
    { clinicId, key: "payment" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session }
  );
  return `PAY-${String(counter.sequence).padStart(6, "0")}`;
}

export async function createNewInvoice(authUser, appointmentId, input) {
  await connectDB();
  
  if (!canManageBilling(authUser)) {
    throw new Error("Unauthorized to create invoice");
  }

  const appointment = await findAppointmentById(appointmentId, authUser.clinicId);
  if (!appointment) throw new Error("Appointment not found");

  const existingInvoice = await findInvoiceByAppointment(appointmentId, authUser.clinicId);
  if (existingInvoice) {
    throw new Error("An invoice already exists for this appointment");
  }


  let session = null;
  let invoice = null;

  try {
    // Ensure collections exist to prevent transaction implicit creation error
    await mongoose.models.Invoice.createCollection().catch(() => {});
    await mongoose.models.Counter.createCollection().catch(() => {});
    await mongoose.models.AuditLog.createCollection().catch(() => {});

    session = await mongoose.startSession();
    session.startTransaction();

    const invoiceCode = await generateInvoiceCode(authUser.clinicId, session);

    const totals = calculateInvoiceTotals(input.items || [], input.discount, input.tax);

    invoice = await createInvoice({
      clinicId: authUser.clinicId,
      invoiceCode,
      doctorId: appointment.doctorId._id || appointment.doctorId,
      appointmentId: appointment._id,
      serviceId: appointment.serviceId,
      items: totals.processedItems,
      subtotal: totals.subtotal,
      discount: input.discount,
      tax: input.tax,
      totalAmount: totals.totalAmount,
      paidAmount: 0,
      pendingAmount: totals.totalAmount,
      status: totals.totalAmount === 0 ? "paid" : "unpaid",
      notes: input.notes,
      createdByUserId: authUser.id || authUser._id,
      issuedAt: new Date()
    }, session);

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "invoice.created",
      entityType: "invoice",
      entityId: invoice._id,
      details: { invoiceCode, totalAmount: totals.totalAmount }
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return findInvoiceById(invoice._id, authUser.clinicId);
}

export async function getInvoice(authUser, invoiceId) {
  await connectDB();
  const invoice = await findInvoiceById(invoiceId, authUser.clinicId);
  if (!invoice) throw new Error("Invoice not found");

  if (!canViewBilling(authUser, invoice)) {
    throw new Error("Unauthorized to view this invoice");
  }
  return invoice;
}

export async function getBillingSummary(clinicId, doctorId = null) {
  const match = { clinicId: new mongoose.Types.ObjectId(clinicId) };
  if (doctorId) {
    match.doctorId = new mongoose.Types.ObjectId(doctorId);
  }

  const invoiceAggr = await Invoice.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalInvoiced: { $sum: "$totalAmount" },
        pendingAmount: { $sum: "$pendingAmount" },
        paidCount: {
          $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
        },
        partialCount: {
          $sum: { $cond: [{ $eq: ["$status", "partially_paid"] }, 1, 0] }
        }
      }
    }
  ]);

  const invoiceStats = invoiceAggr[0] || { totalInvoiced: 0, pendingAmount: 0, paidCount: 0, partialCount: 0 };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const paymentPipeline = [
    {
      $match: {
        clinicId: new mongoose.Types.ObjectId(clinicId),
        status: "success",
        paidAt: { $gte: startOfToday }
      }
    }
  ];

  if (doctorId) {
    paymentPipeline.push({
      $lookup: {
        from: "invoices",
        localField: "invoiceId",
        foreignField: "_id",
        as: "invoice"
      }
    });
    paymentPipeline.push({ $unwind: "$invoice" });
    paymentPipeline.push({ $match: { "invoice.doctorId": new mongoose.Types.ObjectId(doctorId) } });
  }

  paymentPipeline.push({
    $group: {
      _id: null,
      todayCollection: { $sum: "$amount" }
    }
  });

  const paymentAggr = await Payment.aggregate(paymentPipeline);
  const todayCollection = paymentAggr[0] ? paymentAggr[0].todayCollection : 0;

  return {
    todayCollection,
    totalInvoiced: invoiceStats.totalInvoiced,
    pendingAmount: invoiceStats.pendingAmount,
    paidInvoices: invoiceStats.paidCount,
    partiallyPaidInvoices: invoiceStats.partialCount
  };
}

export async function getInvoices(authUser, query = {}) {
  await connectDB();
  
  if (!canViewBilling(authUser)) {
    throw new Error("Unauthorized to view billing");
  }

  if (authUser.role === "doctor") {
    query.doctorId = authUser.doctorId;
  } else if (authUser.role === "patient") {
    query.patientId = authUser.patientId;
  }

  const invoices = await findInvoicesByClinic(authUser.clinicId, query);
  const summary = await getBillingSummary(authUser.clinicId, query.doctorId);

  return { invoices, summary };
}

export async function recordPayment(authUser, invoiceId, input) {
  await connectDB();
  
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  if (invoice.clinicId.toString() !== authUser.clinicId.toString()) {
     throw new Error("Unauthorized");
  }

  if (!canRecordPayment(authUser, invoice)) {
    throw new Error("Unauthorized to record payment");
  }

  if (invoice.status === "paid") {
    throw new Error("Invoice is already fully paid.");
  }

  const amount = Number(input.amount);
  if (amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  // Use EPSILON for floating point comparison to prevent edge cases
  if (amount > invoice.pendingAmount + 0.01) {
    throw new Error("Payment cannot exceed pending amount.");
  }

  let session = null;
  let payment = null;
  let updatedInvoice = null;

  try {
    await mongoose.models.Payment.createCollection().catch(() => {});
    await mongoose.models.Counter.createCollection().catch(() => {});
    await mongoose.models.AuditLog.createCollection().catch(() => {});

    session = await mongoose.startSession();
    session.startTransaction();

    const paymentCode = await generatePaymentCode(authUser.clinicId, session);

    payment = await createPayment({
      clinicId: authUser.clinicId,
      paymentCode,
      invoiceId: invoice._id,
      appointmentId: invoice.appointmentId,
      serviceId: invoice.serviceId,
      amount,
      paymentMethod: input.paymentMethod,
      transactionId: input.transactionId || input.referenceNumber,
      notes: input.notes,
      receivedByUserId: authUser.id || authUser._id,
      status: "success",
      paidAt: new Date()
    }, session);

    const newPaidAmount = Number((invoice.paidAmount + amount).toFixed(2));
    const newPendingAmount = Number((Math.max(0, invoice.totalAmount - newPaidAmount)).toFixed(2));
    
    let newStatus = "unpaid";
    if (newPendingAmount === 0) newStatus = "paid";
    else if (newPaidAmount > 0) newStatus = "partially_paid";

    updatedInvoice = await Invoice.findByIdAndUpdate(
      invoice._id,
      {
        $set: {
          paidAmount: newPaidAmount,
          pendingAmount: newPendingAmount,
          status: newStatus,
          lastUpdatedByUserId: authUser.id || authUser._id
        }
      },
      { new: true, session }
    );

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "payment.recorded",
      entityType: "payment",
      entityId: payment._id,
      details: { paymentCode, invoiceCode: invoice.invoiceCode, amount }
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return { payment, invoice: await findInvoiceById(updatedInvoice._id, authUser.clinicId) };
}

export async function getPaymentsForInvoice(authUser, invoiceId) {
  await connectDB();
  
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice || invoice.clinicId.toString() !== authUser.clinicId.toString()) {
     throw new Error("Invoice not found or unauthorized");
  }

  if (!canViewBilling(authUser, invoice)) {
    throw new Error("Unauthorized to view payments");
  }

  return findPaymentsByInvoice(invoiceId, authUser.clinicId);
}
