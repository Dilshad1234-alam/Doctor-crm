import { createUser, findUserByEmail, findUserById, updateUserById } from "@/backend/repositories/userRepository";
import { hashPassword, comparePassword, createAuthToken } from "@/backend/utils/auth";
import { ROLES } from "@/backend/utils/permissions";
import StaffProfile from "@/backend/models/StaffProfile";
import DoctorProfile from "@/backend/models/DoctorProfile";
import Clinic from "@/backend/models/Clinic";
import PatientProfile from "@/backend/models/PatientProfile";

async function enrichUserData(baseUser) {
  let enriched = { ...baseUser };

  if (baseUser.role === "doctor") {
    const profile = await DoctorProfile.findOne({ userId: baseUser.id }).lean();
    if (profile) {
      enriched.doctorId = profile._id;
      enriched.clinicId = profile.clinicId;
      enriched.profileImageUrl = profile.profileImageUrl || profile.profileImage;
    }
  } else if (baseUser.role === "clinic_owner") {
    const clinic = await Clinic.findOne({ ownerId: baseUser.id }).lean();
    if (clinic) {
      enriched.clinicId = clinic._id;
      enriched.profileImageUrl = clinic.logoUrl || clinic.logo;
    }
  } else if (baseUser.role === "patient") {
    const profile = await PatientProfile.findOne({ userId: baseUser.id }).lean();
    if (profile) {
      enriched.patientId = profile._id;
      enriched.profileImageUrl = profile.profileImageUrl || profile.profileImage;
    }
  }

  return enriched;
}

export async function registerUser(input) {
  const { name, email, phone, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone || null,
    password: hashedPassword,
    role: "unassigned",
    isActive: true,
    onboardingCompleted: false,
  });

  const token = createAuthToken({
    userId: newUser._id,
    role: newUser.role,
  });

  const baseUser = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    onboardingCompleted: newUser.onboardingCompleted,
  };

  const enrichedUser = await enrichUserData(baseUser);

  return {
    user: enrichedUser,
    token,
  };
}

export async function loginUser(input) {
  const { email, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail, { includePassword: true });
  
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Account has been deactivated. Please contact support.");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  await updateUserById(user._id, { lastLoginAt: new Date() });

  const token = createAuthToken({
    userId: user._id,
    role: user.role,
  });

  const baseUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
  };

  const enrichedUser = await enrichUserData(baseUser);

  return {
    user: enrichedUser,
    token,
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user || !user.isActive) return null;

  const baseUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
  };

  return await enrichUserData(baseUser);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await findUserById(userId, { includePassword: true });
  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Incorrect current password");
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUserById(userId, { password: hashedPassword });

  // Add audit log
  const { default: AuditLog } = await import("@/backend/models/AuditLog");
  await AuditLog.create({
    clinicId: user.clinicId,
    userId: user._id,
    action: "user.password_changed",
    details: "User changed their password",
  });
}
