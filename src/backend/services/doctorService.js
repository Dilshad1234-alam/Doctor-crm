import mongoose from "mongoose";
import User from "@/backend/models/User";
import { createDoctorProfile, findDoctorById, updateDoctorById, findDoctorsByClinic } from "@/backend/repositories/doctorRepository";
import { findUserByEmail, updateUserById } from "@/backend/repositories/userRepository";
import { generateDoctorEmployeeId } from "@/backend/utils/generateDoctorEmployeeId";
import { requireRole, canManageDoctor, canViewDoctor, canUpdateDoctorAvailability, canManageDoctorSchedule, ROLES } from "@/backend/utils/permissions";
import { hashPassword } from "@/backend/utils/auth";
import { connectDB } from "@/backend/database/connectDB";
import { getDoctorSummary as getDoctorSummaryData } from "@/backend/services/doctorActivityService";

export async function createDoctorForClinic(ownerUser, input) {
  requireRole(ownerUser, [ROLES.CLINIC_OWNER]);
  await connectDB();
  
  const clinicId = ownerUser.clinicId;
  if (!clinicId) throw new Error("Clinic Owner has no associated clinic");

  // Check if email is already in use
  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new Error("Email is already in use by another user");
  }

  // Generate employee ID
  const employeeId = await generateDoctorEmployeeId(clinicId);
  const hashedPassword = await hashPassword(input.temporaryPassword);

  let session = null;
  let newUser = null;
  let createdProfile = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    console.warn("MongoDB transactions not fully supported in this environment, falling back to manual rollback");
    session = null;
  }

  try {
    const userData = {
      name: input.name,
      email: input.email.toLowerCase().trim(),
      phone: input.phone || null,
      password: hashedPassword,
      role: ROLES.DOCTOR,
      clinicId: clinicId,
      isActive: true,
    };

    // Create user
    const [user] = await User.create([userData], session ? { session } : {});
    newUser = user;

    // Create profile
    const profileData = {
      ...input,
      clinicId: clinicId,
      userId: user._id,
      employeeId: employeeId,
      createdByUserId: ownerUser.id || ownerUser._id,
      isActive: true,
      isAcceptingAppointments: true,
    };
    
    // Remove transient properties from profileData
    delete profileData.temporaryPassword;
    delete profileData.confirmPassword;
    delete profileData.name;
    delete profileData.email;

    [createdProfile] = await mongoose.models.DoctorProfile.create([profileData], session ? { session } : {});

    // Update user with doctorId
    await User.findByIdAndUpdate(
      user._id,
      { doctorId: createdProfile._id },
      session ? { session, new: true } : { new: true }
    );

    if (session) {
      await session.commitTransaction();
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    } else if (newUser) {
      // Manual rollback
      await User.findByIdAndDelete(newUser._id);
    }
    
    // Check for duplicate registration number index error
    if (error.code === 11000 && error.message.includes('registrationNumber')) {
      throw new Error("Registration number already exists in this clinic");
    }
    
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  return getSafeDoctorData(createdProfile, newUser);
}

export async function getDoctorsForClinic(ownerUser, query) {
  requireRole(ownerUser, [ROLES.CLINIC_OWNER, ROLES.SUPER_ADMIN, ROLES.RECEPTIONIST]);
  await connectDB();
  
  const clinicId = ownerUser.clinicId;
  const result = await findDoctorsByClinic(clinicId, query);
  
  const safeDoctors = result.doctors.map(doc => getSafeDoctorData(doc, doc.userId));
  
  return {
    ...result,
    doctors: safeDoctors,
  };
}

export async function getDoctorDetails(authUser, doctorId) {
  await connectDB();
  const doctor = await findDoctorById(doctorId, authUser.clinicId);
  
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  if (!canViewDoctor(authUser, doctor)) {
    throw new Error("Unauthorized access to doctor profile");
  }

  return getSafeDoctorData(doctor, doctor.userId);
}

export async function updateDoctorForClinic(ownerUser, doctorId, input) {
  await connectDB();
  const doctor = await findDoctorById(doctorId, ownerUser.clinicId);
  
  if (!doctor) throw new Error("Doctor not found");
  
  if (!canManageDoctor(ownerUser, doctor)) {
    throw new Error("Unauthorized to edit this doctor");
  }

  // Update user name/phone if they were provided
  if (input.name || input.phone) {
    const userUpdate = {};
    if (input.name) userUpdate.name = input.name;
    if (input.phone) userUpdate.phone = input.phone;
    await updateUserById(doctor.userId._id, userUpdate);
  }
  
  // Clean input from user-related or forbidden fields
  const safeInput = { ...input };
  delete safeInput.name;
  delete safeInput.email;
  delete safeInput.phone;
  delete safeInput.employeeId;
  delete safeInput.clinicId;
  delete safeInput.userId;
  delete safeInput.role;
  delete safeInput.password;

  safeInput.lastUpdatedByUserId = ownerUser.id || ownerUser._id;

  const updatedDoctor = await updateDoctorById(doctorId, ownerUser.clinicId, safeInput);
  
  // Need fresh user ref for safe output
  const userRef = await User.findById(updatedDoctor.userId);
  return getSafeDoctorData(updatedDoctor, userRef);
}

export async function changeDoctorStatus(ownerUser, doctorId, isActive) {
  await connectDB();
  const doctor = await findDoctorById(doctorId, ownerUser.clinicId);
  
  if (!doctor) throw new Error("Doctor not found");
  if (!canManageDoctor(ownerUser, doctor)) {
    throw new Error("Unauthorized to edit this doctor");
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch(e) {
    session = null;
  }

  try {
    const updatedDoctor = await mongoose.models.DoctorProfile.findOneAndUpdate(
      { _id: doctorId, clinicId: ownerUser.clinicId },
      { $set: { isActive, lastUpdatedByUserId: ownerUser.id || ownerUser._id } },
      session ? { session, new: true } : { new: true }
    );

    await User.findByIdAndUpdate(
      doctor.userId._id,
      { $set: { isActive } },
      session ? { session } : {}
    );

    if (session) await session.commitTransaction();

    const userRef = await User.findById(updatedDoctor.userId);
    return getSafeDoctorData(updatedDoctor, userRef);
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }
}

export async function updateOwnDoctorAvailability(doctorUser, input) {
  requireRole(doctorUser, [ROLES.DOCTOR]);
  await connectDB();
  
  const doctor = await findDoctorById(doctorUser.doctorId, doctorUser.clinicId);
  if (!doctor) throw new Error("Doctor profile not found");
  
  if (!canUpdateDoctorAvailability(doctorUser, doctor)) {
    throw new Error("Unauthorized to update this availability");
  }

  const updatedDoctor = await updateDoctorById(doctorUser.doctorId, doctorUser.clinicId, {
    availability: input.availability,
    lastUpdatedByUserId: doctorUser.id || doctorUser._id,
  });

  return getSafeDoctorData(updatedDoctor, updatedDoctor.userId);
}

export async function updateDoctorAvailabilityByOwner(ownerUser, doctorId, input) {
  requireRole(ownerUser, [ROLES.CLINIC_OWNER]);
  await connectDB();
  
  const doctor = await findDoctorById(doctorId, ownerUser.clinicId);
  if (!doctor) throw new Error("Doctor profile not found");
  
  if (!canUpdateDoctorAvailability(ownerUser, doctor)) {
    throw new Error("Unauthorized to update this availability");
  }

  const updatedDoctor = await updateDoctorById(doctorId, ownerUser.clinicId, {
    availability: input.availability,
    lastUpdatedByUserId: ownerUser.id || ownerUser._id,
  });

  return getSafeDoctorData(updatedDoctor, updatedDoctor.userId);
}

export async function getDoctorSummary(authUser, doctorId) {
  await connectDB();
  const doctor = await findDoctorById(doctorId, authUser.clinicId);
  
  if (!doctor || !canViewDoctor(authUser, doctor)) {
    throw new Error("Doctor not found or unauthorized");
  }

  const safeDoctor = getSafeDoctorData(doctor, doctor.userId);
  const metrics = await getDoctorSummaryData(doctorId, authUser.clinicId);
  
  return {
    doctor: safeDoctor,
    metrics
  };
}

// Helpers
function getSafeDoctorData(profile, user) {
  if (!profile || !user) return null;
  
  return {
    id: profile._id.toString(),
    employeeId: profile.employeeId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    title: profile.title,
    specialization: profile.specialization,
    subSpecialization: profile.subSpecialization,
    qualification: profile.qualification,
    registrationNumber: profile.registrationNumber,
    registrationCouncil: profile.registrationCouncil,
    experienceYears: profile.experienceYears,
    consultationFee: profile.consultationFee,
    followUpFee: profile.followUpFee,
    followUpValidityDays: profile.followUpValidityDays,
    gender: profile.gender,
    bio: profile.bio,
    languages: profile.languages,
    consultationTypes: profile.consultationTypes,
    availability: profile.availability,
    defaultSlotDuration: profile.defaultSlotDuration,
    maxAppointmentsPerDay: profile.maxAppointmentsPerDay,
    isAcceptingAppointments: profile.isAcceptingAppointments,
    isActive: profile.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
