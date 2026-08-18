import Consultation from "../models/Consultation.js";
import Appointment from "../models/Appointment.js";
import "../models/PatientProfile.js";
import "../models/DoctorProfile.js";
import "../models/User.js";

export async function createConsultation(data, session = null) {
  const [consultation] = await Consultation.create([data], session ? { session } : {});
  return consultation;
}

export async function findConsultationById(consultationId, clinicId) {
  return Consultation.findOne({ _id: consultationId, clinicId })
    .populate("patientId", "name firstName lastName fullName patientCode patientIdString age gender phone bloodGroup")
    .populate("doctorId", "name email phone")
    .populate("appointmentId", "appointmentCode startTime endTime visitType status appointmentDate reason")
    .populate("createdById", "name email phone role specialization")
    .populate("lastUpdatedById", "name role")
    .populate("vitalsId");
}

export async function findConsultationByAppointment(appointmentId, clinicId) {
  return Consultation.findOne({ appointmentId, clinicId })
    .populate("patientId", "name firstName lastName fullName patientCode patientIdString age gender phone bloodGroup")
    .populate("doctorId", "name email phone")
    .populate("appointmentId", "appointmentCode startTime endTime visitType status appointmentDate reason")
    .populate("vitalsId");
}

export async function updateConsultationById(consultationId, clinicId, updateData, session = null) {
  return Consultation.findOneAndUpdate(
    { _id: consultationId, clinicId },
    { $set: updateData },
    session ? { session, new: true } : { new: true }
  ).populate("patientId", "name firstName lastName fullName patientCode patientIdString age gender phone")
   .populate("doctorId", "name email phone");
}

export async function findConsultationsByClinic(clinicId, query = {}) {
  let filter = { clinicId };

  if (query.doctorId) filter.doctorId = query.doctorId;
  if (query.patientId) filter.patientId = query.patientId;
  if (query.status && query.status !== "all") filter.status = query.status;
  
  if (query.search) {
     filter.$or = [
       { consultationCode: { $regex: query.search, $options: "i" } }
       // Can add more complex searching if needed by looking up Patient
     ];
  }

  if (query.date) {
    const targetDate = new Date(query.date);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: targetDate, $lte: endOfDay };
  }

  return Consultation.find(filter)
    .populate("patientId", "name firstName lastName fullName patientCode patientIdString phone")
    .populate("doctorId", "name email phone")
    .populate("appointmentId", "appointmentCode startTime endTime visitType status appointmentDate")
    .sort({ createdAt: -1 });
}

export async function findConsultationsByDoctor(clinicId, doctorId, query = {}) {
  return findConsultationsByClinic(clinicId, { ...query, doctorId });
}

export async function findConsultationsByPatient(clinicId, patientId, query = {}) {
  return findConsultationsByClinic(clinicId, { ...query, patientId });
}
