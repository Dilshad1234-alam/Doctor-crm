import { getAuthTokenFromCookies } from "@/backend/utils/authCookie";
import { verifyAuthToken } from "@/backend/utils/auth";
import { connectDB } from "@/backend/database/connectDB";
import User from "@/backend/models/User";
import Clinic from "@/backend/models/Clinic";
import Doctor from "@/backend/models/Doctor";
import Patient from "@/backend/models/Patient";

export async function getAuthenticatedUser() {
  const token = await getAuthTokenFromCookies();
  
  if (!token) return null;

  const decoded = verifyAuthToken(token);
  if (!decoded || !decoded.accountId || !decoded.accountType) return null;

  await connectDB();

  let user = null;
  let clinicId = null;
  let doctorId = null;
  let patientId = null;
  let onboardingCompleted = false;

  if (decoded.accountType === "admin" || decoded.accountType === "unassigned") {
    user = await User.findById(decoded.accountId).lean();
    if (!user || !user.isActive) return null;
  } else if (decoded.accountType === "clinic") {
    user = await Clinic.findById(decoded.accountId).lean();
    if (!user || !user.isActive) return null;
    clinicId = user._id.toString();
    const { default: ClinicProfile } = await import("@/backend/models/ClinicProfile");
    const profile = await ClinicProfile.findOne({ clinicId }).lean();
    onboardingCompleted = !!profile;
  } else if (decoded.accountType === "doctor") {
    user = await Doctor.findById(decoded.accountId).lean();
    if (!user || !user.isActive) return null;
    doctorId = user._id.toString();
    const { default: DoctorProfile } = await import("@/backend/models/DoctorProfile");
    const docProfile = await DoctorProfile.findOne({ doctorId: user._id }).lean();
    onboardingCompleted = !!docProfile;
    if (docProfile) {
      clinicId = docProfile.clinicId ? docProfile.clinicId.toString() : null;
    }
  } else if (decoded.accountType === "patient") {
    user = await Patient.findById(decoded.accountId).lean();
    if (!user || !user.isActive) return null;
    patientId = user._id.toString();
    const { default: PatientProfile } = await import("@/backend/models/PatientProfile");
    const patProfile = await PatientProfile.findOne({ patientId: user._id }).lean();
    onboardingCompleted = !!patProfile;
    if (patProfile) {
      clinicId = patProfile.clinicId ? patProfile.clinicId.toString() : null;
    }
  } else {
    return null;
  }

  return {
    id: user._id.toString(),
    accountId: user._id.toString(),
    accountType: decoded.accountType,
    name: user.name,
    email: user.email,
    role: decoded.accountType === "clinic" ? "clinic_owner" : decoded.accountType, // Maintain backwards compatibility with role checks if any, though accountType is strict
    clinicId,
    doctorId,
    patientId,
    onboardingCompleted,
  };
}
