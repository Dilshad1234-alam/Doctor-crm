import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";
import ClinicProfile from "@/backend/models/ClinicProfile";
import { createAuthToken } from "@/backend/utils/auth";
import { getCurrentUser } from "@/backend/services/authService";

export async function setupClinicForOwner(userId, doctorProfile, input) {
  await connectDB();
  
  const user = await getCurrentUser(userId, "doctor");
  if (!user) {
    throw new Error("User not found or inactive");
  }

  const existingProfile = await ClinicProfile.findOne({ doctorId: doctorProfile._id });
  if (existingProfile) {
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

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 7);

  const newProfile = await ClinicProfile.create({
    name,
    email: email || user.email,
    phone: phone || user.phone,
    slug,
    doctorId: doctorProfile._id,
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

  // Re-issue token with new account details
  const token = createAuthToken({
    accountId: userId,
    accountType: "doctor",
  });

  return {
    clinic: newProfile,
    user: await getCurrentUser(userId, "doctor"),
    token,
  };
}
