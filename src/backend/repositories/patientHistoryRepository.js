import PatientHistoryEvent from "../models/PatientHistoryEvent.js";

export async function createHistoryEvent(data) {
  const event = new PatientHistoryEvent(data);
  return event.save();
}

export async function getPatientHistory(patientId, clinicId, query) {
  const { page = 1, limit = 10, type } = query;
  
  const filter = { patientId, clinicId };
  if (type) {
    filter.type = type;
  }

  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    PatientHistoryEvent.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    PatientHistoryEvent.countDocuments(filter)
  ]);

  return {
    history,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
