import Invoice from "../models/Invoice.js";
import "../models/PatientProfile.js";
import "../models/DoctorProfile.js";
import "../models/Appointment.js";
import "../models/Consultation.js";
import "../models/User.js";

export async function createInvoice(data, session = null) {
  const [invoice] = await Invoice.create([data], session ? { session } : {});
  return invoice;
}

export async function findInvoiceById(invoiceId, clinicId) {
  return Invoice.findOne({ _id: invoiceId, clinicId })
    .populate("patientId", "firstName lastName fullName patientCode phone")
    .populate({
       path: "doctorId",
       select: "specialization title",
       populate: { path: "userId", select: "name" }
    })
    .populate("appointmentId", "appointmentCode appointmentDate startTime endTime")
    .populate("createdByUserId", "name role");
}

export async function findInvoiceByAppointment(appointmentId, clinicId) {
  return Invoice.findOne({ appointmentId, clinicId })
    .populate("patientId", "firstName lastName fullName patientCode")
    .populate({
       path: "doctorId",
       select: "specialization title",
       populate: { path: "userId", select: "name" }
    })
    .populate("createdByUserId", "name role");
}

export async function findInvoicesByClinic(clinicId, query = {}) {
  let filter = { clinicId };

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  if (query.doctorId) {
    filter.doctorId = query.doctorId;
  }
  if (query.patientId) {
    filter.patientId = query.patientId;
  }

  if (query.search) {
     filter.$or = [
       { invoiceCode: { $regex: query.search, $options: "i" } }
     ];
  }

  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {}; // Or issuedAt if they only want issued ones
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const endTo = new Date(query.dateTo);
      endTo.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endTo;
    }
  }

  return Invoice.find(filter)
    .populate("patientId", "firstName lastName fullName patientCode phone")
    .populate({
       path: "doctorId",
       select: "specialization",
       populate: { path: "userId", select: "name" }
    })
    .sort({ createdAt: -1 });
}

export async function findInvoicesByPatient(patientId, clinicId, query = {}) {
  return findInvoicesByClinic(clinicId, { ...query, patientId });
}

export async function updateInvoiceById(invoiceId, clinicId, data, session = null) {
  const options = { new: true };
  if (session) options.session = session;
  
  return Invoice.findOneAndUpdate(
    { _id: invoiceId, clinicId },
    { $set: data },
    options
  ).populate("patientId", "firstName lastName fullName");
}

export async function countInvoicesByClinic(clinicId, query = {}) {
  let filter = { clinicId };
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  return Invoice.countDocuments(filter);
}
