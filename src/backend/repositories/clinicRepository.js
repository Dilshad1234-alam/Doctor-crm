import { connectDB } from "@/backend/database/connectDB";
import Clinic from "@/backend/models/Clinic";

export async function createClinic(data) {
  await connectDB();
  const clinic = new Clinic(data);
  await clinic.save();
  return clinic.toObject();
}

export async function findClinicByOwnerId(ownerId) {
  await connectDB();
  return Clinic.findOne({ ownerId }).lean().exec();
}

export async function findClinicById(clinicId) {
  await connectDB();
  return Clinic.findById(clinicId).lean().exec();
}

export async function updateClinicById(clinicId, data) {
  await connectDB();
  return Clinic.findByIdAndUpdate(clinicId, data, { new: true }).lean().exec();
}
