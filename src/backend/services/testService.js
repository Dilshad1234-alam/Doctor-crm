import mongoose from "mongoose";
import { connectDB } from "../database/connectDB.js";
import { 
  createRecommendedTest,
  findTestById,
  findTestsByConsultation,
  findTestsByPatient,
  updateTestById
} from "../repositories/testRepository.js";
import { generateTestCode } from "../utils/generateTestCode.js";
import AuditLog from "../models/AuditLog.js";
import { canManageTests } from "../utils/permissions.js";

/**
 * Syncs recommended tests from a consultation into RecommendedTest records.
 * Ensures duplicates aren't created for the same test if they already exist.
 */
export async function createTestsFromConsultation(authUser, consultation, session = null) {
  if (!consultation.recommendedTests || consultation.recommendedTests.length === 0) return [];
  
  // Only the doctor who performed the consultation can create/sync tests
  if (!canManageTests(authUser, consultation)) {
    throw new Error("Unauthorized to manage tests for this consultation.");
  }

  const existingTests = await findTestsByConsultation(consultation._id, authUser.clinicId);
  const createdTests = [];

  for (const testItem of consultation.recommendedTests) {
    // Basic deduplication by name (in a real system, you might use a standardized catalog ID)
    const exists = existingTests.find(t => t.name.toLowerCase() === testItem.name.toLowerCase());
    
    if (!exists) {
      const testCode = await generateTestCode(authUser.clinicId, session);
      const newTest = await createRecommendedTest({
        clinicId: authUser.clinicId,
        patientId: consultation.patientId._id || consultation.patientId,
        doctorId: consultation.doctorId._id || consultation.doctorId,
        appointmentId: consultation.appointmentId._id || consultation.appointmentId,
        consultationId: consultation._id,
        testCode,
        name: testItem.name,
        category: testItem.category || "other",
        instructions: testItem.instructions,
        status: "recommended",
        createdByDoctorId: authUser.doctorId
      }, session);

      createdTests.push(newTest);

      await AuditLog.create([{
        clinicId: authUser.clinicId,
        userId: authUser.id || authUser._id,
        action: "test.created",
        entityType: "test",
        entityId: newTest._id,
        details: { testCode, testName: testItem.name, consultationId: consultation._id }
      }], { session });
    }
  }

  return createdTests;
}

export async function getPatientTests(authUser, patientId, query) {
  await connectDB();
  // Role checks logic: assuming clinic owner/doctor/receptionist can view patient tests
  // Covered implicitly by the fact that they are logged in and query is clinic-scoped
  return findTestsByPatient(patientId, authUser.clinicId, query);
}

export async function getConsultationTests(authUser, consultationId) {
  await connectDB();
  return findTestsByConsultation(consultationId, authUser.clinicId);
}

export async function cancelRecommendedTest(authUser, testId) {
  await connectDB();
  const test = await findTestById(testId, authUser.clinicId);
  if (!test) throw new Error("Test not found");

  if (test.doctorId._id?.toString() !== authUser.doctorId?.toString()) {
     throw new Error("Unauthorized: Only the recommending doctor can cancel the test.");
  }

  if (test.status === "report_uploaded" || test.status === "reviewed") {
    throw new Error("Cannot cancel a test that already has a report.");
  }

  const updated = await updateTestById(testId, authUser.clinicId, { status: "cancelled" });

  await AuditLog.create([{
    clinicId: authUser.clinicId,
    userId: authUser.id || authUser._id,
    action: "test.cancelled",
    entityType: "test",
    entityId: test._id,
    details: { testCode: test.testCode }
  }]);

  return updated;
}
