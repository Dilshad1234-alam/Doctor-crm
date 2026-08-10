import mongoose from "mongoose";
import { connectDB } from "../database/connectDB.js";
import { 
  createReport,
  findReportById,
  findReportsByPatient,
  updateReportById
} from "../repositories/reportRepository.js";
import { findTestById, updateTestById } from "../repositories/testRepository.js";
import { getPatientById } from "../repositories/patientRepository.js";
import { generateReportCode } from "../utils/generateReportCode.js";
import { canUploadReport, canViewReport, canReviewReport } from "../utils/permissions.js";
import AuditLog from "../models/AuditLog.js";
import { uploadMedicalReport, deleteMedicalReport } from "./fileStorageService.js";

export async function uploadReport(authUser, patientId, input, file) {
  await connectDB();
  
  const patient = await getPatientById(patientId, authUser.clinicId);
  if (!patient) throw new Error("Patient not found");

  if (!canUploadReport(authUser, patient)) {
    throw new Error("Unauthorized to upload report for this patient");
  }

  const session = await mongoose.startSession();
  let createdReport = null;
  let fileUrl = null;
  let savedFileMetadata = {};

  try {
    session.startTransaction();

    // 1. Upload to storage provider
    fileUrl = await uploadMedicalReport(file);
    savedFileMetadata = {
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    };

    // 2. Validate linked test if provided
    let testData = null;
    if (input.recommendedTestId) {
      testData = await findTestById(input.recommendedTestId, authUser.clinicId);
      if (!testData || testData.patientId._id.toString() !== patientId.toString()) {
        throw new Error("Invalid Recommended Test ID");
      }
    }

    // 3. Generate code & create report
    const reportCode = await generateReportCode(authUser.clinicId, session);
    const reportPayload = {
      clinicId: authUser.clinicId,
      patientId: patient._id,
      reportCode,
      title: input.title,
      reportType: input.reportType,
      reportDate: new Date(input.reportDate),
      ...savedFileMetadata,
      notes: input.notes,
      uploadedByUserId: authUser.id || authUser._id,
      
      doctorId: testData ? testData.doctorId._id : undefined,
      appointmentId: testData ? testData.appointmentId : undefined,
      consultationId: testData ? testData.consultationId : undefined,
      recommendedTestId: testData ? testData._id : undefined
    };

    createdReport = await createReport(reportPayload, session);

    // 4. Update linked test status
    if (testData) {
      await updateTestById(testData._id, authUser.clinicId, {
        status: "report_uploaded",
        completedAt: new Date()
      }, session);
    }

    // 5. Audit Log
    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "report.uploaded",
      entityType: "report",
      entityId: createdReport._id,
      details: { reportCode, title: input.title, patientId }
    }], { session });

    await session.commitTransaction();
    return findReportById(createdReport._id, authUser.clinicId); // Return populated
  } catch (error) {
    await session.abortTransaction();
    // Rollback file upload if database fails
    if (fileUrl) {
      await deleteMedicalReport(fileUrl);
    }
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getReport(authUser, reportId) {
  await connectDB();
  const report = await findReportById(reportId, authUser.clinicId);
  if (!report) throw new Error("Report not found");

  if (!canViewReport(authUser, report)) {
    throw new Error("Unauthorized to view this report");
  }

  return report;
}

export async function getPatientReports(authUser, patientId, query) {
  await connectDB();
  const patient = await getPatientById(patientId, authUser.clinicId);
  if (!patient) throw new Error("Patient not found");

  if (!canViewReport(authUser, patient)) {
    throw new Error("Unauthorized to view reports for this patient");
  }

  return findReportsByPatient(patientId, authUser.clinicId, query);
}

export async function reviewReport(authUser, reportId, input) {
  await connectDB();
  const report = await findReportById(reportId, authUser.clinicId);
  if (!report) throw new Error("Report not found");

  if (!canReviewReport(authUser, report)) {
    throw new Error("Unauthorized: Only authorized doctors can review reports.");
  }
  
  if (report.reviewStatus === "reviewed") {
    throw new Error("Report is already reviewed");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const updated = await updateReportById(report._id, authUser.clinicId, {
      reviewStatus: "reviewed",
      reviewedByDoctorId: authUser.doctorId,
      reviewedAt: new Date(),
      doctorReviewNotes: input.doctorReviewNotes
    }, session);

    // Link update test if exists
    if (report.recommendedTestId) {
      await updateTestById(report.recommendedTestId._id, authUser.clinicId, {
        status: "reviewed"
      }, session);
    }

    await AuditLog.create([{
      clinicId: authUser.clinicId,
      userId: authUser.id || authUser._id,
      action: "report.reviewed",
      entityType: "report",
      entityId: report._id,
      details: { reportCode: report.reportCode, patientId: report.patientId._id }
    }], { session });

    await session.commitTransaction();
    return findReportById(updated._id, authUser.clinicId);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function updateReport(authUser, reportId, input) {
  await connectDB();
  const report = await findReportById(reportId, authUser.clinicId);
  if (!report) throw new Error("Report not found");

  if (!canUploadReport(authUser, report.patientId)) {
    throw new Error("Unauthorized to update this report");
  }
  
  if (report.reviewStatus === "reviewed") {
    throw new Error("Cannot modify a reviewed report");
  }

  const updated = await updateReportById(report._id, authUser.clinicId, input);

  await AuditLog.create([{
    clinicId: authUser.clinicId,
    userId: authUser.id || authUser._id,
    action: "report.updated",
    entityType: "report",
    entityId: report._id,
    details: { reportCode: report.reportCode }
  }]);

  return findReportById(updated._id, authUser.clinicId);
}
