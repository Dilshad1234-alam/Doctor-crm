import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";
import ClinicProfile from "@/backend/models/ClinicProfile";

export async function createClinic(data) {
  await connectDB();
  const clinic = new ClinicProfile(data);
  await clinic.save();
  return clinic.toObject();
}

export async function findClinicProfile(clinicId) {
  await connectDB();
  return ClinicProfile.findOne({ clinicId }).lean().exec();
}

export async function findClinicById(clinicId) {
  await connectDB();
  return ClinicProfile.findById(clinicId).lean().exec();
}

export async function updateClinicById(clinicId, data) {
  await connectDB();
  return ClinicProfile.findByIdAndUpdate(clinicId, data, { new: true }).lean().exec();
}
