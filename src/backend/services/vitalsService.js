import mongoose from "mongoose";
import { connectDB } from "../database/connectDB.js";
import { findAppointmentById } from "../repositories/appointmentRepository.js";
import { 
  createVitals, 
  updateVitalsByAppointment, 
  findVitalsByAppointment,
  findPatientVitalsHistory
} from "../repositories/vitalsRepository.js";
import AuditLog from "../models/AuditLog.js";
import { APPOINTMENT_STATUSES } from "../utils/appointmentStatus.js";
import { canRecordVitals, canViewVitals, canUpdateVitals } from "../utils/permissions.js";

function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);
  return Math.round(bmi * 10) / 10;
}

export async function recordVitals(authUser, appointmentId, input) {
  await connectDB();

  const appointment = await findAppointmentById(appointmentId, authUser.clinicId);
  if (!appointment) throw new Error("Appointment not found");

  if (!canRecordVitals(authUser, appointment)) {
    throw new Error("Unauthorized to record vitals for this appointment");
  }

  const validStatuses = [
    APPOINTMENT_STATUSES.CHECKED_IN, 
    APPOINTMENT_STATUSES.WAITING, 
    APPOINTMENT_STATUSES.CALLED, 
    APPOINTMENT_STATUSES.IN_CONSULTATION
  ];
  
  if (!validStatuses.includes(appointment.status)) {
    throw new Error(`Cannot record vitals for appointment with status: ${appointment.status}`);
  }

  const existingVitals = await findVitalsByAppointment(appointmentId, authUser.clinicId);
  if (existingVitals) {
    throw new Error("Vitals already recorded for this appointment. Use update instead.");
  }

  const bmi = calculateBMI(input.weightKg, input.heightCm);

  let session = null;
  let vitals = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    vitals = await createVitals({
      clinicId: authUser.clinicId,
      patientId: appointment.patientId._id || appointment.patientId,
      doctorId: appointment.doctorId._id || appointment.doctorId,
      appointmentId,
      ...input,
      bmi,
      recordedByUserId: authUser.id || authUser._id,
      recordedAt: new Date(),
    }, session);

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "vitals.created",
      entityType: "vitals",
      entityId: vitals._id,
      details: {
        appointmentId,
        patientId: appointment.patientId._id || appointment.patientId,
        doctorId: appointment.doctorId._id || appointment.doctorId
      }
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return vitals;
}

export async function updateVitals(authUser, appointmentId, input) {
  await connectDB();

  const appointment = await findAppointmentById(appointmentId, authUser.clinicId);
  if (!appointment) throw new Error("Appointment not found");

  if (!canUpdateVitals(authUser, appointment)) {
    throw new Error("Unauthorized to update vitals for this appointment");
  }

  const existingVitals = await findVitalsByAppointment(appointmentId, authUser.clinicId);
  if (!existingVitals) {
    throw new Error("No existing vitals found for this appointment to update.");
  }

  // Calculate new BMI if height or weight is provided, else retain old logic
  const newWeight = input.weightKg !== undefined ? input.weightKg : existingVitals.weightKg;
  const newHeight = input.heightCm !== undefined ? input.heightCm : existingVitals.heightCm;
  const bmi = calculateBMI(newWeight, newHeight);

  let session = null;
  let updatedVitals = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    updatedVitals = await updateVitalsByAppointment(appointmentId, authUser.clinicId, {
      ...input,
      bmi,
    }, session);

    const changedFields = Object.keys(input);

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "vitals.updated",
      entityType: "vitals",
      entityId: updatedVitals._id,
      details: {
        appointmentId,
        patientId: appointment.patientId._id || appointment.patientId,
        doctorId: appointment.doctorId._id || appointment.doctorId,
        changedFields
      }
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return updatedVitals;
}

export async function getAppointmentVitals(authUser, appointmentId) {
  await connectDB();

  const appointment = await findAppointmentById(appointmentId, authUser.clinicId);
  if (!appointment) throw new Error("Appointment not found");

  if (!canViewVitals(authUser, appointment)) {
    throw new Error("Unauthorized to view vitals");
  }

  return findVitalsByAppointment(appointmentId, authUser.clinicId);
}

export async function getPatientVitalsHistory(authUser, patientId, query) {
  await connectDB();
  
  // Basic clinic scope check - if user is clinic owner/receptionist they can view any patient in clinic
  // Doctors generally can view any patient in their clinic history as well.
  
  return findPatientVitalsHistory(patientId, authUser.clinicId, query);
}
