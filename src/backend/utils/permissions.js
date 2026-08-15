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

export function hasPermission(user, permissionString) {
  if (!user) return false;
  
  // Clinic Owner inherently has all permissions for their clinic
  if (hasRole(user, ROLES.CLINIC_OWNER)) return true;
  
  // Super Admin inherently has all permissions
  if (hasRole(user, ROLES.SUPER_ADMIN)) return true;

  // Doctors inherently have core patient/medical permissions
  if (hasRole(user, ROLES.DOCTOR)) {
    const doctorPermissions = [
      "patients.view",
      "patients.create",
      "patients.edit",
      "appointments.view",
      "appointments.create",
      "queue.view"
    ];
    if (doctorPermissions.includes(permissionString)) return true;
  }

  // Staff granular permissions
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permissionString);
  }

  return false;
}

export function requirePermission(user, permissionString) {
  if (!hasPermission(user, permissionString)) {
    throw new Error(`Unauthorized: Missing permission '${permissionString}'`);
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

// Appointment Permissions
export function canCreateAppointment(user) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR, "patient"])) return true;
  return hasPermission(user, "appointments.create");
}

export function canViewAppointment(user, appointment) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST])) {
    return user.clinicId?.toString() === appointment.clinicId?.toString();
  }
  if (hasRole(user, ROLES.DOCTOR)) {
    const docId = appointment.doctorId._id || appointment.doctorId;
    return user.doctorId?.toString() === docId.toString();
  }
  return false;
}

export function canRescheduleAppointment(user, appointment) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR])) return canViewAppointment(user, appointment);
  return hasPermission(user, "appointments.reschedule") && canViewAppointment(user, appointment);
}

export function canCancelAppointment(user, appointment) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR])) return canViewAppointment(user, appointment);
  return hasPermission(user, "appointments.cancel") && canViewAppointment(user, appointment);
}

export function canMarkNoShow(user, appointment) {
  return canViewAppointment(user, appointment);
}

// Queue Permissions
export function canCheckInPatient(user, appointment) {
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST, ROLES.DOCTOR]) && 
         canViewAppointment(user, appointment);
}

export function canViewClinicQueue(user) {
  if (hasRole(user, [ROLES.CLINIC_OWNER])) return true;
  return hasPermission(user, "queue.view");
}

export function canViewDoctorQueue(user, doctorId) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST])) return true;
  if (hasRole(user, ROLES.DOCTOR)) return user.doctorId?.toString() === doctorId?.toString();
  return false;
}

export function canCallQueuePatient(user, queueEntry) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST])) return true;
  if (hasRole(user, ROLES.DOCTOR)) {
    return user.doctorId?.toString() === queueEntry.doctorId?._id?.toString() || 
           user.doctorId?.toString() === queueEntry.doctorId?.toString();
  }
  return false;
}

export function canStartQueueConsultation(user, queueEntry) {
  if (hasRole(user, ROLES.CLINIC_OWNER)) return true;
  if (hasRole(user, ROLES.DOCTOR)) {
    return user.doctorId?.toString() === queueEntry.doctorId?._id?.toString() || 
           user.doctorId?.toString() === queueEntry.doctorId?.toString();
  }
  return false;
}

export function canSkipQueuePatient(user, queueEntry) {
  return canCallQueuePatient(user, queueEntry) || hasRole(user, ROLES.CLINIC_OWNER);
}

export function canRemoveQueuePatient(user, queueEntry) {
  if (hasRole(user, [ROLES.CLINIC_OWNER])) return true;
  return hasPermission(user, "queue.manage");
}

// Vitals Permissions
export function canViewVitals(user, appointment) {
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.ASSISTANT]) && 
         canViewAppointment(user, appointment);
}

export function canRecordVitals(user, appointment) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR])) return canViewAppointment(user, appointment);
  return hasPermission(user, "vitals.create") && canViewAppointment(user, appointment);
}

export function canUpdateVitals(user, appointment) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR])) return canViewAppointment(user, appointment);
  return hasPermission(user, "vitals.update") && canViewAppointment(user, appointment);
}

// Consultation Permissions
export function canManageConsultation(user, appointment) {
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR]) && canViewAppointment(user, appointment);
}

export function canViewConsultation(user, appointment = null) {
  if (appointment) {
    return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR]) && canViewAppointment(user, appointment);
  }
  // List view permission
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR]);
}

// Prescription Permissions
export function canCreatePrescription(user, consultation) {
  if (hasRole(user, ROLES.CLINIC_OWNER)) return true;
  return hasRole(user, ROLES.DOCTOR) && user.doctorId?.toString() === consultation.doctorId?._id?.toString();
}

export function canViewPrescription(user, prescription) {
  if (hasRole(user, ROLES.CLINIC_OWNER) && user.clinicId?.toString() === prescription.clinicId?.toString()) {
    return true; // clinic owner can view
  }
  if (hasRole(user, ROLES.RECEPTIONIST) && user.clinicId?.toString() === prescription.clinicId?.toString()) {
    return prescription.status === "finalized"; // receptionist only finalized
  }
  if (hasRole(user, ROLES.DOCTOR)) {
    return user.doctorId?.toString() === prescription.doctorId?._id?.toString() || user.doctorId?.toString() === prescription.doctorId?.toString();
  }
  return false;
}

export function canEditPrescription(user, prescription) {
  if (hasRole(user, ROLES.CLINIC_OWNER) && prescription.status === "draft") return true;
  return hasRole(user, ROLES.DOCTOR) && 
         (user.doctorId?.toString() === prescription.doctorId?._id?.toString() || user.doctorId?.toString() === prescription.doctorId?.toString()) &&
         prescription.status === "draft";
}

export function canFinalizePrescription(user, prescription) {
  return canEditPrescription(user, prescription);
}

export function canPrintPrescription(user, prescription) {
  return canViewPrescription(user, prescription) && prescription.status === "finalized";
}

// Medical Report / Test Permissions
export function canUploadReport(user, patient) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR])) {
    return user.clinicId?.toString() === patient?.clinicId?.toString();
  }
  return hasPermission(user, "medical_reports.upload") && user.clinicId?.toString() === patient?.clinicId?.toString();
}

export function canViewReport(user, report) {
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.ASSISTANT]) &&
         user.clinicId?.toString() === report?.clinicId?.toString();
}

export function canReviewReport(user, report) {
  // Only Doctors can clinically review reports
  // Either they are the assigned doctor (consultation/appointment) or a generic clinic doctor
  // For strictness: limit to any doctor in the same clinic (some clinics allow cross-coverage)
  return hasRole(user, ROLES.DOCTOR) && user.clinicId?.toString() === report?.clinicId?.toString();
}

export function canManageTests(user, consultation) {
  // Usually tests are recommended by the doctor handling the consultation
  return hasRole(user, ROLES.DOCTOR) && user.doctorId?.toString() === consultation.doctorId?._id?.toString();
}

// Billing & Payment Permissions
export function canManageBilling(user, invoice = null) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST])) {
    return invoice ? user.clinicId?.toString() === invoice.clinicId?.toString() : true;
  }
  return false;
}

export function canViewBilling(user, invoice = null) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST])) {
    return invoice ? user.clinicId?.toString() === invoice.clinicId?.toString() : true;
  }
  if (hasRole(user, ROLES.DOCTOR)) {
    // If invoice provided, ensure it belongs to the doctor's appointment
    if (invoice) {
      return user.doctorId?.toString() === invoice.doctorId?.toString() || user.doctorId?.toString() === invoice.doctorId?._id?.toString();
    }
    return true; // List view (filtered in service to only show their own)
  }
  return false;
}

export function canRecordPayment(user, invoice) {
  if (hasRole(user, [ROLES.CLINIC_OWNER])) return user.clinicId?.toString() === invoice.clinicId?.toString();
  return hasPermission(user, "billing.record_payment") && user.clinicId?.toString() === invoice.clinicId?.toString();
}

// Settings Permissions
export function canManageClinicSettings(user) {
  return hasRole(user, ROLES.CLINIC_OWNER);
}

export function canViewClinicSettings(user) {
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.ASSISTANT, ROLES.ACCOUNTANT]);
}

