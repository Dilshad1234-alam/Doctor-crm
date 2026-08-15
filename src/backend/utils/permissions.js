export const ACCOUNT_TYPES = {
  ADMIN: "admin",
  CLINIC: "clinic",
  DOCTOR: "doctor",
  PATIENT: "patient",
};

export function hasAccountType(user, allowedTypes) {
  if (!user || !user.accountType) return false;
  if (!Array.isArray(allowedTypes)) {
    allowedTypes = [allowedTypes];
  }
  return allowedTypes.includes(user.accountType);
}

export function requireAccountType(user, allowedTypes) {
  if (!hasAccountType(user, allowedTypes)) {
    throw new Error("Unauthorized: Insufficient permissions");
  }
  return true;
}

// Admin inherently has all permissions
// Clinic inherently has all permissions for their clinic
// Doctor inherently has core patient/medical permissions
export function hasPermission(user, permissionString) {
  if (!user) return false;
  if (hasAccountType(user, [ACCOUNT_TYPES.ADMIN])) return true;
  if (hasAccountType(user, [ACCOUNT_TYPES.CLINIC])) return true;

  if (hasAccountType(user, [ACCOUNT_TYPES.DOCTOR])) {
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
  return hasAccountType(user, ACCOUNT_TYPES.CLINIC);
}

export function canManageDoctor(user, doctorProfile) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC) && user.clinicId?.toString() === doctorProfile.clinicId?.toString()) {
    return true;
  }
  return false;
}

export function canViewDoctor(user, doctorProfile) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC) && user.clinicId?.toString() === doctorProfile.clinicId?.toString()) {
    return true;
  }
  
  const docId = doctorProfile.doctorId?._id || doctorProfile.doctorId;
  if (hasAccountType(user, ACCOUNT_TYPES.DOCTOR) && user.doctorId?.toString() === docId?.toString()) {
    return true;
  }
  return false;
}

export function canUpdateDoctorAvailability(user, doctorProfile) {
  return canViewDoctor(user, doctorProfile); 
}

export function canManageDoctorSchedule(user, doctorProfile) {
  return canViewDoctor(user, doctorProfile); 
}

// Appointment Permissions
export function canCreateAppointment(user) {
  if (hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR, ACCOUNT_TYPES.PATIENT])) return true;
  return hasPermission(user, "appointments.create");
}

export function canViewAppointment(user, appointment) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) {
    return user.clinicId?.toString() === appointment.clinicId?.toString();
  }
  if (hasAccountType(user, ACCOUNT_TYPES.DOCTOR)) {
    const docId = appointment.doctorId._id || appointment.doctorId;
    return user.doctorId?.toString() === docId.toString();
  }
  if (hasAccountType(user, ACCOUNT_TYPES.PATIENT)) {
    const patId = appointment.patientId._id || appointment.patientId;
    return user.patientId?.toString() === patId.toString();
  }
  return false;
}

export function canRescheduleAppointment(user, appointment) {
  if (hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR])) return canViewAppointment(user, appointment);
  return hasPermission(user, "appointments.reschedule") && canViewAppointment(user, appointment);
}

export function canCancelAppointment(user, appointment) {
  if (hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR])) return canViewAppointment(user, appointment);
  return hasPermission(user, "appointments.cancel") && canViewAppointment(user, appointment);
}

export function canMarkNoShow(user, appointment) {
  return canViewAppointment(user, appointment);
}

// Queue Permissions
export function canCheckInPatient(user, appointment) {
  return hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR]) && 
         canViewAppointment(user, appointment);
}

export function canViewClinicQueue(user) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) return true;
  return hasPermission(user, "queue.view");
}

export function canViewDoctorQueue(user, doctorId) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) return true;
  if (hasAccountType(user, ACCOUNT_TYPES.DOCTOR)) return user.doctorId?.toString() === doctorId?.toString();
  return false;
}

export function canCallQueuePatient(user, queueEntry) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) return true;
  if (hasAccountType(user, ACCOUNT_TYPES.DOCTOR)) {
    return user.doctorId?.toString() === queueEntry.doctorId?._id?.toString() || 
           user.doctorId?.toString() === queueEntry.doctorId?.toString();
  }
  return false;
}

export function canStartQueueConsultation(user, queueEntry) {
  return canCallQueuePatient(user, queueEntry);
}

export function canSkipQueuePatient(user, queueEntry) {
  return canCallQueuePatient(user, queueEntry);
}

export function canRemoveQueuePatient(user, queueEntry) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) return true;
  return hasPermission(user, "queue.manage");
}

// Vitals Permissions
export function canViewVitals(user, appointment) {
  return hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR]) && 
         canViewAppointment(user, appointment);
}

export function canRecordVitals(user, appointment) {
  if (hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR])) return canViewAppointment(user, appointment);
  return hasPermission(user, "vitals.create") && canViewAppointment(user, appointment);
}

export function canUpdateVitals(user, appointment) {
  if (hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR])) return canViewAppointment(user, appointment);
  return hasPermission(user, "vitals.update") && canViewAppointment(user, appointment);
}

// Consultation Permissions
export function canManageConsultation(user, appointment) {
  return hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR]) && canViewAppointment(user, appointment);
}

export function canViewConsultation(user, appointment = null) {
  if (appointment) {
    return (hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR, ACCOUNT_TYPES.PATIENT]) && canViewAppointment(user, appointment));
  }
  return hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR, ACCOUNT_TYPES.PATIENT]);
}

// Prescription Permissions
export function canCreatePrescription(user, consultation) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) return true;
  return hasAccountType(user, ACCOUNT_TYPES.DOCTOR) && user.doctorId?.toString() === consultation.doctorId?._id?.toString();
}

export function canViewPrescription(user, prescription) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC) && user.clinicId?.toString() === prescription.clinicId?.toString()) {
    return true; 
  }
  if (hasAccountType(user, ACCOUNT_TYPES.DOCTOR)) {
    return user.doctorId?.toString() === prescription.doctorId?._id?.toString() || user.doctorId?.toString() === prescription.doctorId?.toString();
  }
  if (hasAccountType(user, ACCOUNT_TYPES.PATIENT)) {
    return user.patientId?.toString() === prescription.patientId?._id?.toString() || user.patientId?.toString() === prescription.patientId?.toString();
  }
  return false;
}

export function canEditPrescription(user, prescription) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC) && prescription.status === "draft") return true;
  return hasAccountType(user, ACCOUNT_TYPES.DOCTOR) && 
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
  if (hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR])) {
    return user.clinicId?.toString() === patient?.clinicId?.toString();
  }
  return hasPermission(user, "medical_reports.upload") && user.clinicId?.toString() === patient?.clinicId?.toString();
}

export function canViewReport(user, report) {
  if (hasAccountType(user, ACCOUNT_TYPES.PATIENT)) {
    return user.patientId?.toString() === report?.patientId?.toString() || user.patientId?.toString() === report?.patientId?._id?.toString();
  }
  return hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR]) &&
         user.clinicId?.toString() === report?.clinicId?.toString();
}

export function canReviewReport(user, report) {
  return hasAccountType(user, ACCOUNT_TYPES.DOCTOR) && user.clinicId?.toString() === report?.clinicId?.toString();
}

export function canManageTests(user, consultation) {
  return hasAccountType(user, ACCOUNT_TYPES.DOCTOR) && user.doctorId?.toString() === consultation.doctorId?._id?.toString();
}

// Billing & Payment Permissions
export function canManageBilling(user, invoice = null) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) {
    return invoice ? user.clinicId?.toString() === invoice.clinicId?.toString() : true;
  }
  return false;
}

export function canViewBilling(user, invoice = null) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) {
    return invoice ? user.clinicId?.toString() === invoice.clinicId?.toString() : true;
  }
  if (hasAccountType(user, ACCOUNT_TYPES.DOCTOR)) {
    if (invoice) {
      return user.doctorId?.toString() === invoice.doctorId?.toString() || user.doctorId?.toString() === invoice.doctorId?._id?.toString();
    }
    return true; 
  }
  if (hasAccountType(user, ACCOUNT_TYPES.PATIENT)) {
    if (invoice) {
      return user.patientId?.toString() === invoice.patientId?.toString() || user.patientId?.toString() === invoice.patientId?._id?.toString();
    }
    return true; 
  }
  return false;
}

export function canRecordPayment(user, invoice) {
  if (hasAccountType(user, ACCOUNT_TYPES.CLINIC)) return user.clinicId?.toString() === invoice.clinicId?.toString();
  return false;
}

// Settings Permissions
export function canManageClinicSettings(user) {
  return hasAccountType(user, ACCOUNT_TYPES.CLINIC);
}

export function canViewClinicSettings(user) {
  return hasAccountType(user, [ACCOUNT_TYPES.CLINIC, ACCOUNT_TYPES.DOCTOR]);
}
