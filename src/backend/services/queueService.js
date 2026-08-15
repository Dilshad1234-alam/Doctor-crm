import mongoose from "mongoose";
import { connectDB } from "../database/connectDB.js";
import { 
  createQueueEntry, 
  findQueueEntryById, 
  findQueueEntryByAppointment, 
  findDoctorQueue, 
  findClinicQueue, 
  updateQueueEntry 
} from "../repositories/queueRepository.js";
import { findAppointmentById, updateAppointmentById } from "../repositories/appointmentRepository.js";
import PatientVitals from "../models/PatientVitals.js";
import Counter from "../models/Counter.js";
import { APPOINTMENT_STATUSES } from "../utils/appointmentStatus.js";
import { startConsultation } from "./consultationService.js";
import { 
  requireAccountType, 
  canCheckInPatient, 
  canViewClinicQueue, 
  canViewDoctorQueue,
  canCallQueuePatient,
  canStartQueueConsultation,
  canSkipQueuePatient,
  canRemoveQueuePatient
} from "../utils/permissions.js";

async function generateTokenNumber(clinicId, doctorId, dateStr, session) {
  const key = `queue:${doctorId.toString()}:${dateStr}`;
  const counter = await Counter.findOneAndUpdate(
    { clinicId, key },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session }
  );
  return counter.sequence;
}

export async function checkInAppointment(authUser, appointmentId, input) {
  requireAccountType(authUser, ["clinic", "doctor"]);
  await connectDB();

  const appointment = await findAppointmentById(appointmentId, authUser.clinicId);
  if (!appointment) throw new Error("Appointment not found");

  if (!canCheckInPatient(authUser, appointment)) {
    throw new Error("Unauthorized to check in this patient");
  }

  // Validate status
  if (![APPOINTMENT_STATUSES.SCHEDULED, APPOINTMENT_STATUSES.CONFIRMED].includes(appointment.status)) {
    throw new Error(`Cannot check in appointment with status: ${appointment.status}`);
  }

  // Validate date (must be today)
  // Simplified for phase 1 - check if local dates match
  const aptDate = new Date(appointment.appointmentDate);
  aptDate.setHours(0, 0, 0, 0);
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  today.setHours(0, 0, 0, 0);

  if (aptDate.getTime() !== today.getTime()) {
    throw new Error("Can only check in appointments for today");
  }

  // Prevent duplicate check-in
  const existingQueue = await findQueueEntryByAppointment(appointmentId, authUser.clinicId);
  if (existingQueue) {
    const error = new Error("Patient is already checked in");
    error.status = 409;
    throw error;
  }

  const dateStr = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");

  let session = null;
  let queueEntry = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const tokenNumber = await generateTokenNumber(authUser.clinicId, appointment.doctorId, dateStr, session);

    queueEntry = await createQueueEntry({
      clinicId: authUser.clinicId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      appointmentId: appointmentId,
      tokenNumber,
      queueDate: today,
      status: "waiting", // Directly to waiting as requested
      checkedInAt: new Date(),
      waitingSince: new Date(),
      priority: input.priority || "normal",
      notes: input.notes || "",
      createdByUserId: authUser.id || authUser._id,
    }, session);

    // Update appointment status
    await updateAppointmentById(appointmentId, authUser.clinicId, { status: APPOINTMENT_STATUSES.WAITING }, session);

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    if (error.code === 11000) {
      throw new Error("Duplicate queue entry generated. Please try again.");
    }
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return queueEntry;
}

export async function getClinicQueue(authUser, query) {
  requireAccountType(authUser, ["clinic"]);
  if (!canViewClinicQueue(authUser)) throw new Error("Unauthorized to view clinic queue");
  
  await connectDB();
  const date = query.date || new Date().toISOString().split('T')[0];
  
  const queue = await findClinicQueue(authUser.clinicId, date, query);
  
  // Attach hasVitals status
  const queueWithVitals = await Promise.all(queue.map(async (entry) => {
    const hasVitals = await PatientVitals.exists({ appointmentId: entry.appointmentId._id, clinicId: authUser.clinicId });
    return { ...entry.toObject(), hasVitals: !!hasVitals };
  }));
  
  return queueWithVitals;
}

export async function getDoctorQueue(authUser, doctorId, query) {
  requireAccountType(authUser, ["clinic", "doctor"]);
  if (!canViewDoctorQueue(authUser, doctorId)) throw new Error("Unauthorized to view this doctor's queue");

  await connectDB();
  const date = query.date || new Date().toISOString().split('T')[0];
  
  // Custom sorting logic could be applied here if needed
  const queue = await findDoctorQueue(authUser.clinicId, doctorId, date, query);
  
  // Attach hasVitals status
  const queueWithVitals = await Promise.all(queue.map(async (entry) => {
    const hasVitals = await PatientVitals.exists({ appointmentId: entry.appointmentId._id, clinicId: authUser.clinicId });
    return { ...entry.toObject(), hasVitals: !!hasVitals };
  }));
  
  return queueWithVitals;
}

export async function callNextPatient(authUser) {
  requireAccountType(authUser, ["doctor"]);
  await connectDB();
  
  const doctorId = authUser.doctorId;
  if (!doctorId) throw new Error("User is not associated with a doctor profile");

  const today = new Date().toISOString().split('T')[0];
  const queue = await findDoctorQueue(authUser.clinicId, doctorId, today, { status: "waiting" });

  if (queue.length === 0) {
    throw new Error("No waiting patients in queue");
  }

  // Priority sorting: emergency > urgent > normal, then by waitingSince
  const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
  
  queue.sort((a, b) => {
    const pA = priorityOrder[a.priority];
    const pB = priorityOrder[b.priority];
    if (pA !== pB) return pB - pA;
    return new Date(a.waitingSince).getTime() - new Date(b.waitingSince).getTime();
  });

  const nextPatient = queue[0];
  return callQueueEntry(authUser, nextPatient._id);
}

export async function callQueueEntry(authUser, queueId) {
  await connectDB();
  const entry = await findQueueEntryById(queueId, authUser.clinicId);
  if (!entry) throw new Error("Queue entry not found");

  if (!canCallQueuePatient(authUser, entry)) {
    throw new Error("Unauthorized to call this patient");
  }

  if (entry.status !== "waiting") {
    throw new Error(`Cannot call patient from status: ${entry.status}`);
  }

  const updatedEntry = await updateQueueEntry(queueId, authUser.clinicId, {
    status: "called",
    calledAt: new Date()
  });

  return updatedEntry;
}

export async function startConsultationFromQueue(authUser, queueId) {
  await connectDB();
  const entry = await findQueueEntryById(queueId, authUser.clinicId);
  if (!entry) throw new Error("Queue entry not found");

  if (!canStartQueueConsultation(authUser, entry)) {
    throw new Error("Unauthorized to start consultation");
  }

  if (entry.status !== "called" && entry.status !== "waiting") {
    throw new Error(`Cannot start consultation from status: ${entry.status}`);
  }

  // Delegate the actual creation and state updates to consultationService
  // It handles idempotency, transaction, and audit logging safely.
  const consultation = await startConsultation(authUser, entry.appointmentId._id);
  
  return consultation;
}

export async function skipQueueEntry(authUser, queueId, input = {}) {
  await connectDB();
  const entry = await findQueueEntryById(queueId, authUser.clinicId);
  if (!entry) throw new Error("Queue entry not found");

  if (!canSkipQueuePatient(authUser, entry)) {
    throw new Error("Unauthorized to skip this patient");
  }

  if (entry.status === "in_consultation" || entry.status === "removed") {
    throw new Error(`Cannot skip patient with status: ${entry.status}`);
  }

  const updatedEntry = await updateQueueEntry(queueId, authUser.clinicId, {
    status: "skipped"
  });

  return updatedEntry;
}

export async function removeQueueEntry(authUser, queueId, input = {}) {
  await connectDB();
  const entry = await findQueueEntryById(queueId, authUser.clinicId);
  if (!entry) throw new Error("Queue entry not found");

  if (!canRemoveQueuePatient(authUser, entry)) {
    throw new Error("Unauthorized to remove this patient from queue");
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const updatedEntry = await updateQueueEntry(queueId, authUser.clinicId, {
      status: "removed"
    }, session);

    // Safely restore appointment to confirmed
    await updateAppointmentById(entry.appointmentId._id, authUser.clinicId, { status: APPOINTMENT_STATUSES.CONFIRMED }, session);

    await session.commitTransaction();
    return updatedEntry;
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }
}
