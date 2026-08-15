import { connectDB } from "@/backend/database/connectDB";
import Clinic from "@/backend/models/Clinic";
import ClinicProfile from "@/backend/models/ClinicProfile";
import { ACCOUNT_TYPES, requireAccountType } from "@/backend/utils/permissions";
import { createAuthToken } from "@/backend/utils/auth";
import { getCurrentUser } from "@/backend/services/authService";

export async function setupClinicForOwner(clinicId, input) {
  await connectDB();
  
  // The authenticated user must be a clinic
  const user = await getCurrentUser(clinicId, ACCOUNT_TYPES.CLINIC);
  if (!user) {
    throw new Error("User not found or inactive");
  }

  const existingProfile = await ClinicProfile.findOne({ clinicId });
  if (existingProfile) {
    throw new Error("A clinic profile is already registered for this account");
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

  // Update base clinic details if they changed during setup
  await Clinic.updateOne(
    { _id: clinicId },
    { 
      $set: { 
        name, 
        email: email || user.email, 
        phone: phone || user.phone 
      } 
    }
  );

  const newProfile = await ClinicProfile.create({
    clinicId,
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
    status: "active",
  });

  const token = createAuthToken({
    accountId: clinicId,
    accountType: ACCOUNT_TYPES.CLINIC,
  });

  return {
    clinic: newProfile,
    user: await getCurrentUser(clinicId, ACCOUNT_TYPES.CLINIC), // Re-fetch updated user
    token,
  };
}
