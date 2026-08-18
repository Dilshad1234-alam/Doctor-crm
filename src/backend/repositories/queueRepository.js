import QueueEntry from "../models/QueueEntry.js";
import "../models/PatientProfile.js";
import "../models/DoctorProfile.js";
import "../models/Appointment.js";
import "../models/User.js";

export async function createQueueEntry(data, session = null) {
  const [entry] = await QueueEntry.create([data], session ? { session } : {});
  return entry;
}

export async function findQueueEntryById(queueId, clinicId) {
  return QueueEntry.findOne({ _id: queueId, clinicId }).populate("patientId").populate("doctorId").populate("appointmentId");
}

export async function findQueueEntryByAppointment(appointmentId, clinicId, statuses = ["checked_in", "waiting", "called", "in_consultation"]) {
  return QueueEntry.findOne({ 
    appointmentId, 
    clinicId,
    status: { $in: statuses }
  });
}

export async function findDoctorQueue(clinicId, doctorId, date, query = {}) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  let statusFilter = { $in: ["checked_in", "waiting", "called"] };
  if (query.status === "all") {
    statusFilter = { $exists: true };
  } else if (query.status && query.status !== "active") {
    statusFilter = query.status;
  } else if (query.status === "active") {
    statusFilter = { $in: ["checked_in", "waiting", "called", "in_consultation"] };
  }

  let filter = {
    clinicId,
    doctorId,
    queueDate: { $gte: targetDate, $lte: endOfDay },
    status: statusFilter,
  };

  if (query.priority && query.priority !== "all") {
    filter.priority = query.priority;
  }

  return QueueEntry.find(filter)
    .populate("patientId", "name firstName lastName fullName phone gender dateOfBirth patientIdString")
    .populate("appointmentId", "appointmentCode startTime endTime visitType status")
    .sort({ priority: -1, waitingSince: 1, tokenNumber: 1 }); // Sort logic handling needed below
}

export async function findClinicQueue(clinicId, date, query = {}) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  let statusFilter = { $in: ["checked_in", "waiting", "called"] };
  if (query.status === "all") {
    statusFilter = { $exists: true };
  } else if (query.status && query.status !== "active") {
    statusFilter = query.status;
  } else if (query.status === "active") {
    statusFilter = { $in: ["checked_in", "waiting", "called", "in_consultation"] };
  }

  let filter = {
    clinicId,
    queueDate: { $gte: targetDate, $lte: endOfDay },
    status: statusFilter,
  };

  if (query.doctorId) {
    filter.doctorId = query.doctorId;
  }

  if (query.priority && query.priority !== "all") {
    filter.priority = query.priority;
  }

  return QueueEntry.find(filter)
    .populate("patientId", "name firstName lastName fullName phone patientIdString")
    .populate("doctorId", "name email phone")
    .populate("appointmentId", "appointmentCode startTime endTime visitType status")
    .sort({ tokenNumber: 1 });
}

export async function updateQueueEntry(queueId, clinicId, data, session = null) {
  return QueueEntry.findOneAndUpdate(
    { _id: queueId, clinicId },
    { $set: data },
    session ? { session, new: true } : { new: true }
  );
}

export async function countDoctorQueue(clinicId, doctorId, date, statuses = ["checked_in", "waiting", "called"]) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return QueueEntry.countDocuments({
    clinicId,
    doctorId,
    queueDate: { $gte: targetDate, $lte: endOfDay },
    status: { $in: statuses },
  });
}
