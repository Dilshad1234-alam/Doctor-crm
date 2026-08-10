import Appointment from "../models/Appointment.js";
import "../models/Patient.js";
import "../models/DoctorProfile.js";
import "../models/User.js";
import { ACTIVE_STATUSES } from "../utils/appointmentStatus.js";

export async function createAppointment(data) {
  const appointment = new Appointment(data);
  return appointment.save();
}

export async function findAppointmentById(appointmentId, clinicId) {
  return Appointment.findOne({ _id: appointmentId, clinicId })
    .populate("patientId", "firstName lastName fullName patientCode phone age gender")
    .populate("doctorId", "specialization title employeeId")
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' }}) // Get doctor name from User
    .populate("createdByUserId", "name role");
}

export async function findAppointmentByCode(appointmentCode, clinicId) {
  return Appointment.findOne({ appointmentCode, clinicId });
}

export async function findAppointmentsByClinic(clinicId, query = {}) {
  const { page = 1, limit = 10, search, doctorId, patientId, date, dateFrom, dateTo, status, visitType, sortBy = "appointmentDate", sortOrder = -1 } = query;
  
  const filter = { clinicId };
  
  if (doctorId) filter.doctorId = doctorId;
  if (patientId) filter.patientId = patientId;
  if (status) filter.status = status;
  if (visitType) filter.visitType = visitType;
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
  } else if (dateFrom || dateTo) {
    filter.appointmentDate = {};
    if (dateFrom) filter.appointmentDate.$gte = new Date(dateFrom);
    if (dateTo) {
      const endTo = new Date(dateTo);
      endTo.setHours(23, 59, 59, 999);
      filter.appointmentDate.$lte = endTo;
    }
  }

  if (search) {
    filter.appointmentCode = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder, startTime: sortOrder };

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("patientId", "fullName patientCode phone gender")
      .populate({ path: "doctorId", select: "specialization title", populate: { path: "userId", select: "name" } })
      .lean(),
    Appointment.countDocuments(filter)
  ]);

  return { appointments, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findAppointmentsByDoctor(clinicId, doctorId, query = {}) {
  return findAppointmentsByClinic(clinicId, { ...query, doctorId });
}

export async function findAppointmentsByPatient(clinicId, patientId, query = {}) {
  return findAppointmentsByClinic(clinicId, { ...query, patientId });
}

export async function findDoctorAppointmentConflict(clinicId, doctorId, date, startTime) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return Appointment.findOne({
    clinicId,
    doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    startTime,
    status: { $in: ACTIVE_STATUSES }
  });
}

export async function updateAppointmentById(appointmentId, clinicId, updateData, session = null) {
  return Appointment.findOneAndUpdate(
    { _id: appointmentId, clinicId },
    { $set: updateData },
    { new: true, session }
  );
}

export async function countAppointmentsByClinic(clinicId, query = {}) {
  const filter = { clinicId };
  if (query.status) filter.status = query.status;
  if (query.date) {
    const startOfDay = new Date(query.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(query.date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
  }
  return Appointment.countDocuments(filter);
}
