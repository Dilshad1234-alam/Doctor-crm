import { connectDB } from "@/backend/database/connectDB";
import User from "@/backend/models/User";
import ClinicProfile from "@/backend/models/ClinicProfile";
import DoctorProfile from "@/backend/models/DoctorProfile";
import { hashPassword, comparePassword, createAuthToken } from "@/backend/utils/auth";

async function enrichUserData(baseUser, accountType) {
  let enriched = { ...baseUser, accountType };

  if (accountType === "doctor") {
    // Currently, doctorId is expected to be the User's ID based on previous usage, 
    // but the final architecture will have doctorId inside ClinicProfile.
    // We will do a generic lookup. The instructions say to preserve compatibility.
    const profile = await DoctorProfile.findOne({ userId: baseUser.id }).lean();
    if (profile) {
      enriched.doctorId = profile._id;
      enriched.clinicId = profile.clinicId;
      enriched.profileImageUrl = profile.profileImageUrl || profile.profileImage;
      enriched.onboardingCompleted = true;
    } else {
      // Compatibility fallback: check if they have a legacy DoctorProfile tied by old ID
      const legacyProfile = await DoctorProfile.findOne({ doctorId: baseUser.id }).lean();
      if (legacyProfile) {
        enriched.doctorId = legacyProfile._id;
        enriched.clinicId = legacyProfile.clinicId;
        enriched.profileImageUrl = legacyProfile.profileImageUrl || legacyProfile.profileImage;
        enriched.onboardingCompleted = true;
      } else {
        enriched.onboardingCompleted = false;
      }
    }
  }

  return enriched;
}

export async function registerUser(input) {
  await connectDB();
  const { name, email, phone, password, accountType } = input;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await hashPassword(password);

  const createPayload = {
    name: name.trim(),
    email: normalizedEmail,
    phone: phone || null,
    password: hashedPassword,
    isActive: true,
    role: accountType,
  };

  const newUser = await User.create(createPayload);

  const token = createAuthToken({
    accountId: newUser._id,
    accountType,
  });

  const baseUser = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: accountType,
    onboardingCompleted: false, 
  };

  const enrichedUser = await enrichUserData(baseUser, accountType);

  return {
    user: enrichedUser,
    token,
  };
}

export async function loginUser(input) {
  await connectDB();
  const { email, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+password").lean();
  
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

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  const token = createAuthToken({
    accountId: user._id,
    accountType: user.role,
  });

  const baseUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    onboardingCompleted: false, // Re-evaluated in enrich
  };

  const enrichedUser = await enrichUserData(baseUser, user.role);

  return {
    user: enrichedUser,
    token,
  };
}

export async function getCurrentUser(accountId, accountType) {
  await connectDB();
  const user = await User.findById(accountId).lean();
  
  if (!user || !user.isActive) return null;

  const baseUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    onboardingCompleted: true, // simplified
  };

  return await enrichUserData(baseUser, user.role);
}

export async function changePassword(accountId, accountType, currentPassword, newPassword) {
  await connectDB();
  const user = await User.findById(accountId).select("+password").lean();
  
  if (!user || !user.isActive) {
    throw new Error("Account not found or inactive");
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Incorrect current password");
  }

  const hashedPassword = await hashPassword(newPassword);
  await User.updateOne({ _id: accountId }, { password: hashedPassword });

  // Add audit log
  const { default: AuditLog } = await import("@/backend/models/AuditLog");
  
  await AuditLog.create({
    userId: accountId, 
    action: "user.password_changed",
    details: `${accountType} changed their password`,
  });
}

export async function assignRole(accountId, newRole) {
  await connectDB();
  const user = await User.findById(accountId).select("+password").lean();
  if (!user) {
    throw new Error("Invalid user.");
  }
  
  await User.updateOne({ _id: accountId }, { role: newRole });

  const token = createAuthToken({
    accountId: user._id,
    accountType: newRole,
  });

  const baseUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: newRole,
    onboardingCompleted: false,
  };

  const enrichedUser = await enrichUserData(baseUser, newRole);

  return { user: enrichedUser, token };
}
