import mongoose from "mongoose";
import { findUserByEmail, createUser, updateUserById } from "@/backend/repositories/userRepository";
import { createStaffProfile, findStaffById, updateStaffProfile, getStaffList as repoGetStaffList, getStaffStats, generateStaffCode } from "@/backend/repositories/staffRepository";
import { requireRole, ROLES } from "@/backend/utils/permissions";
import { hashPassword } from "@/backend/utils/auth";
import { DEFAULT_ROLE_PERMISSIONS } from "@/backend/config/rolePermissions";
import AuditLog from "@/backend/models/AuditLog";

export async function createStaff(authUser, input) {
  requireRole(authUser, ROLES.CLINIC_OWNER);
  
  const { name, email, phone, role, employeeId, joiningDate, password } = input;
  
  if (!["receptionist", "assistant", "accountant"].includes(role)) {
    throw new Error("Invalid staff role");
  }
  
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await hashPassword(password);
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Create User
    const newUser = await createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      clinicId: authUser.clinicId,
      isActive: true,
    }, session);
    
    // 2. Generate Staff Code
    const staffCode = await generateStaffCode(authUser.clinicId, session);
    
    // 3. Get Default Permissions
    const permissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
    
    // 4. Create StaffProfile
    const staffProfile = await createStaffProfile({
      clinicId: authUser.clinicId,
      userId: newUser._id,
      staffCode,
      role,
      phone,
      employeeId,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      permissions,
      status: "active",
      createdByUserId: authUser.id
    }, session);
    
    // 5. Update User with staffId
    await updateUserById(newUser._id, { staffId: staffProfile._id }, session);
    
    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id,
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
  requireRole(authUser, ROLES.CLINIC_OWNER);
  
  const clinicId = authUser.clinicId;
  
  // Since our repo getStaffList doesn't do a full user-text search yet, we will fetch and filter in memory if needed
  // For production with large sets, this should be an aggregate lookup, but keeping it simple for now.
  let staff = await repoGetStaffList(clinicId, query);
  
  if (query.search) {
    const s = query.search.toLowerCase();
    staff = staff.filter(st => 
      st.staffCode.toLowerCase().includes(s) ||
      st.employeeId?.toLowerCase().includes(s) ||
      st.userId?.name?.toLowerCase().includes(s) ||
      st.userId?.email?.toLowerCase().includes(s) ||
      st.phone?.toLowerCase().includes(s) ||
      st.userId?.phone?.toLowerCase().includes(s)
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
  requireRole(authUser, ROLES.CLINIC_OWNER);
  const staff = await findStaffById(staffId, authUser.clinicId);
  if (!staff) throw new Error("Staff not found");
  return staff;
}

export async function updateStaff(authUser, staffId, input) {
  requireRole(authUser, ROLES.CLINIC_OWNER);
  const staff = await findStaffById(staffId, authUser.clinicId);
  if (!staff) throw new Error("Staff not found");
  
  const { name, phone, employeeId, joiningDate } = input;
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    if (name || phone) {
      const userUpdate = {};
      if (name) userUpdate.name = name;
      if (phone) userUpdate.phone = phone;
      await updateUserById(staff.userId._id, userUpdate, session);
    }
    
    const updatedStaff = await updateStaffProfile(staffId, authUser.clinicId, {
      phone: phone || staff.phone,
      employeeId: employeeId !== undefined ? employeeId : staff.employeeId,
      joiningDate: joiningDate ? new Date(joiningDate) : staff.joiningDate
    }, session);
    
    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id,
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
  requireRole(authUser, ROLES.CLINIC_OWNER);
  const staff = await findStaffById(staffId, authUser.clinicId);
  if (!staff) throw new Error("Staff not found");
  
  const updatedStaff = await updateStaffProfile(staffId, authUser.clinicId, {
    permissions
  });
  
  await AuditLog.create({
    clinicId: authUser.clinicId,
    userId: authUser.id,
    action: "staff.permissions_updated",
    details: `Updated permissions for staff member ${staff.staffCode}`
  });
  
  return updatedStaff;
}

export async function setStaffStatus(authUser, staffId, isActive) {
  requireRole(authUser, ROLES.CLINIC_OWNER);
  const staff = await findStaffById(staffId, authUser.clinicId);
  if (!staff) throw new Error("Staff not found");
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const status = isActive ? "active" : "inactive";
    await updateStaffProfile(staffId, authUser.clinicId, { status }, session);
    await updateUserById(staff.userId._id, { isActive }, session);
    
    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id,
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
