import mongoose from "mongoose";
import User from "@/backend/models/User";
import DoctorProfile from "@/backend/models/DoctorProfile";
import { createDoctorProfile, findDoctorById, updateDoctorById, findDoctorsByClinic } from "@/backend/repositories/doctorRepository";
import { generateDoctorEmployeeId } from "@/backend/utils/generateDoctorEmployeeId";
import { requireAccountType, canManageDoctor, canViewDoctor, canUpdateDoctorAvailability, ACCOUNT_TYPES } from "@/backend/utils/permissions";
import { hashPassword } from "@/backend/utils/auth";
import { connectDB } from "@/backend/database/connectDB";
import { getDoctorSummary as getDoctorSummaryData } from "@/backend/services/doctorActivityService";

export async function createDoctorForClinic(ownerUser, input) {
  requireAccountType(ownerUser, [ACCOUNT_TYPES.CLINIC]);
  await connectDB();
  
  const clinicId = ownerUser.clinicId;
  if (!clinicId) throw new Error("Clinic Owner has no associated clinic");

  const existingDoctor = await User.findOne({ email: input.email.toLowerCase().trim() });
  if (existingDoctor) {
    throw new Error("Email is already in use by another user");
  }

  // const employeeId = await generateDoctorEmployeeId(clinicId);
  const hashedPassword = await hashPassword(input.temporaryPassword);

  let session = null;
  let newDoctor = null;
  let createdProfile = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    session = null;
  }

  try {
    const docData = {
      name: input.name,
      email: input.email.toLowerCase().trim(),
      phone: input.phone || null,
      password: hashedPassword,
      isActive: true,
    };

    const [doctor] = await User.create([docData], session ? { session } : {});
    newDoctor = doctor;

    const profileData = {
      ...input,
      clinicId: clinicId,
      doctorId: doctor._id,
      userId: doctor._id, // temporarily use doctor._id as userId to satisfy schema
      createdById: ownerUser.id || ownerUser._id,
      createdByModel: "Clinic",
      isActive: true,
      isAcceptingAppointments: true,
    };
    
    delete profileData.temporaryPassword;
    delete profileData.confirmPassword;
    delete profileData.name;
    delete profileData.email;

    [createdProfile] = await DoctorProfile.create([profileData], session ? { session } : {});

    if (session) {
      await session.commitTransaction();
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    } else if (newDoctor) {
      await User.findByIdAndDelete(newDoctor._id);
    }
    
    if (error.code === 11000 && error.message.includes('registrationNumber')) {
      throw new Error("Registration number already exists in this clinic");
    }
    
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  return getSafeDoctorData(createdProfile, newDoctor);
}

export async function getDoctorsForClinic(ownerUser, query) {
  requireAccountType(ownerUser, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.ADMIN, ACCOUNT_TYPES.DOCTOR, ACCOUNT_TYPES.PATIENT]);
  await connectDB();
  
  let clinicId = ownerUser.clinicId;
  if (!clinicId && query.clinicId) {
    clinicId = query.clinicId;
  }
  
  if (!clinicId && ownerUser.accountType === ACCOUNT_TYPES.PATIENT) {
    const PatientClinic = mongoose.models.PatientClinic || mongoose.model("PatientClinic");
    const link = await PatientClinic.findOne({ patientId: ownerUser.accountId }).sort({ createdAt: -1 });
    if (link) {
      clinicId = link.clinicId;
    }
  }
  
  if (!clinicId) {
    throw new Error("clinicId is required");
  }

  const result = await findDoctorsByClinic(clinicId, query);
  
  const safeDoctors = result.doctors.map(doc => getSafeDoctorData(doc, doc.doctorId));
  
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

  return getSafeDoctorData(doctor, doctor.doctorId);
}

export async function updateDoctorForClinic(ownerUser, doctorId, input) {
  await connectDB();
  const doctor = await findDoctorById(doctorId, ownerUser.clinicId);
  
  if (!doctor) throw new Error("Doctor not found");
  
  if (!canManageDoctor(ownerUser, doctor)) {
    throw new Error("Unauthorized to edit this doctor");
  }

  if (input.name || input.phone) {
    const docUpdate = {};
    if (input.name) docUpdate.name = input.name;
    if (input.phone) docUpdate.phone = input.phone;
    await User.updateOne({ _id: doctor.doctorId._id }, { $set: docUpdate });
  }
  
  const safeInput = { ...input };
  delete safeInput.name;
  delete safeInput.email;
  delete safeInput.phone;
  // delete safeInput.employeeId;
  delete safeInput.clinicId;
  delete safeInput.doctorId;
  delete safeInput.password;

  safeInput.lastUpdatedById = ownerUser.id || ownerUser._id;
  safeInput.lastUpdatedByModel = "Clinic";

  const updatedDoctor = await updateDoctorById(doctorId, ownerUser.clinicId, safeInput);
  
  const docRef = await User.findById(updatedDoctor.doctorId);
  return getSafeDoctorData(updatedDoctor, docRef);
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
    const updatedDoctor = await DoctorProfile.findOneAndUpdate(
      { doctorId: doctorId, clinicId: ownerUser.clinicId },
      { $set: { isActive, lastUpdatedById: ownerUser.id || ownerUser._id, lastUpdatedByModel: "Clinic" } },
      session ? { session, new: true } : { new: true }
    );

    await User.findByIdAndUpdate(
      doctor.doctorId._id,
      { $set: { isActive } },
      session ? { session } : {}
    );

    if (session) await session.commitTransaction();

    const docRef = await User.findById(updatedDoctor.doctorId);
    return getSafeDoctorData(updatedDoctor, docRef);
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }
}

export async function updateOwnDoctorAvailability(doctorUser, input) {
  requireAccountType(doctorUser, [ACCOUNT_TYPES.DOCTOR]);
  await connectDB();
  
  const doctor = await findDoctorById(doctorUser.doctorId, doctorUser.clinicId);
  if (!doctor) throw new Error("Doctor profile not found");
  
  if (!canUpdateDoctorAvailability(doctorUser, doctor)) {
    throw new Error("Unauthorized to update this availability");
  }

  const updatedDoctor = await updateDoctorById(doctorUser.doctorId, doctorUser.clinicId, {
    availability: input.availability,
    isAvailable: input.isAvailable,
    availableDays: input.availableDays,
    startTime: input.startTime,
    endTime: input.endTime,
    slotDuration: input.slotDuration,
    breakStart: input.breakStart,
    breakEnd: input.breakEnd,
    maxPatientsPerDay: input.maxPatientsPerDay,
    lastUpdatedById: doctorUser.id || doctorUser._id,
    lastUpdatedByModel: "Doctor",
  });

  return getSafeDoctorData(updatedDoctor, updatedDoctor.doctorId);
}

export async function updateDoctorAvailabilityByOwner(ownerUser, doctorId, input) {
  requireAccountType(ownerUser, [ACCOUNT_TYPES.CLINIC]);
  await connectDB();
  
  const doctor = await findDoctorById(doctorId, ownerUser.clinicId);
  if (!doctor) throw new Error("Doctor profile not found");
  
  if (!canUpdateDoctorAvailability(ownerUser, doctor)) {
    throw new Error("Unauthorized to update this availability");
  }

  const updatedDoctor = await updateDoctorById(doctorId, ownerUser.clinicId, {
    availability: input.availability,
    isAvailable: input.isAvailable,
    availableDays: input.availableDays,
    startTime: input.startTime,
    endTime: input.endTime,
    slotDuration: input.slotDuration,
    breakStart: input.breakStart,
    breakEnd: input.breakEnd,
    maxPatientsPerDay: input.maxPatientsPerDay,
    lastUpdatedById: ownerUser.id || ownerUser._id,
    lastUpdatedByModel: "Clinic",
  });

  return getSafeDoctorData(updatedDoctor, updatedDoctor.doctorId);
}

export async function getDoctorSummary(authUser, doctorId) {
  await connectDB();
  const doctor = await findDoctorById(doctorId, authUser.clinicId);
  
  if (!doctor || !canViewDoctor(authUser, doctor)) {
    throw new Error("Doctor not found or unauthorized");
  }

  const safeDoctor = getSafeDoctorData(doctor, doctor.doctorId);
  const metrics = await getDoctorSummaryData(doctorId, authUser.clinicId);
  
  return {
    ...safeDoctor,
    metrics
  };
}

function getSafeDoctorData(profile, user) {
  if (!profile || !user) return null;
  
  const profileObj = profile.toObject ? profile.toObject() : { ...profile };
  delete profileObj.doctorId; // Remove populated doctorId from profile to prevent recursion/duplication
  
  return {
    doctor: {
      _id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    },
    profile: {
      ...profileObj,
      _id: profile._id ? profile._id.toString() : profile.id,
      id: profile._id ? profile._id.toString() : profile.id,
    }
  };
}
