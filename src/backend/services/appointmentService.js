import { createAppointment, findAppointmentById, findAppointmentsByClinic, findAppointmentsByDoctor, findAppointmentsByPatient, findDoctorAppointmentConflict, updateAppointmentById } from "../repositories/appointmentRepository.js";
import { getDoctorAvailableSlots } from "./appointmentSlotService.js";
import { generateAppointmentCode } from "../utils/generateAppointmentCode.js";
import DoctorProfile from "../models/DoctorProfile.js";
import { findPatientById } from "../repositories/patientRepository.js";
// import AuditLog from "../models/AuditLog.js";
import { canReschedule, canCancel, APPOINTMENT_STATUSES, ACTIVE_STATUSES } from "../utils/appointmentStatus.js";

async function logAudit(clinicId, userId, action, resourceId, details) {
  try {
    // await AuditLog.create({ clinicId, userId, action, resourceType: "Appointment", resourceId, details });
  } catch (e) { console.error("Audit log failed", e); }
}

export async function createAppointmentForClinic(authUser, input) {
  const { id: userId, role } = authUser;
  const { patientId, doctorId, appointmentDate, startTime, visitType, reason, notes } = input;
  const clinicId = authUser.clinicId || input.clinicId;
  
  if (!clinicId) throw Object.assign(new Error("Clinic ID is required"), { status: 400 });

  // 1. Verify Patient & Doctor
  const patient = await findPatientById(patientId, clinicId);
  if (!patient || !patient.isActive) throw Object.assign(new Error("Patient not found or inactive"), { status: 404 });

  const doctor = await DoctorProfile.findOne({ _id: doctorId, clinicId, isActive: true });
  if (!doctor || !doctor.isAcceptingAppointments) throw Object.assign(new Error("Doctor not found or not accepting appointments"), { status: 400 });

  // 2. Verify Role Rules
  if (role === "doctor" && authUser.doctorId !== doctorId) {
    throw Object.assign(new Error("Doctors can only book their own appointments"), { status: 403 });
  }
  if (role === "patient" && authUser.patientId !== patientId) {
    throw Object.assign(new Error("Patients can only book their own appointments"), { status: 403 });
  }

  // 3. Verify Slot Conflict (Double Booking)
  const conflict = await findDoctorAppointmentConflict(clinicId, doctorId, appointmentDate, startTime);
  if (conflict) {
    throw Object.assign(new Error("Slot is already booked"), { status: 409, code: "SLOT_ALREADY_BOOKED" });
  }

  // 4. Generate Code, Token & Snapshot Fee
  const appointmentCode = await generateAppointmentCode(clinicId);
  const consultationFee = doctor.consultationFee || 0;
  
  // Calculate End Time based on default duration
  const durationMinutes = doctor.slotDuration || doctor.defaultSlotDuration || 15;
  let [h, m] = startTime.split(":").map(Number);
  let totalMins = h * 60 + m + durationMinutes;
  let eh = Math.floor(totalMins / 60);
  let em = totalMins % 60;
  const endTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;

  // Generate Token: TKN-YYYYMMDD-00X
  const appointmentDateObj = new Date(appointmentDate);
  const startOfDay = new Date(appointmentDateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDateObj);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingCount = await Appointment.countDocuments({
    clinicId,
    doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay }
  });
  const dateString = appointmentDateObj.toISOString().split("T")[0].replace(/-/g, "");
  const token = `TKN-${dateString}-${String(existingCount + 1).padStart(3, "0")}`;

  const sourceMap = { "clinic_owner": "clinic_owner", "receptionist": "reception", "doctor": "doctor" };
  
  const appointmentData = {
    clinicId,
    appointmentCode,
    token,
    patientId,
    doctorId,
    appointmentDate: new Date(appointmentDate),
    startTime,
    endTime,
    durationMinutes,
    visitType: visitType || "new_consultation",
    source: sourceMap[role] || "reception",
    reason,
    notes,
    consultationFee,
    status: APPOINTMENT_STATUSES.SCHEDULED,
    createdByUserId: userId,
  };

  const appointment = await createAppointment(appointmentData);

  await logAudit(clinicId, userId, "appointment.created", appointment._id, `Booked ${appointmentCode} for ${patient.fullName}`);

  return appointment;
}

export async function rescheduleAppointment(authUser, appointmentId, input) {
  const { clinicId, id: userId, role } = authUser;
  const { appointmentDate, startTime } = input;

  const appointment = await findAppointmentById(appointmentId, clinicId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { status: 404 });

  if (role === "doctor" && authUser.doctorId !== appointment.doctorId._id.toString()) {
    throw Object.assign(new Error("Unauthorized access to this appointment"), { status: 403 });
  }

  if (!canReschedule(appointment.status)) {
    throw Object.assign(new Error(`Cannot reschedule an appointment in '${appointment.status}' status`), { status: 400 });
  }

  const conflict = await findDoctorAppointmentConflict(clinicId, appointment.doctorId._id, appointmentDate, startTime);
  if (conflict && conflict._id.toString() !== appointmentId) {
    throw Object.assign(new Error("New slot is already booked"), { status: 409, code: "SLOT_ALREADY_BOOKED" });
  }

  const durationMinutes = appointment.durationMinutes;
  let [h, m] = startTime.split(":").map(Number);
  let totalMins = h * 60 + m + durationMinutes;
  let eh = Math.floor(totalMins / 60);
  let em = totalMins % 60;
  const endTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;

  const historyEntry = {
    previousDate: appointment.appointmentDate,
    previousStartTime: appointment.startTime,
    previousEndTime: appointment.endTime,
    changedByUserId: userId,
    changedAt: new Date()
  };

  const updateData = {
    appointmentDate: new Date(appointmentDate),
    startTime,
    endTime,
    lastUpdatedByUserId: userId,
    $push: { rescheduleHistory: historyEntry }
  };

  const updated = await updateAppointmentById(appointmentId, clinicId, updateData);
  await logAudit(clinicId, userId, "appointment.rescheduled", appointmentId, `Rescheduled ${appointment.appointmentCode} to ${appointmentDate} ${startTime}`);

  return updated;
}

export async function cancelAppointment(authUser, appointmentId, reason) {
  const { clinicId, id: userId, role } = authUser;
  
  const appointment = await findAppointmentById(appointmentId, clinicId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { status: 404 });

  if (role === "doctor" && authUser.doctorId !== appointment.doctorId._id.toString()) {
    throw Object.assign(new Error("Unauthorized access to this appointment"), { status: 403 });
  }

  if (!canCancel(appointment.status)) {
    throw Object.assign(new Error(`Cannot cancel an appointment in '${appointment.status}' status`), { status: 400 });
  }

  const updateData = {
    status: APPOINTMENT_STATUSES.CANCELLED,
    cancellation: {
      reason,
      cancelledByUserId: userId,
      cancelledAt: new Date()
    },
    lastUpdatedByUserId: userId
  };

  const updated = await updateAppointmentById(appointmentId, clinicId, updateData);
  await logAudit(clinicId, userId, "appointment.cancelled", appointmentId, `Cancelled ${appointment.appointmentCode}: ${reason}`);

  return updated;
}

export async function markAppointmentNoShow(authUser, appointmentId) {
  const { clinicId, id: userId, role } = authUser;
  
  const appointment = await findAppointmentById(appointmentId, clinicId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { status: 404 });

  if (role === "doctor" && authUser.doctorId !== appointment.doctorId._id.toString()) {
    throw Object.assign(new Error("Unauthorized access to this appointment"), { status: 403 });
  }

  if (appointment.status === APPOINTMENT_STATUSES.CANCELLED || appointment.status === APPOINTMENT_STATUSES.COMPLETED) {
    throw Object.assign(new Error(`Cannot mark no-show for an appointment in '${appointment.status}' status`), { status: 400 });
  }

  const updateData = {
    status: APPOINTMENT_STATUSES.NO_SHOW,
    lastUpdatedByUserId: userId
  };

  const updated = await updateAppointmentById(appointmentId, clinicId, updateData);
  await logAudit(clinicId, userId, "appointment.no_show", appointmentId, `Marked ${appointment.appointmentCode} as no-show`);

  return updated;
}

export async function getAppointments(authUser, query) {
  const { clinicId, role } = authUser;
  if (role === "doctor") {
    query.doctorId = authUser.doctorId;
  } else if (role === "patient") {
    query.patientId = authUser.patientId;
  }
  return findAppointmentsByClinic(clinicId, query);
}

export async function getAppointmentDetails(authUser, appointmentId) {
  const appointment = await findAppointmentById(appointmentId, authUser.clinicId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { status: 404 });
  
  if (authUser.role === "doctor" && authUser.doctorId !== appointment.doctorId._id.toString()) {
    throw Object.assign(new Error("Unauthorized access to this appointment"), { status: 403 });
  }

  return appointment;
}
