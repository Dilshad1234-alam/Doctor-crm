import DoctorProfile from "@/backend/models/DoctorProfile";
import Doctor from "@/backend/models/Doctor";
import mongoose from "mongoose";

export async function createDoctorProfile(data, session = null) {
  const options = session ? { session } : {};
  const [profile] = await DoctorProfile.create([data], options);
  return profile;
}

export async function findDoctorById(doctorId, clinicId) {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return null;
  }
  return DoctorProfile.findOne({
    doctorId: doctorId,
    clinicId,
  }).populate("doctorId", "name email phone isActive lastLoginAt");
}

export async function findDoctorByDoctorId(doctorId) {
  return DoctorProfile.findOne({ doctorId }).populate("doctorId", "name email phone isActive");
}

export async function findDoctorsByClinic(clinicId, query = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    specialization = "",
    gender = "",
    consultationType = "all",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (page - 1) * limit;

  // Build filter
  const filter = { clinicId: new mongoose.Types.ObjectId(clinicId) };

  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  if (specialization) {
    filter.specialization = { $regex: specialization, $options: "i" };
  }
  
  if (gender) {
    filter.gender = gender;
  }

  if (consultationType === "inPerson") {
    filter["consultationTypes.inPerson"] = true;
  } else if (consultationType === "online") {
    filter["consultationTypes.online"] = true;
  }

  if (search) {
    filter.$or = [
      { employeeId: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } },
      { qualification: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  let dbQuery = DoctorProfile.find(filter)
    .populate({
      path: "doctorId",
      select: "name email phone isActive",
      match: search ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ]
      } : undefined
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const rawDoctors = await dbQuery.exec();

  let doctors = rawDoctors;
  if (search) {
    doctors = rawDoctors.filter(doc => {
      const matchesProfile = (
        (doc.employeeId && doc.employeeId.toLowerCase().includes(search.toLowerCase())) ||
        (doc.registrationNumber && doc.registrationNumber.toLowerCase().includes(search.toLowerCase())) ||
        (doc.qualification && doc.qualification.some(q => q.toLowerCase().includes(search.toLowerCase())))
      );
      return matchesProfile || doc.doctorId !== null;
    });
  }

  const total = await DoctorProfile.countDocuments(filter);

  return {
    doctors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateDoctorById(doctorId, clinicId, data) {
  return DoctorProfile.findOneAndUpdate(
    { doctorId: doctorId, clinicId },
    { $set: data },
    { new: true, runValidators: true }
  ).populate("doctorId", "name email phone isActive");
}

export async function countDoctorsByClinic(clinicId) {
  return DoctorProfile.countDocuments({ clinicId });
}

export async function countActiveDoctorsByClinic(clinicId) {
  return DoctorProfile.countDocuments({ clinicId, isActive: true });
}

export async function findDoctorByRegistrationNumber(registrationNumber) {
  return DoctorProfile.findOne({ registrationNumber });
}

export async function findDoctorByEmployeeId(clinicId, employeeId) {
  return DoctorProfile.findOne({ clinicId, employeeId });
}

export async function findDoctorsBySpecialization(clinicId, specialization) {
  return DoctorProfile.find({
    clinicId,
    specialization: { $regex: specialization, $options: "i" },
  });
}
