import { connectDB } from "@/backend/database/connectDB";
import User from "@/backend/models/User";
import Clinic from "@/backend/models/Clinic";
import Doctor from "@/backend/models/Doctor";
import Patient from "@/backend/models/Patient";
import ClinicProfile from "@/backend/models/ClinicProfile";
import DoctorProfile from "@/backend/models/DoctorProfile";
import PatientProfile from "@/backend/models/PatientProfile";
import { hashPassword, comparePassword, createAuthToken } from "@/backend/utils/auth";

async function getAccountModel(accountType) {
  switch (accountType) {
    case "admin": return User;
    case "clinic": return Clinic;
    case "doctor": return Doctor;
    case "patient": return Patient;
    default: throw new Error("Invalid account type");
  }
}

async function enrichUserData(baseUser, accountType) {
  let enriched = { ...baseUser, accountType };

  if (accountType === "doctor") {
    const profile = await DoctorProfile.findOne({ doctorId: baseUser.id }).lean();
    if (profile) {
      enriched.doctorId = baseUser.id;
      enriched.clinicId = profile.clinicId;
      enriched.profileImageUrl = profile.profileImageUrl || profile.profileImage;
      enriched.onboardingCompleted = true;
    } else {
      enriched.onboardingCompleted = false;
    }
  } else if (accountType === "clinic") {
    const profile = await ClinicProfile.findOne({ clinicId: baseUser.id }).lean();
    if (profile) {
      enriched.clinicId = baseUser.id;
      enriched.profileImageUrl = profile.logoUrl || profile.logo;
      enriched.onboardingCompleted = true;
    } else {
      enriched.onboardingCompleted = false;
    }
  } else if (accountType === "patient") {
    const profile = await PatientProfile.findOne({ patientId: baseUser.id }).lean();
    if (profile) {
      enriched.patientId = baseUser.id;
      enriched.profileImageUrl = profile.profileImageUrl || profile.profileImage;
      enriched.onboardingCompleted = true;
    } else {
      enriched.onboardingCompleted = false;
    }
  }

  return enriched;
}

export async function registerUser(input) {
  await connectDB();
  const { name, email, phone, password, accountType } = input;
  const normalizedEmail = email.toLowerCase().trim();

  const Model = await getAccountModel(accountType);

  const existingUser = await Model.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await Model.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone || null,
    password: hashedPassword,
    isActive: true,
  });

  const token = createAuthToken({
    accountId: newUser._id,
    accountType,
  });

  const baseUser = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: accountType === "clinic" ? "clinic_owner" : accountType, // alias for backwards compatibility
    onboardingCompleted: false, // can be derived from profile later
  };

  const enrichedUser = await enrichUserData(baseUser, accountType);

  return {
    user: enrichedUser,
    token,
  };
}

export async function loginUser(input) {
  await connectDB();
  const { email, password, accountType } = input;
  const normalizedEmail = email.toLowerCase().trim();

  let user = null;
  let foundAccountType = null;
  let Model = null;

  if (accountType) {
    Model = await getAccountModel(accountType);
    user = await Model.findOne({ email: normalizedEmail }).select("+password").lean();
    foundAccountType = accountType;
  } else {
    const models = [
      { type: "admin", model: User },
      { type: "clinic", model: Clinic },
      { type: "doctor", model: Doctor },
      { type: "patient", model: Patient }
    ];
    for (const { type, model } of models) {
      user = await model.findOne({ email: normalizedEmail }).select("+password").lean();
      if (user) {
        foundAccountType = type;
        Model = model;
        break;
      }
    }
  }
  
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

  await Model.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  const token = createAuthToken({
    accountId: user._id,
    accountType: foundAccountType,
  });

  const baseUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: foundAccountType === "clinic" ? "clinic_owner" : foundAccountType, // alias for compatibility
    onboardingCompleted: true, // Needs profile check if required
  };

  const enrichedUser = await enrichUserData(baseUser, foundAccountType);

  return {
    user: enrichedUser,
    token,
  };
}

export async function getCurrentUser(accountId, accountType) {
  await connectDB();
  const Model = await getAccountModel(accountType);
  const user = await Model.findById(accountId).lean();
  
  if (!user || !user.isActive) return null;

  const baseUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: accountType === "clinic" ? "clinic_owner" : accountType,
    onboardingCompleted: true,
  };

  return await enrichUserData(baseUser, accountType);
}

export async function changePassword(accountId, accountType, currentPassword, newPassword) {
  await connectDB();
  const Model = await getAccountModel(accountType);
  const user = await Model.findById(accountId).select("+password").lean();
  
  if (!user || !user.isActive) {
    throw new Error("Account not found or inactive");
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Incorrect current password");
  }

  const hashedPassword = await hashPassword(newPassword);
  await Model.updateOne({ _id: accountId }, { password: hashedPassword });

  // Add audit log
  const { default: AuditLog } = await import("@/backend/models/AuditLog");
  let clinicId = null;
  if (accountType === "clinic") clinicId = accountId;
  // else we'd have to find it, but leaving simple for now
  
  await AuditLog.create({
    clinicId: clinicId, // Needs refinement based on accountType
    userId: accountId, // Used generally for the actor ID in existing audit log
    action: "user.password_changed",
    details: `${accountType} changed their password`,
  });
}
