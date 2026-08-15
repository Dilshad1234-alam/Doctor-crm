import PatientVitals from "../models/PatientVitals.js";
import "../models/User.js";

export async function createVitals(data, session = null) {
  const [vitals] = await PatientVitals.create([data], session ? { session } : {});
  return vitals;
}

export async function findVitalsByAppointment(appointmentId, clinicId) {
  return PatientVitals.findOne({ appointmentId, clinicId })
    .populate("recordedById", "name email phone")
    .lean();
}

export async function findVitalsById(vitalsId, clinicId) {
  return PatientVitals.findOne({ _id: vitalsId, clinicId })
    .populate("recordedById", "name email phone")
    .lean();
}

export async function updateVitalsByAppointment(appointmentId, clinicId, data, session = null) {
  return PatientVitals.findOneAndUpdate(
    { appointmentId, clinicId },
    { $set: data },
    session ? { new: true, session } : { new: true }
  ).populate("recordedById", "name email phone");
}

export async function findPatientVitalsHistory(patientId, clinicId, query = {}) {
  const { page = 1, limit = 10, dateFrom, dateTo } = query;
  const filter = { patientId, clinicId };

  if (dateFrom || dateTo) {
    filter.recordedAt = {};
    if (dateFrom) filter.recordedAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const endTo = new Date(dateTo);
      endTo.setHours(23, 59, 59, 999);
      filter.recordedAt.$lte = endTo;
    }
  }

  const skip = (page - 1) * limit;

  const [vitals, total] = await Promise.all([
    PatientVitals.find(filter)
      .sort({ recordedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("recordedById", "name email phone")
      .lean(),
    PatientVitals.countDocuments(filter)
  ]);

  return { vitals, total, page, totalPages: Math.ceil(total / limit) };
}
