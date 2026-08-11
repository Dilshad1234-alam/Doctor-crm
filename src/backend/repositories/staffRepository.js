import { connectDB } from "@/backend/database/connectDB";
import StaffProfile from "@/backend/models/StaffProfile";
import Counter from "@/backend/models/Counter";

export async function createStaffProfile(data, session = null) {
  await connectDB();
  const options = session ? { session } : {};
  const staff = new StaffProfile(data);
  await staff.save(options);
  return staff.toObject();
}

export async function findStaffById(staffId, clinicId) {
  await connectDB();
  return StaffProfile.findOne({ _id: staffId, clinicId })
    .populate("userId", "name email phone isActive lastLoginAt")
    .lean()
    .exec();
}

export async function findStaffByUserId(userId, clinicId) {
  await connectDB();
  return StaffProfile.findOne({ userId, clinicId }).lean().exec();
}

export async function getStaffList(clinicId, query = {}) {
  await connectDB();
  
  const filter = { clinicId };
  if (query.role && query.role !== "all") filter.role = query.role;
  if (query.status && query.status !== "all") filter.status = query.status;
  
  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    // We will need to do a lookup or just filter by staffCode/phone for now
    filter.$or = [
      { staffCode: searchRegex },
      { employeeId: searchRegex }
    ];
  }

  return StaffProfile.find(filter)
    .populate("userId", "name email phone isActive lastLoginAt")
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}

export async function updateStaffProfile(staffId, clinicId, data, session = null) {
  await connectDB();
  const options = session ? { session, new: true } : { new: true };
  return StaffProfile.findOneAndUpdate(
    { _id: staffId, clinicId },
    { $set: data },
    options
  ).lean().exec();
}

export async function getStaffStats(clinicId) {
  await connectDB();
  const stats = await StaffProfile.aggregate([
    { $match: { clinicId } },
    { $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
        receptionists: { $sum: { $cond: [{ $eq: ["$role", "receptionist"] }, 1, 0] } },
        assistants: { $sum: { $cond: [{ $eq: ["$role", "assistant"] }, 1, 0] } },
        accountants: { $sum: { $cond: [{ $eq: ["$role", "accountant"] }, 1, 0] } },
      }
    }
  ]);
  
  return stats[0] || { total: 0, active: 0, receptionists: 0, assistants: 0, accountants: 0 };
}

export async function generateStaffCode(clinicId, session = null) {
  await connectDB();
  const options = session ? { session, new: true, upsert: true } : { new: true, upsert: true };
  const counterId = `staffCode_${clinicId}`;
  
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    options
  );
  
  const seqStr = String(counter.seq).padStart(6, "0");
  return `STF-${seqStr}`;
}
