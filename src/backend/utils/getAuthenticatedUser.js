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

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId ? user.clinicId.toString() : null,
    doctorId: user.doctorId ? user.doctorId.toString() : null,
    patientId: user.patientId ? user.patientId.toString() : null,
    onboardingCompleted: user.onboardingCompleted || !!(user.clinicId || user.doctorId || user.staffId || user.patientId),
  };
}
