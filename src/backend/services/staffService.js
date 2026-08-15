import mongoose from "mongoose";
import { createStaffProfile, findStaffById, updateStaffProfile, getStaffList as repoGetStaffList, getStaffStats, generateStaffCode } from "@/backend/repositories/staffRepository";
import { requireAccountType, ACCOUNT_TYPES } from "@/backend/utils/permissions";
import { DEFAULT_ROLE_PERMISSIONS } from "@/backend/config/rolePermissions";
import AuditLog from "@/backend/models/AuditLog";
import { connectDB } from "@/backend/database/connectDB";

export async function createStaff(authUser, input) {
  requireAccountType(authUser, ACCOUNT_TYPES.CLINIC);
  await connectDB();
  
  const { name, email, phone, role, employeeId, joiningDate } = input;
  
  if (!["receptionist", "assistant", "accountant"].includes(role)) {
    throw new Error("Invalid staff role");
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const staffCode = await generateStaffCode(authUser.clinicId, session);
    const permissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
    
    const staffProfile = await createStaffProfile({
      clinicId: authUser.clinicId,
      name,
      email: email.toLowerCase().trim(),
      phone,
      staffCode,
      role,
      employeeId,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      permissions,
      status: "active",
      createdById: authUser.accountId,
      createdByModel: "Clinic"
    }, session);
    
    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.accountId,
      action: "staff.created",
      details: `Created staff member ${name} (${staffCode}) as ${role}`
    }], { session });

    await session.commitTransaction();
    session.endSession();
    
    return staffProfile;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

export async function getStaffList(authUser, query) {
  requireAccountType(authUser, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.ADMIN]);
  await connectDB();
  
  const clinicId = authUser.clinicId;
  let staff = await repoGetStaffList(clinicId, query);
  
  if (query.search) {
    const s = query.search.toLowerCase();
    staff = staff.filter(st => 
      st.staffCode.toLowerCase().includes(s) ||
      st.employeeId?.toLowerCase().includes(s) ||
      st.name?.toLowerCase().includes(s) ||
      st.email?.toLowerCase().includes(s) ||
      st.phone?.toLowerCase().includes(s)
    );
  }
  
  const stats = await getStaffStats(clinicId);
  
  return {
    staff,
    summary: {
      totalStaff: stats.total,
      activeStaff: stats.active,
      receptionists: stats.receptionists,
      assistants: stats.assistants,
      accountants: stats.accountants,
    }
  };
}

export async function getStaffDetails(authUser, staffId) {
  requireAccountType(authUser, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.ADMIN]);
  await connectDB();
  
  const staff = await findStaffById(staffId, authUser.clinicId);
  if (!staff) throw new Error("Staff not found");
  return staff;
}

export async function updateStaff(authUser, staffId, input) {
  requireAccountType(authUser, ACCOUNT_TYPES.CLINIC);
  await connectDB();
  
  const staff = await findStaffById(staffId, authUser.clinicId);
  if (!staff) throw new Error("Staff not found");
  
  const { name, email, phone, employeeId, joiningDate } = input;
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone;
    if (employeeId !== undefined) updateData.employeeId = employeeId;
    if (joiningDate) updateData.joiningDate = new Date(joiningDate);
    
    const updatedStaff = await updateStaffProfile(staffId, authUser.clinicId, updateData, session);
    
    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.accountId,
      action: "staff.updated",
      details: `Updated staff member ${staff.staffCode}`
    }], { session });

    await session.commitTransaction();
    session.endSession();
    
    return updatedStaff;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

export async function updateStaffPermissions(authUser, staffId, permissions) {
  requireAccountType(authUser, ACCOUNT_TYPES.CLINIC);
  await connectDB();
  
  const staff = await findStaffById(staffId, authUser.clinicId);
  if (!staff) throw new Error("Staff not found");
  
  const updatedStaff = await updateStaffProfile(staffId, authUser.clinicId, {
    permissions
  });
  
  await AuditLog.create({
    clinicId: authUser.clinicId,
    userId: authUser.accountId,
    action: "staff.permissions_updated",
    details: `Updated permissions for staff member ${staff.staffCode}`
  });
  
  return updatedStaff;
}

export async function setStaffStatus(authUser, staffId, isActive) {
  requireAccountType(authUser, ACCOUNT_TYPES.CLINIC);
  await connectDB();
  
  const staff = await findStaffById(staffId, authUser.clinicId);
  if (!staff) throw new Error("Staff not found");
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const status = isActive ? "active" : "inactive";
    await updateStaffProfile(staffId, authUser.clinicId, { status }, session);
    
    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.accountId,
      action: isActive ? "staff.activated" : "staff.deactivated",
      details: `${isActive ? "Activated" : "Deactivated"} staff member ${staff.staffCode}`
    }], { session });

    await session.commitTransaction();
    session.endSession();
    
    return status;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
