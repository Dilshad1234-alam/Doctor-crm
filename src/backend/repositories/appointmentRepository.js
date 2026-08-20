import Appointment from "../models/Appointment.js";
import "../models/DoctorProfile.js";
import "../models/Service.js";

export async function createAppointment(data) {
  const appointment = new Appointment(data);
  return appointment.save();
}

export async function findAppointmentById(appointmentId, clinicId) {
  return Appointment.findOne({ _id: appointmentId, clinicId })
    .populate("doctorId", "name email phone")
    .populate("serviceId", "name durationMinutes price");
}

export async function findAppointmentByBookingId(bookingId, clinicId) {
  return Appointment.findOne({ bookingId, clinicId });
}

export async function findAppointmentsByClinic(clinicId, query = {}) {
  const { page = 1, limit = 10, search, doctorId, dateFrom, dateTo, status, sortBy = "appointmentDate", sortOrder = -1 } = query;
  
  const filter = {};
  if (clinicId) filter.clinicId = clinicId;
  if (doctorId) filter.doctorId = doctorId;
  if (status) filter.status = status;
  
  if (dateFrom || dateTo) {
    filter.appointmentDate = {};
    if (dateFrom) filter.appointmentDate.$gte = new Date(dateFrom);
    if (dateTo) {
      const endTo = new Date(dateTo);
      endTo.setHours(23, 59, 59, 999);
      filter.appointmentDate.$lte = endTo;
    }
  }

  if (search) {
    filter.$or = [
      { bookingId: { $regex: search, $options: "i" } },
      { patientName: { $regex: search, $options: "i" } },
      { patientPhone: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder, appointmentTime: sortOrder };

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("doctorId", "name email phone")
      .populate("serviceId", "name durationMinutes price")
      .lean(),
    Appointment.countDocuments(filter)
  ]);

  return { appointments, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateAppointmentById(appointmentId, clinicId, updateData, session = null) {
  return Appointment.findOneAndUpdate(
    { _id: appointmentId, clinicId },
    { $set: updateData },
    { new: true, session }
  );
}
