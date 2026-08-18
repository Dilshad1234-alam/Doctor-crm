import mongoose from "mongoose";
import Patient from "../models/Patient.js";
import PatientProfile from "../models/PatientProfile.js";
import Appointment from "../models/Appointment.js";
import { calculateAge } from "../utils/calculateAge.js";

const formatPatient = (user, profile) => {
  if (!user) return null;
  const p = profile || {};
  return {
    _id: user._id, // frontend expects _id
    patientId: user._id,
    profileId: p._id,
    patientCode: p.patientCode || "",
    fullName: user.name,
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ").slice(1).join(" ") || "",
    email: user.email,
    phone: user.phone,
    dateOfBirth: p.dateOfBirth,
    age: p.age !== undefined ? p.age : (p.dateOfBirth ? calculateAge(p.dateOfBirth) : undefined),
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    maritalStatus: p.maritalStatus,
    occupation: p.occupation,
    address: p.address,
    emergencyContact: p.emergencyContact,
    allergies: p.allergies || [],
    chronicConditions: p.chronicConditions || [],
    currentMedicines: p.currentMedicines || [],
    pastMedicalHistory: p.pastMedicalHistory || [],
    familyMedicalHistory: p.familyMedicalHistory || [],
    habits: p.habits,
    insurance: p.insurance,
    notes: p.notes,
    clinicId: p.clinicId,
    isActive: user.isActive,
    createdAt: p.createdAt || user.createdAt,
    updatedAt: p.updatedAt || user.updatedAt,
  };
};

export async function createPatient(data) {
  const { name, fullName, firstName, lastName, email, phone, password, role, clinicId, ...profileData } = data;
  
  const finalName = name || fullName || `${firstName || ""} ${lastName || ""}`.trim() || "Unknown Patient";

  const user = new Patient({
    name: finalName,
    email: email || undefined,
    phone: phone || undefined,
    password: password || "temp1234",
    isActive: true,
  });
  await user.save();

  const profile = new PatientProfile({
    patientId: user._id,
    clinicId: clinicId,
    ...profileData,
  });
  await profile.save();

  return formatPatient(user, profile);
}

export async function findPatientById(patientId, clinicId) {
  const user = await Patient.findById(patientId).lean();
  if (!user) return null;

  const profile = await PatientProfile.findOne({ patientId }).lean();
  
  return formatPatient(user, profile);
}

export async function findPatientByCode(patientCode, clinicId) {
  const profile = await PatientProfile.findOne({ patientCode, clinicId }).lean();
  if (!profile) return null;
  const user = await Patient.findById(profile.patientId).lean();
  return formatPatient(user, profile);
}

export async function findPatientByPhone(phone) {
  const user = await Patient.findOne({ phone }).lean();
  if (!user) return null;
  const profile = await PatientProfile.findOne({ patientId: user._id }).lean();
  return formatPatient(user, profile);
}

export async function findPatientByEmail(email) {
  const user = await Patient.findOne({ email }).lean();
  if (!user) return null;
  const profile = await PatientProfile.findOne({ patientId: user._id }).lean();
  return formatPatient(user, profile);
}

import PatientClinic from "../models/PatientClinic.js";

export async function findPatientsByClinic(clinicId, query) {
  const { page = 1, limit = 10, search, gender, bloodGroup, status, sortBy, sortOrder } = query;
  
  const distinctPatientIdsFromAppts = await Appointment.distinct("patientId", { clinicId });
  const clinicProfiles = await PatientProfile.find({ clinicId }).select('patientId').lean();
  const patientClinics = await PatientClinic.find({ clinicId }).select('patientId').lean();
  
  const distinctPatientIdsFromProfiles = clinicProfiles.map(p => p.patientId);
  const distinctPatientIdsFromLink = patientClinics.map(p => p.patientId);
  
  const allValidPatientIds = [...new Set([
    ...distinctPatientIdsFromAppts.map(String), 
    ...distinctPatientIdsFromProfiles.map(String),
    ...distinctPatientIdsFromLink.map(String)
  ])];
  
  let profileFilter = { patientId: { $in: allValidPatientIds } };
  if (gender) profileFilter.gender = gender;
  if (bloodGroup) profileFilter.bloodGroup = bloodGroup;
  
  const profiles = await PatientProfile.find(profileFilter).lean();
  const matchedPatientIds = profiles.map(p => p.patientId);
  
  let userFilter = { _id: { $in: matchedPatientIds } };
  if (status === "active") userFilter.isActive = true;
  else if (status === "inactive") userFilter.isActive = false;
  
  if (search) {
    const searchRegex = new RegExp(search, "i");
    userFilter.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { email: searchRegex }
    ];
  }

  const sort = { [sortBy === "fullName" ? "name" : sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    Patient.find(userFilter).sort(sort).skip(skip).limit(limit).lean(),
    Patient.countDocuments(userFilter)
  ]);

  const finalPatients = users.map(u => {
    const p = profiles.find(pr => pr.patientId.toString() === u._id.toString());
    return formatPatient(u, p);
  });

  return {
    patients: finalPatients,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updatePatientById(patientId, clinicId, data) {
  const { name, email, phone, ...profileData } = data;
  
  if (name || email || phone) {
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (phone) userUpdate.phone = phone;
    await Patient.findByIdAndUpdate(patientId, { $set: userUpdate });
  }

  if (Object.keys(profileData).length > 0) {
    await PatientProfile.findOneAndUpdate(
      { patientId },
      { $set: { ...profileData, clinicId } }, 
      { new: true, upsert: true }
    );
  }

  return findPatientById(patientId, clinicId);
}

export async function countPatientsByClinic(clinicId) {
  return PatientProfile.countDocuments({ clinicId: clinicId });
}

export async function countActivePatientsByClinic(clinicId) {
  const profiles = await PatientProfile.find({ clinicId: clinicId }).select('patientId').lean();
  const patientIds = profiles.map(p => p.patientId);
  return Patient.countDocuments({ _id: { $in: patientIds }, isActive: true });
}

export async function findPatientsByDoctor(clinicId, doctorId, query) {
  const { page = 1, limit = 10, search, gender, bloodGroup, status, sortBy, sortOrder } = query;
  
  const distinctPatientIds = await Appointment.distinct("patientId", { clinicId, doctorId });
  
  let profileFilter = { patientId: { $in: distinctPatientIds } };
  if (gender) profileFilter.gender = gender;
  if (bloodGroup) profileFilter.bloodGroup = bloodGroup;
  
  const profiles = await PatientProfile.find(profileFilter).lean();
  const patientIds = profiles.map(p => p.patientId);
  
  let userFilter = { _id: { $in: patientIds } };
  if (status === "active") userFilter.isActive = true;
  else if (status === "inactive") userFilter.isActive = false;
  
  if (search) {
    const searchRegex = new RegExp(search, "i");
    userFilter.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { email: searchRegex }
    ];
  }

  const sort = { [sortBy === "fullName" ? "name" : sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    Patient.find(userFilter).sort(sort).skip(skip).limit(limit).lean(),
    Patient.countDocuments(userFilter)
  ]);

  const finalPatients = users.map(u => {
    const p = profiles.find(pr => pr.patientId.toString() === u._id.toString());
    return formatPatient(u, p);
  });

  return {
    patients: finalPatients,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
