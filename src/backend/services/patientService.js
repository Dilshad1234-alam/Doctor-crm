import { createPatient, findPatientsByClinic, findPatientById, updatePatientById, findPatientsByDoctor } from "../repositories/patientRepository.js";
import { checkDuplicatePatient } from "./patientDuplicateService.js";
import { logPatientHistoryEvent, detectMedicalProfileChanges } from "./patientHistoryService.js";
import { generatePatientCode } from "../utils/generatePatientCode.js";
import { calculateAge } from "../utils/calculateAge.js";

const MEDICAL_FIELDS = [
  "allergies",
  "chronicConditions",
  "currentMedicines",
  "pastMedicalHistory",
  "familyMedicalHistory",
  "notes",
  "habits",
  "insurance"
];

function generateFullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function filterAllowedFields(input, accountType) {
  const data = { ...input };
  if (accountType === "receptionist" || accountType === "assistant") {
    // Receptionist/assistant cannot modify restricted medical fields
    MEDICAL_FIELDS.forEach(field => {
      delete data[field];
    });
  }
  return data;
}

export async function createPatientForClinic(authUser, input) {
  const { clinicId, id: userId, accountType } = authUser;

  // Filter based on role
  const safeInput = filterAllowedFields(input, accountType);

  const duplicateCheck = await checkDuplicatePatient(clinicId, safeInput);
  if (duplicateCheck.isDuplicate) {
    const err = new Error(duplicateCheck.message);
    err.code = "PATIENT_DUPLICATE";
    err.status = 409;
    err.existingPatient = duplicateCheck.existingPatient;
    throw err;
  }

  const patientCode = await generatePatientCode(clinicId);
  const fullName = generateFullName(safeInput.firstName, safeInput.lastName);
  
  let age = safeInput.age;
  if (safeInput.dateOfBirth) {
    const calcAge = calculateAge(safeInput.dateOfBirth);
    if (calcAge !== null) {
      age = calcAge;
    }
  }

  const patientData = {
    ...safeInput,
    clinicId,
    patientCode,
    fullName,
    age,
    createdByUserId: userId,
    isActive: true
  };

  const patient = await createPatient(patientData);

  // History Event
  await logPatientHistoryEvent({
    clinicId,
    patientId: patient._id,
    type: "patient_created",
    title: "Patient Created",
    description: "Patient profile was created.",
    userId
  });

  return patient;
}

export async function updatePatientForClinic(authUser, patientId, input) {
  const { clinicId, id: userId, accountType } = authUser;

  const existingPatient = await findPatientById(patientId, clinicId);
  if (!existingPatient) {
    const err = new Error("Patient not found");
    err.status = 404;
    throw err;
  }

  const safeInput = filterAllowedFields(input, accountType);

  const duplicateCheck = await checkDuplicatePatient(clinicId, { ...safeInput, excludeId: patientId });
  if (duplicateCheck.isDuplicate) {
    const err = new Error(duplicateCheck.message);
    err.code = "PATIENT_DUPLICATE";
    err.status = 409;
    err.existingPatient = duplicateCheck.existingPatient;
    throw err;
  }

  if (safeInput.firstName !== undefined || safeInput.lastName !== undefined) {
    const first = safeInput.firstName !== undefined ? safeInput.firstName : existingPatient.firstName;
    const last = safeInput.lastName !== undefined ? safeInput.lastName : existingPatient.lastName;
    safeInput.fullName = generateFullName(first, last);
  }

  if (safeInput.dateOfBirth !== undefined) {
    const calcAge = calculateAge(safeInput.dateOfBirth);
    if (calcAge !== null) safeInput.age = calcAge;
  } else if (safeInput.age !== undefined) {
     // age provided explicitly
  }

  safeInput.lastUpdatedByUserId = userId;

  // Detect history changes
  const historyEvents = detectMedicalProfileChanges(existingPatient, safeInput);

  const updatedPatient = await updatePatientById(patientId, clinicId, safeInput);

  // Log all detected medical events
  for (const event of historyEvents) {
    await logPatientHistoryEvent({
      clinicId,
      patientId,
      ...event,
      userId
    });
  }

  if (historyEvents.length === 0 && Object.keys(safeInput).length > 0) {
     await logPatientHistoryEvent({
      clinicId,
      patientId,
      type: "profile_updated",
      title: "Profile Updated",
      description: "Patient demographic or contact information was updated.",
      userId
    });
  }

  return updatedPatient;
}

export async function getPatientsForClinic(authUser, query) {
  return findPatientsByClinic(authUser.clinicId, query);
}

export async function getPatientsForDoctor(authUser, query) {
  return findPatientsByDoctor(authUser.clinicId, authUser.doctorId, query);
}

export async function getPatientDetails(authUser, patientId) {
  const patient = await findPatientById(patientId, authUser.clinicId);
  if (!patient) {
    const err = new Error("Patient not found");
    err.status = 404;
    throw err;
  }
  return patient;
}

export async function searchPatientsForClinic(authUser, search) {
  if (!search || search.length < 2) return [];
  const { patients } = await findPatientsByClinic(authUser.clinicId, { search, page: 1, limit: 10 });
  return patients.map(p => ({
    id: p._id,
    patientCode: p.patientCode,
    fullName: p.fullName,
    phone: p.phone,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup
  }));
}

export async function getPatientSummary(authUser, patientId) {
  const patient = await getPatientDetails(authUser, patientId);
  return {
    patient,
    metrics: {
      totalVisits: null,
      totalPrescriptions: null,
      pendingPayments: null,
      nextAppointment: null
    }
  };
}
