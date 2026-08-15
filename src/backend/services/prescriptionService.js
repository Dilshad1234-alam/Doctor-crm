import mongoose from "mongoose";
import { connectDB } from "../database/connectDB.js";
import { 
  createPrescription,
  findPrescriptionById,
  findPrescriptionByConsultation,
  updatePrescriptionById,
  findPrescriptionsByClinic,
  findPrescriptionsByDoctor,
  findPrescriptionsByPatient
} from "../repositories/prescriptionRepository.js";
import { findConsultationById } from "../repositories/consultationRepository.js";
import { generatePrescriptionCode } from "../utils/generatePrescriptionCode.js";
import AuditLog from "../models/AuditLog.js";
import { 
  canCreatePrescription, 
  canViewPrescription, 
  canEditPrescription, 
  canFinalizePrescription 
} from "../utils/permissions.js";

export async function createOrGetPrescription(authUser, consultationId) {
  await connectDB();

  const consultation = await findConsultationById(consultationId, authUser.clinicId);
  if (!consultation) throw new Error("Consultation not found");

  if (!canCreatePrescription(authUser, consultation)) {
    throw new Error("Unauthorized to create prescription for this consultation.");
  }

  const existingPrescription = await findPrescriptionByConsultation(consultationId, authUser.clinicId);
  if (existingPrescription) {
    return existingPrescription;
  }

  let session = null;
  let prescription = null;

  try {
    // Ensure collections exist to avoid implicit creation inside transaction error
    await mongoose.models.Prescription.createCollection().catch(() => {});
    await mongoose.models.AuditLog.createCollection().catch(() => {});
    await mongoose.models.Counter.createCollection().catch(() => {});

    session = await mongoose.startSession();
    session.startTransaction();

    const prescriptionCode = await generatePrescriptionCode(authUser.clinicId, session);

    prescription = await createPrescription({
      clinicId: authUser.clinicId,
      prescriptionCode,
      consultationId: consultation._id,
      appointmentId: consultation.appointmentId._id || consultation.appointmentId,
      patientId: consultation.patientId._id || consultation.patientId,
      doctorId: consultation.doctorId._id || consultation.doctorId,
      
      // Snapshot recommended tests and followUp
      recommendedTests: consultation.recommendedTests || [],
      followUp: consultation.followUp || null,
      
      status: "draft",
      createdByDoctorId: authUser.doctorId || consultation.doctorId._id || consultation.doctorId
    }, session);

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "prescription.created",
      entityType: "prescription",
      entityId: prescription._id,
      details: { consultationId, prescriptionCode }
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return findPrescriptionById(prescription._id, authUser.clinicId);
}

export async function getPrescription(authUser, prescriptionId) {
  await connectDB();
  const prescription = await findPrescriptionById(prescriptionId, authUser.clinicId);
  if (!prescription) throw new Error("Prescription not found");
  
  if (!canViewPrescription(authUser, prescription)) {
    throw new Error("Unauthorized to view this prescription");
  }
  return prescription;
}

export async function getPrescriptionByConsultation(authUser, consultationId) {
  await connectDB();
  const prescription = await findPrescriptionByConsultation(consultationId, authUser.clinicId);
  
  if (prescription && !canViewPrescription(authUser, prescription)) {
    throw new Error("Unauthorized to view this prescription");
  }
  
  return prescription; // Can be null if it doesn't exist yet
}

export async function updatePrescription(authUser, prescriptionId, input) {
  await connectDB();

  const prescription = await findPrescriptionById(prescriptionId, authUser.clinicId);
  if (!prescription) throw new Error("Prescription not found");

  if (!canEditPrescription(authUser, prescription)) {
    throw new Error("Unauthorized to edit this prescription");
  }

  if (prescription.status !== "draft") {
    throw new Error("Prescription is finalized and cannot be edited.");
  }

  // Ensure fields restricted from body are ignored
  delete input.clinicId;
  delete input.patientId;
  delete input.doctorId;
  delete input.appointmentId;
  delete input.consultationId;
  delete input.prescriptionCode;
  delete input.status;
  delete input.finalizedAt;
  delete input.createdByDoctorId;

  const updated = await updatePrescriptionById(prescriptionId, authUser.clinicId, {
    ...input,
    lastUpdatedByUserId: authUser.id || authUser._id,
  });

  return updated;
}

export async function finalizePrescription(authUser, prescriptionId, input) {
  await connectDB();

  const prescription = await findPrescriptionById(prescriptionId, authUser.clinicId);
  if (!prescription) throw new Error("Prescription not found");

  if (!canFinalizePrescription(authUser, prescription)) {
    throw new Error("Unauthorized to finalize this prescription");
  }

  if (prescription.status !== "draft") {
    throw new Error("Prescription is already finalized or cancelled.");
  }

  let session = null;
  let updatedPrescription = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    delete input.status;
    delete input.finalizedAt;

    updatedPrescription = await updatePrescriptionById(prescriptionId, authUser.clinicId, {
      ...input,
      status: "finalized",
      finalizedAt: new Date(),
      lastUpdatedByUserId: authUser.id || authUser._id,
    }, session);

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "prescription.finalized",
      entityType: "prescription",
      entityId: prescription._id,
      details: { 
        prescriptionCode: prescription.prescriptionCode,
        medicineCount: updatedPrescription.medicines?.length || 0
      }
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }

  return updatedPrescription;
}

export async function getPatientPrescriptions(authUser, patientId, query) {
  await connectDB();
  
  // Basic clinic-wide fetch, filtering logic inside repository
  // To protect sensitive data, only finalized prescriptions should be shown to non-doctors, handled in API logic or here.
  // We'll enforce that the query only returns finalized unless requested by the doctor who owns it.
  if (authUser.role !== "doctor") {
    query.status = "finalized";
  }
  
  return findPrescriptionsByPatient(patientId, authUser.clinicId, query);
}

export async function getMyPrescriptions(authUser, query) {
  await connectDB();
  if (authUser.role !== "doctor") {
    throw new Error("Unauthorized");
  }
  return findPrescriptionsByDoctor(authUser.doctorId, authUser.clinicId, query);
}

export async function getPrescriptions(authUser, query) {
  await connectDB();
  
  if (authUser.role === "patient") {
    query.patientId = authUser.patientId;
    query.status = "finalized";
  } else if (authUser.role === "doctor") {
    // Doctors only see their own prescriptions in the main list
    query.doctorId = authUser.doctorId;
  } else {
    // Non-doctors (like receptionist) only see finalized prescriptions
    query.status = "finalized";
  }
  
  return findPrescriptionsByClinic(authUser.clinicId, query);
}
