import DoctorProfile from "@/backend/models/DoctorProfile";
import mongoose from "mongoose";

export async function createDoctorProfile(data, session = null) {
  const options = session ? { session } : {};
  const [profile] = await DoctorProfile.create([data], options);
  return profile;
}

export async function findDoctorById(doctorId, clinicId) {
  return DoctorProfile.findOne({
    _id: doctorId,
    clinicId,
  }).populate("userId", "name email phone isActive role lastLoginAt");
}

export async function findDoctorByUserId(userId) {
  return DoctorProfile.findOne({ userId }).populate("userId", "name email phone isActive role");
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

  // Build sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Query
  let dbQuery = DoctorProfile.find(filter)
    .populate({
      path: "userId",
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

  // If search is provided, we need to filter out docs where userId didn't match (if we were relying on user fields for search)
  // And recalculate total because populate match doesn't filter the parent document automatically in MongoDB
  let doctors = rawDoctors;
  if (search) {
    doctors = rawDoctors.filter(doc => {
      // If it matched the profile-level $or, we keep it
      const matchesProfile = (
        (doc.employeeId && doc.employeeId.toLowerCase().includes(search.toLowerCase())) ||
        (doc.registrationNumber && doc.registrationNumber.toLowerCase().includes(search.toLowerCase())) ||
        (doc.qualification && doc.qualification.some(q => q.toLowerCase().includes(search.toLowerCase())))
      );
      // Or if it matched the user-level populate
      return matchesProfile || doc.userId !== null;
    });
  }

  // Since filtering happens post-query if search is complex, pagination total is tricky.
  // For production, aggregation pipeline is better for joining and searching across collections.
  // Let's keep it simple for now, relying mostly on profile fields, or total count without full text search precision.
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
    { _id: doctorId, clinicId },
    { $set: data },
    { new: true, runValidators: true }
  ).populate("userId", "name email phone isActive");
}

export async function countDoctorsByClinic(clinicId) {
  return DoctorProfile.countDocuments({ clinicId });
}

export async function countActiveDoctorsByClinic(clinicId) {
  return DoctorProfile.countDocuments({ clinicId, isActive: true });
}

export async function findDoctorByRegistrationNumber(registrationNumber) {
  // Global check across all clinics to prevent reuse of registration numbers if required
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
