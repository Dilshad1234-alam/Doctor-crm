export const ROLES = {
  SUPER_ADMIN: "super_admin",
  CLINIC_OWNER: "clinic_owner",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  ASSISTANT: "assistant",
  ACCOUNTANT: "accountant",
};

export function hasRole(user, allowedRoles) {
  if (!user || !user.role) return false;
  if (!Array.isArray(allowedRoles)) {
    allowedRoles = [allowedRoles];
  }
  return allowedRoles.includes(user.role);
}

export function requireRole(user, allowedRoles) {
  if (!hasRole(user, allowedRoles)) {
    throw new Error("Unauthorized: Insufficient permissions");
  }
  return true;
}

// Doctor Management Permissions
export function canCreateDoctor(user) {
  return hasRole(user, ROLES.CLINIC_OWNER);
}

export function canManageDoctor(user, doctorProfile) {
  // Clinic Owner can manage doctors in their own clinic
  if (hasRole(user, ROLES.CLINIC_OWNER) && user.clinicId?.toString() === doctorProfile.clinicId?.toString()) {
    return true;
  }
  // No one else can manage another doctor's profile
  return false;
}

export function canViewDoctor(user, doctorProfile) {
  // Clinic Owner can view doctors in their clinic
  if (hasRole(user, ROLES.CLINIC_OWNER) && user.clinicId?.toString() === doctorProfile.clinicId?.toString()) {
    return true;
  }
  // Doctor can view themselves
  if (hasRole(user, ROLES.DOCTOR) && user.doctorId?.toString() === doctorProfile._id?.toString()) {
    return true;
  }
  return false;
}

export function canUpdateDoctorAvailability(user, doctorProfile) {
  return canViewDoctor(user, doctorProfile); // Both owner and the doctor themselves can update availability
}

export function canManageDoctorSchedule(user, doctorProfile) {
  return canViewDoctor(user, doctorProfile); // Both owner and the doctor themselves can manage schedule exceptions
}
