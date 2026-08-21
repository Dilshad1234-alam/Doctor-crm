import { getAuthTokenFromCookies } from "@/backend/utils/authCookie";
import { verifyAuthToken } from "@/backend/utils/auth";
import { connectDB } from "@/backend/database/connectDB";
import User from "@/backend/models/User";
import DoctorProfile from "@/backend/models/DoctorProfile";
import ClinicProfile from "@/backend/models/ClinicProfile";

export async function getAuthenticatedUser() {
  const token = await getAuthTokenFromCookies();
  
  if (!token) return null;

  const decoded = verifyAuthToken(token);
  if (!decoded || !decoded.accountId || !decoded.accountType) return null;

  await connectDB();

  let clinicId = null;
  let doctorId = null;
  let onboardingCompleted = false;

  // Authentication source of truth is now the User collection
  const user = await User.findById(decoded.accountId).lean();
  if (!user || !user.isActive) return null;

  let doctorProfile = null;
  let clinicProfile = null;

  if (user.role === "doctor") {
    doctorProfile = await DoctorProfile.findOne({ userId: user._id }).lean();
    
    if (doctorProfile) {
      // Legacy compatibility: downstream features expect the old Doctor._id or Clinic._id 
      // which we temporarily preserved inside DoctorProfile and ClinicProfile.
      doctorId = doctorProfile.doctorId ? doctorProfile.doctorId.toString() : doctorProfile._id.toString();
      
      clinicProfile = await ClinicProfile.findOne({ doctorId: doctorProfile._id }).lean();
      
      if (clinicProfile) {
        clinicId = clinicProfile.clinicId ? clinicProfile.clinicId.toString() : clinicProfile._id.toString();
        onboardingCompleted = true;
      }
    }
  } else if (user.role === "admin") {
    onboardingCompleted = true;
  } else {
    return null;
  }

  return {
    id: user._id.toString(),
    accountId: user._id.toString(),
    accountType: user.role,
    name: user.name,
    email: user.email,
    role: user.role,
    clinicId,
    doctorId,
    onboardingCompleted,
    
    // Attach raw profiles if existing/future modules need them
    user: user,
    doctorProfile: doctorProfile,
    clinicProfile: clinicProfile,
  };
}
