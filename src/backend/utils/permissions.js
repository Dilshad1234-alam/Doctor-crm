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
