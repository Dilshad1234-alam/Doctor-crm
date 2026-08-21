import { createAppointment, findAppointmentById, findAppointmentsByClinic, updateAppointmentById } from "../repositories/appointmentRepository.js";
import DoctorProfile from "../models/DoctorProfile.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";

export async function createAppointmentForClinic(authUser, input) {
  const { id: userId, role } = authUser;
  const clinicId = authUser.clinicProfile ? authUser.clinicProfile._id : authUser.clinicId;
  const legacyClinicId = authUser.clinicId; // For some lookups if needed
  
  if (!clinicId) throw Object.assign(new Error("Clinic ID is required"), { status: 400 });

  const { 
    patientName, patientPhone, patientEmail, patientAge, patientGender, 
    serviceId, appointmentDate, appointmentTime, doctorId = authUser.doctorId 
  } = input;

  const effectiveDoctorId = authUser.doctorProfile ? authUser.doctorProfile._id.toString() : doctorId;
  if (role === "doctor" && authUser.doctorProfile && authUser.doctorProfile._id.toString() !== effectiveDoctorId) {
    throw Object.assign(new Error("Doctors can only book their own appointments"), { status: 403 });
  }

  const doctor = await DoctorProfile.findOne({ 
    $or: [{ _id: doctorId }, { doctorId: doctorId }],
    clinicId, 
    isActive: true 
  });
  if (!doctor) throw Object.assign(new Error("Doctor not found in this clinic"), { status: 400 });

  const service = await Service.findOne({ _id: serviceId, clinicId, isActive: true });
  if (!service) throw Object.assign(new Error("Service not found or inactive in this clinic"), { status: 400 });

  // MVP: generate booking ID APT-YYYYMMDD-XXXX
  const dateObj = new Date(appointmentDate);
  const dateStr = dateObj.toISOString().split("T")[0].replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingId = `APT-${dateStr}-${randomStr}`;

  const appointmentData = {
    clinicId, // Now points to ClinicProfile
    doctorId: doctor._id, // Now points to DoctorProfile
    serviceId,
    bookingId,
    patientName,
    patientPhone,
    patientEmail,
    patientAge,
    patientGender,
    appointmentDate: dateObj,
    appointmentTime,
    durationMinutes: service.durationMinutes,
    status: "PENDING"
  };

  const appointment = await createAppointment(appointmentData);
  return appointment;
}

export async function rescheduleAppointment(authUser, appointmentId, input) {
  const clinicId = authUser.clinicProfile ? authUser.clinicProfile._id : authUser.clinicId;
  const { role } = authUser;
  const { appointmentDate, appointmentTime } = input;

  const appointment = await findAppointmentById(appointmentId, clinicId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { status: 404 });

  if (role === "doctor" && authUser.doctorProfile && authUser.doctorProfile._id.toString() !== appointment.doctorId._id.toString()) {
    throw Object.assign(new Error("Unauthorized access to this appointment"), { status: 403 });
  }

  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    throw Object.assign(new Error(`Cannot reschedule an appointment in '${appointment.status}' status`), { status: 400 });
  }

  const updateData = {
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: "RESCHEDULED"
  };

  const updated = await updateAppointmentById(appointmentId, clinicId, updateData);
  return updated;
}

export async function updateAppointmentStatus(authUser, appointmentId, status) {
  const clinicId = authUser.clinicProfile ? authUser.clinicProfile._id : authUser.clinicId;
  const { role } = authUser;
  
  const appointment = await findAppointmentById(appointmentId, clinicId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { status: 404 });

  if (role === "doctor" && authUser.doctorProfile && authUser.doctorProfile._id.toString() !== appointment.doctorId._id.toString()) {
    throw Object.assign(new Error("Unauthorized access to this appointment"), { status: 403 });
  }

  const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"];
  if (!validStatuses.includes(status)) {
    throw Object.assign(new Error("Invalid status"), { status: 400 });
  }

  const updated = await updateAppointmentById(appointmentId, clinicId, { status });
  return updated;
}

export async function getAppointments(authUser, query) {
  const clinicId = authUser.clinicProfile ? authUser.clinicProfile._id : authUser.clinicId;
  const { role } = authUser;
  if (role === "doctor") {
    query.doctorId = authUser.doctorProfile ? authUser.doctorProfile._id : authUser.doctorId;
  }
  return findAppointmentsByClinic(clinicId, query);
}

export async function getAppointmentDetails(authUser, appointmentId) {
  const clinicId = authUser.clinicProfile ? authUser.clinicProfile._id : authUser.clinicId;
  const appointment = await findAppointmentById(appointmentId, clinicId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { status: 404 });
  
  if (authUser.role === "doctor" && authUser.doctorProfile && authUser.doctorProfile._id.toString() !== appointment.doctorId._id.toString()) {
    throw Object.assign(new Error("Unauthorized access to this appointment"), { status: 403 });
  }

  return appointment;
}

export async function cancelAppointment(authUser, appointmentId, reason) {
  // If we wanted to store the reason, we could update it too.
  return updateAppointmentStatus(authUser, appointmentId, "CANCELLED");
}

export async function markAppointmentNoShow(authUser, appointmentId) {
  return updateAppointmentStatus(authUser, appointmentId, "NO_SHOW");
}
