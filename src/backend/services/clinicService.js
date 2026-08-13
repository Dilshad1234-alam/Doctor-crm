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
    area,
    city,
    state,
    pincode,
    consultationDuration,
    openingTime,
    closingTime,
    specialties,
    facilities,
    isPublic,
    logo,
    coverImage,
  } = input;

  const newClinic = await createClinic({
    name,
    ownerId: userId,
    email: email || null,
    phone: phone || null,
    address: {
      line1: addressLine1,
      line2: addressLine2 || "",
      area: area || "",
      city,
      state,
      pincode,
      country: "India",
    },
    consultationDuration: consultationDuration || 15,
    openingTime: openingTime || "",
    closingTime: closingTime || "",
    specialties: specialties || [],
    facilities: facilities || [],
    isPublic: isPublic || false,
    logo: logo || null,
    coverImage: coverImage || null,
    onboardingCompleted: true,
    isActive: true,
  });

  // Update User to reference this clinic and mark onboarding complete
  await updateUserById(userId, {
    clinicId: newClinic._id,
    onboardingCompleted: true,
  });

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

