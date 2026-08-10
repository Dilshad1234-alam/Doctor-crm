import Patient from "../models/Patient.js";

export async function createPatient(data) {
  const patient = new Patient(data);
  return patient.save();
}

export async function findPatientById(patientId, clinicId) {
  return Patient.findOne({ _id: patientId, clinicId });
}

export async function findPatientByCode(patientCode, clinicId) {
  return Patient.findOne({ patientCode, clinicId });
}

export async function findPatientByPhone(phone, clinicId) {
  return Patient.findOne({ phone, clinicId });
}

export async function findPatientByEmail(email, clinicId) {
  return Patient.findOne({ email, clinicId });
}

export async function findPatientsByClinic(clinicId, query) {
  const { page, limit, search, gender, bloodGroup, status, sortBy, sortOrder } = query;
  
  const filter = { clinicId };
  
  if (status === "active") filter.isActive = true;
  else if (status === "inactive") filter.isActive = false;

  if (gender) filter.gender = gender;
  if (bloodGroup) filter.bloodGroup = bloodGroup;

  if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [
      { patientCode: searchRegex },
      { fullName: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { "address.city": searchRegex }
    ];
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [patients, total] = await Promise.all([
    Patient.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Patient.countDocuments(filter)
  ]);

  return {
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updatePatientById(patientId, clinicId, data) {
  return Patient.findOneAndUpdate(
    { _id: patientId, clinicId },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function countPatientsByClinic(clinicId) {
  return Patient.countDocuments({ clinicId });
}

export async function countActivePatientsByClinic(clinicId) {
  return Patient.countDocuments({ clinicId, isActive: true });
}
