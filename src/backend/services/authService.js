import { createUser, findUserByEmail, findUserById, updateUserById } from "@/backend/repositories/userRepository";
import { hashPassword, comparePassword, createAuthToken } from "@/backend/utils/auth";
import { ROLES } from "@/backend/utils/permissions";

export async function registerClinicOwner(input) {
  const { name, email, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: ROLES.CLINIC_OWNER,
    clinicId: null,
    doctorId: null,
    isActive: true,
  });

  const token = createAuthToken({
    userId: newUser._id,
    role: newUser.role,
    clinicId: newUser.clinicId,
    doctorId: newUser.doctorId,
  });

  return {
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      clinicId: newUser.clinicId,
      doctorId: newUser.doctorId,
      onboardingCompleted: false, // Clinic owners without a clinic haven't onboarded
    },
    token,
  };
}

export async function loginUser(input) {
  const { email, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user with password included for comparison
  const user = await findUserByEmail(normalizedEmail, { includePassword: true });
  
  if (!user) {
    throw new Error("Invalid email or password"); // Generic message
  }

  if (!user.isActive) {
    throw new Error("Account has been deactivated. Please contact support.");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password"); // Generic message
  }

  // Update last login
  await updateUserById(user._id, { lastLoginAt: new Date() });

  const token = createAuthToken({
    userId: user._id,
    role: user.role,
    clinicId: user.clinicId,
    doctorId: user.doctorId,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      clinicId: user.clinicId,
      doctorId: user.doctorId,
      onboardingCompleted: !!user.clinicId, // True if they have a clinic
    },
    token,
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user || !user.isActive) return null;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    clinicId: user.clinicId,
    doctorId: user.doctorId,
    onboardingCompleted: !!user.clinicId,
  };
}
