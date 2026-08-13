import mongoose from "mongoose";
import User from "../models/User.js";
import PatientProfile from "../models/PatientProfile.js";

// Helper to construct a unified patient object for the frontend
const formatPatient = (user, profile) => {
  if (!user) return null;
  const p = profile || {};
  return {
    _id: user._id, // we use userId as the primary ID for relationships
    userId: user._id,
    profileId: p._id,
    patientCode: p.patientCode || "",
    fullName: user.name,
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ").slice(1).join(" ") || "",
    email: user.email,
    phone: user.phone,
    dateOfBirth: p.dateOfBirth,
    age: p.age,
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
    clinics: p.clinics || [],
    isActive: user.isActive,
    createdAt: p.createdAt || user.createdAt,
    updatedAt: p.updatedAt || user.updatedAt,
  };
};

export async function createPatient(data) {
  const { name, fullName, firstName, lastName, email, phone, password, role, clinicId, ...profileData } = data;
  
  const finalName = name || fullName || `${firstName || ""} ${lastName || ""}`.trim() || "Unknown Patient";

  // 1. Create User
  const user = new User({
    name: finalName,
    email: email || undefined,
    phone: phone || undefined,
    password: password || "temp1234", // Dummy for clinic-created patients
    role: "patient",
    onboardingCompleted: true,
    isActive: true,
  });
  await user.save();

  // 2. Create Profile
  const profile = new PatientProfile({
    userId: user._id,
    clinics: clinicId ? [clinicId] : [],
    ...profileData,
  });
  await profile.save();

  return formatPatient(user, profile);
}

export async function findPatientById(userId, clinicId) {
  const user = await User.findById(userId).lean();
  if (!user || user.role !== "patient") return null;

  const profile = await PatientProfile.findOne({ userId }).lean();
  
  // If clinicId is provided, we can optionally check if they belong to it,
  // but since they are global, we just return the unified object.
  return formatPatient(user, profile);
}

export async function findPatientByCode(patientCode, clinicId) {
  const profile = await PatientProfile.findOne({ patientCode, clinics: clinicId }).lean();
  if (!profile) return null;
  const user = await User.findById(profile.userId).lean();
  return formatPatient(user, profile);
}

export async function findPatientByPhone(phone) {
  const user = await User.findOne({ phone, role: "patient" }).lean();
  if (!user) return null;
  const profile = await PatientProfile.findOne({ userId: user._id }).lean();
  return formatPatient(user, profile);
}

export async function findPatientByEmail(email) {
  const user = await User.findOne({ email, role: "patient" }).lean();
  if (!user) return null;
  const profile = await PatientProfile.findOne({ userId: user._id }).lean();
  return formatPatient(user, profile);
}

export async function findPatientsByClinic(clinicId, query) {
  const { page, limit, search, gender, bloodGroup, status, sortBy, sortOrder } = query;
  
  // Find profiles matching the clinic
  let profileFilter = { clinics: clinicId };
  if (gender) profileFilter.gender = gender;
  if (bloodGroup) profileFilter.bloodGroup = bloodGroup;
  
  const profiles = await PatientProfile.find(profileFilter).lean();
  const userIds = profiles.map(p => p.userId);
  
  let userFilter = { _id: { $in: userIds }, role: "patient" };
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

  const sort = { [sortBy === "fullName" ? "name" : sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(userFilter).sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(userFilter)
  ]);

  const finalPatients = users.map(u => {
    const p = profiles.find(pr => pr.userId.toString() === u._id.toString());
    return formatPatient(u, p);
  });

  return {
    patients: finalPatients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updatePatientById(userId, clinicId, data) {
  const { name, email, phone, ...profileData } = data;
  
  if (name || email || phone) {
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (phone) userUpdate.phone = phone;
    await User.findByIdAndUpdate(userId, { $set: userUpdate });
  }

  if (Object.keys(profileData).length > 0) {
    await PatientProfile.findOneAndUpdate(
      { userId },
      { $set: profileData, $addToSet: { clinics: clinicId } }, // ensure clinic is added
      { new: true, upsert: true }
    );
  }

  return findPatientById(userId, clinicId);
}

export async function countPatientsByClinic(clinicId) {
  return PatientProfile.countDocuments({ clinics: clinicId });
}

export async function countActivePatientsByClinic(clinicId) {
  const profiles = await PatientProfile.find({ clinics: clinicId }).select('userId').lean();
  const userIds = profiles.map(p => p.userId);
  return User.countDocuments({ _id: { $in: userIds }, isActive: true });
}
