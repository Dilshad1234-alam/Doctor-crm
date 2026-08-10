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

// Appointment Permissions
export function canCreateAppointment(user) {
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST, ROLES.DOCTOR]);
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
  return canViewAppointment(user, appointment);
}

export function canCancelAppointment(user, appointment) {
  return canViewAppointment(user, appointment);
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
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST]);
}

export function canViewDoctorQueue(user, doctorId) {
  if (hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST])) return true;
  if (hasRole(user, ROLES.DOCTOR)) return user.doctorId?.toString() === doctorId?.toString();
  return false;
}

export function canCallQueuePatient(user, queueEntry) {
  if (hasRole(user, ROLES.DOCTOR)) {
    return user.doctorId?.toString() === queueEntry.doctorId?._id?.toString() || 
           user.doctorId?.toString() === queueEntry.doctorId?.toString();
  }
  if (hasRole(user, ROLES.RECEPTIONIST)) return true; // Optionally allow receptionist to call
  return false;
}

export function canStartQueueConsultation(user, queueEntry) {
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
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST]);
}

// Vitals Permissions
export function canViewVitals(user, appointment) {
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.ASSISTANT]) && 
         canViewAppointment(user, appointment);
}

export function canRecordVitals(user, appointment) {
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR, ROLES.ASSISTANT]) && 
         canViewAppointment(user, appointment);
}

export function canUpdateVitals(user, appointment) {
  return canRecordVitals(user, appointment);
}

// Consultation Permissions
export function canManageConsultation(user, appointment) {
  return hasRole(user, ROLES.DOCTOR) && canViewAppointment(user, appointment);
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
  // Clinic Owner, Doctor, Receptionist, Assistant can upload reports if patient is in their clinic
  return hasRole(user, [ROLES.CLINIC_OWNER, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.ASSISTANT]) &&
         user.clinicId?.toString() === patient?.clinicId?.toString();
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
