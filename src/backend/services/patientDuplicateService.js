import { findPatientByPhone, findPatientByEmail } from "../repositories/patientRepository.js";

export async function checkDuplicatePatient(clinicId, data) {
  if (data.phone) {
    const existingByPhone = await findPatientByPhone(data.phone, clinicId);
    if (existingByPhone && existingByPhone._id.toString() !== data.excludeId) {
      return {
        isDuplicate: true,
        reason: "phone",
        message: "A patient with this phone number already exists.",
        existingPatient: {
          id: existingByPhone._id,
          patientCode: existingByPhone.patientCode,
          name: existingByPhone.fullName,
          phone: existingByPhone.phone
        }
      };
    }
  }

  if (data.email) {
    const existingByEmail = await findPatientByEmail(data.email, clinicId);
    if (existingByEmail && existingByEmail._id.toString() !== data.excludeId) {
      return {
        isDuplicate: true,
        reason: "email",
        message: "A patient with this email already exists.",
        existingPatient: {
          id: existingByEmail._id,
          patientCode: existingByEmail.patientCode,
          name: existingByEmail.fullName,
          email: existingByEmail.email
        }
      };
    }
  }

  return { isDuplicate: false };
}
