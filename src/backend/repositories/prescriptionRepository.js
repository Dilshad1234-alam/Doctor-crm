import Prescription from "../models/Prescription.js";
import "../models/PatientProfile.js";
import "../models/DoctorProfile.js";
import "../models/Appointment.js";
import "../models/Consultation.js";
import "../models/User.js";

export async function createPrescription(data, session = null) {
  const [prescription] = await Prescription.create([data], session ? { session } : {});
  return prescription;
}

export async function findPrescriptionById(prescriptionId, clinicId) {
  return Prescription.findOne({ _id: prescriptionId, clinicId })
    .populate("patientId", "firstName lastName fullName patientCode age gender phone bloodGroup")
    .populate({
       path: "doctorId",
       select: "specialization title qualification registrationNumber",
       populate: { path: "userId", select: "name" }
    })
    .populate("consultationId", "consultationCode");
}

export async function findPrescriptionByConsultation(consultationId, clinicId) {
  return Prescription.findOne({ consultationId, clinicId })
    .populate("patientId", "firstName lastName fullName patientCode age gender phone bloodGroup")
    .populate({
       path: "doctorId",
       select: "specialization title qualification registrationNumber",
       populate: { path: "userId", select: "name" }
    })
    .populate("consultationId", "consultationCode");
}

export async function updatePrescriptionById(prescriptionId, clinicId, data, session = null) {
  return Prescription.findOneAndUpdate(
    { _id: prescriptionId, clinicId },
    { $set: data },
    session ? { session, new: true } : { new: true }
  ).populate("patientId", "firstName lastName fullName patientCode age gender phone bloodGroup")
   .populate({
       path: "doctorId",
       select: "specialization title qualification registrationNumber",
       populate: { path: "userId", select: "name" }
   })
   .populate("consultationId", "consultationCode");
}

export async function findPrescriptionsByClinic(clinicId, query = {}) {
  let filter = { clinicId };

  if (query.doctorId) filter.doctorId = query.doctorId;
  if (query.patientId) filter.patientId = query.patientId;
  if (query.status && query.status !== "all") filter.status = query.status;

  if (query.search) {
     filter.$or = [
       { prescriptionCode: { $regex: query.search, $options: "i" } }
     ];
  }

  if (query.date) {
    const targetDate = new Date(query.date);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: targetDate, $lte: endOfDay };
  }

  return Prescription.find(filter)
    .populate("patientId", "firstName lastName fullName patientCode phone")
    .populate({
       path: "doctorId",
       select: "specialization title",
       populate: { path: "userId", select: "name" }
    })
    .populate("consultationId", "consultationCode")
    .sort({ createdAt: -1 });
}

export async function findPrescriptionsByDoctor(doctorId, clinicId, query = {}) {
  return findPrescriptionsByClinic(clinicId, { ...query, doctorId });
}

export async function findPrescriptionsByPatient(patientId, clinicId, query = {}) {
  return findPrescriptionsByClinic(clinicId, { ...query, patientId });
}
