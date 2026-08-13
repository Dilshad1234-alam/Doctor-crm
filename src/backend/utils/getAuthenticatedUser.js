import { getAuthTokenFromCookies } from "@/backend/utils/authCookie";
import { verifyAuthToken } from "@/backend/utils/auth";
import { findUserById } from "@/backend/repositories/userRepository";

export async function getAuthenticatedUser() {
  const token = await getAuthTokenFromCookies();
  
  if (!token) return null;

  const decoded = verifyAuthToken(token);
  if (!decoded || !decoded.userId) return null;

  const user = await findUserById(decoded.userId);
  if (!user || !user.isActive) return null;

  let clinicId = null;
  let doctorId = null;
  let patientId = null;

  if (user.role === "clinic_owner") {
    const { default: Clinic } = await import("@/backend/models/Clinic");
    const clinic = await Clinic.findOne({ ownerId: user._id }).lean();
    if (clinic) clinicId = clinic._id.toString();
  } else if (user.role === "doctor") {
    const { default: DoctorProfile } = await import("@/backend/models/DoctorProfile");
    const doctor = await DoctorProfile.findOne({ userId: user._id }).lean();
    if (doctor) {
      doctorId = doctor._id.toString();
      clinicId = doctor.clinicId ? doctor.clinicId.toString() : null;
    }
  } else if (user.role === "patient") {
    const { default: PatientProfile } = await import("@/backend/models/PatientProfile");
    const patient = await PatientProfile.findOne({ userId: user._id }).lean();
    if (patient) patientId = patient._id.toString();
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    clinicId,
    doctorId,
    patientId,
    onboardingCompleted: user.onboardingCompleted,
  };
}
