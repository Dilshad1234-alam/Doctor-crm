import { findUserById, updateUserById } from "@/backend/repositories/userRepository";
import { createClinic, findClinicByOwnerId } from "@/backend/repositories/clinicRepository";
import { ROLES, requireRole } from "@/backend/utils/permissions";
import { createAuthToken } from "@/backend/utils/auth";

export async function setupClinicForOwner(userId, input) {
  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  requireRole(user, ROLES.CLINIC_OWNER);

  const existingClinic = await findClinicByOwnerId(userId);
  if (existingClinic || user.clinicId) {
    throw new Error("A clinic is already registered for this owner");
  }

  const {
    name,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    consultationDuration,
  } = input;

  const newClinic = await createClinic({
    name,
    ownerId: userId,
    email: email || null,
    phone: phone || null,
    address: {
      line1: addressLine1,
      line2: addressLine2 || "",
      city,
      state,
      pincode,
      country: "India", // Defaulting for now
    },
    consultationDuration: consultationDuration || 15,
    onboardingCompleted: true,
    isActive: true,
  });

  // Update User to reference this clinic
  await updateUserById(userId, { clinicId: newClinic._id });

  // Generate new token with clinicId included
  const token = createAuthToken({
    userId: user._id,
    role: user.role,
    clinicId: newClinic._id,
    doctorId: user.doctorId,
  });

  return {
    clinic: newClinic,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      clinicId: newClinic._id,
      doctorId: user.doctorId,
      onboardingCompleted: true,
    },
    token,
  };
}
