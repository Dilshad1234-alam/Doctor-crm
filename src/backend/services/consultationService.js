import mongoose from "mongoose";
import { connectDB } from "../database/connectDB.js";
import { findAppointmentById, updateAppointmentById } from "../repositories/appointmentRepository.js";
import { 
  createConsultation, 
  updateConsultationById, 
  findConsultationById,
  findConsultationByAppointment,
  findConsultationsByClinic,
  findConsultationsByDoctor,
  findConsultationsByPatient
} from "../repositories/consultationRepository.js";
import { updateQueueEntry, findQueueEntryByAppointment } from "../repositories/queueRepository.js";
import { findVitalsByAppointment } from "../repositories/vitalsRepository.js";
import { generateConsultationCode } from "../utils/generateConsultationCode.js";
import AuditLog from "../models/AuditLog.js";
import { APPOINTMENT_STATUSES } from "../utils/appointmentStatus.js";
import { canManageConsultation, canViewConsultation } from "../utils/permissions.js";

export async function startConsultation(authUser, appointmentId) {
  await connectDB();

  const appointment = await findAppointmentById(appointmentId, authUser.clinicId);
  if (!appointment) throw new Error("Appointment not found");

  if (!canManageConsultation(authUser, appointment)) {
    throw new Error("Unauthorized to start consultation. Must be assigned doctor.");
  }

  const existingNote = await findConsultationByAppointment(appointmentId, authUser.clinicId);
  if (existingNote) {
    // If it exists, just return it instead of throwing
    return existingNote;
  }

  let session = null;
  let consultation = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const consultationCode = await generateConsultationCode(authUser.clinicId, session);
    
    // Attach vitals if they exist
    const vitals = await findVitalsByAppointment(appointmentId, authUser.clinicId);

    consultation = await createConsultation({
      clinicId: authUser.clinicId,
      consultationCode,
      patientId: appointment.patientId._id || appointment.patientId,
      doctorId: appointment.doctorId._id || appointment.doctorId,
      appointmentId,
      vitalsId: vitals ? vitals._id : null,
      status: "in_progress",
      startedAt: new Date(),
      createdByDoctorId: authUser.doctorId, // specifically doctorId
    }, session);

    // Update appointment status
    await updateAppointmentById(appointmentId, authUser.clinicId, { status: APPOINTMENT_STATUSES.IN_CONSULTATION }, session);
    
    // Queue status
    const queueEntry = await findQueueEntryByAppointment(appointmentId, authUser.clinicId);
    if (queueEntry && queueEntry.status !== "in_consultation") {
       await updateQueueEntry(queueEntry._id, authUser.clinicId, {
         status: "in_consultation"
       }, session);
    }

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "consultation.started",
      entityType: "consultation",
      entityId: consultation._id,
      details: { appointmentId, consultationCode }
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return findConsultationById(consultation._id, authUser.clinicId);
}

export async function updateConsultation(authUser, consultationId, input) {
  await connectDB();

  const existingNote = await findConsultationById(consultationId, authUser.clinicId);
  if (!existingNote) throw new Error("Consultation not found");

  if (existingNote.doctorId._id.toString() !== authUser.doctorId?.toString()) {
    throw new Error("Unauthorized to edit this consultation");
  }

  if (existingNote.status === "completed") {
    throw new Error("Cannot edit a completed consultation.");
  }

  if (existingNote.status === "cancelled") {
    throw new Error("Cannot edit a cancelled consultation.");
  }

  // Ensure fields restricted from body are ignored
  delete input.clinicId;
  delete input.patientId;
  delete input.doctorId;
  delete input.appointmentId;
  delete input.consultationCode;
  delete input.status;
  delete input.startedAt;
  delete input.completedAt;
  delete input.createdByDoctorId;

  const updated = await updateConsultationById(consultationId, authUser.clinicId, {
    ...input,
    lastUpdatedByUserId: authUser.id || authUser._id,
  });

  return updated;
}

export async function completeConsultation(authUser, consultationId, input) {
  await connectDB();

  const existingNote = await findConsultationById(consultationId, authUser.clinicId);
  if (!existingNote) throw new Error("Consultation not found");

  if (existingNote.doctorId._id.toString() !== authUser.doctorId?.toString()) {
    throw new Error("Unauthorized to complete this consultation");
  }

  if (existingNote.status === "completed") {
    throw new Error("Consultation is already completed.");
  }

  let session = null;
  let consultation = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Prepare update payload
    delete input.status;
    delete input.completedAt;

    consultation = await updateConsultationById(consultationId, authUser.clinicId, {
      ...input,
      status: "completed",
      completedAt: new Date(),
      lastUpdatedByUserId: authUser.id || authUser._id,
    }, session);

    // Update appointment status to completed
    await updateAppointmentById(existingNote.appointmentId._id, authUser.clinicId, { status: APPOINTMENT_STATUSES.COMPLETED }, session);

    // Update queue entry
    const queueEntry = await findQueueEntryByAppointment(existingNote.appointmentId._id, authUser.clinicId);
    if (queueEntry && queueEntry.status !== "removed") { // Or 'completed' if we add it to queue statuses
       await updateQueueEntry(queueEntry._id, authUser.clinicId, {
         status: "removed"
       }, session);
    }

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "consultation.completed",
      entityType: "consultation",
      entityId: consultation._id,
      details: { appointmentId: existingNote.appointmentId._id }
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return consultation;
}

export async function getConsultation(authUser, consultationId) {
  await connectDB();
  const consultation = await findConsultationById(consultationId, authUser.clinicId);
  if (!consultation) throw new Error("Consultation not found");
  
  if (!canViewConsultation(authUser)) {
    throw new Error("Unauthorized to view this consultation");
  }
  return consultation;
}

export async function getConsultationByAppointment(authUser, appointmentId) {
  await connectDB();
  const appointment = await findAppointmentById(appointmentId, authUser.clinicId);
  if (!appointment) throw new Error("Appointment not found");

  if (!canViewConsultation(authUser, appointment)) {
    throw new Error("Unauthorized to view this consultation");
  }

  return findConsultationByAppointment(appointmentId, authUser.clinicId);
}

export async function getConsultations(authUser, query) {
  await connectDB();
  if (!canViewConsultation(authUser)) {
    throw new Error("Unauthorized to view consultations list");
  }
  return findConsultationsByClinic(authUser.clinicId, query);
}

export async function getPatientConsultations(authUser, patientId, query) {
  await connectDB();
  if (!canViewConsultation(authUser)) {
    throw new Error("Unauthorized to view consultations list");
  }
  return findConsultationsByPatient(authUser.clinicId, patientId, query);
}

export async function getMyConsultations(authUser, query) {
  await connectDB();
  if (authUser.role !== "doctor") {
    throw new Error("Unauthorized");
  }
  return findConsultationsByDoctor(authUser.clinicId, authUser.doctorId, query);
}
