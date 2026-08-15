import MedicalReport from "../models/MedicalReport.js";
import "../models/PatientProfile.js";
import "../models/DoctorProfile.js";
import "../models/Appointment.js";
import "../models/Consultation.js";
import "../models/RecommendedTest.js";
import "../models/User.js";

export async function createReport(data, session = null) {
  const [report] = await MedicalReport.create([data], session ? { session } : {});
  return report;
}

export async function findReportById(reportId, clinicId) {
  return MedicalReport.findOne({ _id: reportId, clinicId })
    .populate("patientId", "firstName lastName fullName patientCode age gender phone")
    .populate("doctorId", "name email phone")
    .populate("recommendedTestId", "testCode name status category")
    .populate("uploadedById", "name role")
    .populate("reviewedByDoctorId", "name email phone");
}

export async function findReportsByClinic(clinicId, query = {}) {
  let filter = { clinicId };

  if (query.doctorId) filter.doctorId = query.doctorId;
  if (query.patientId) filter.patientId = query.patientId;
  if (query.reportType) filter.reportType = query.reportType;
  if (query.reviewStatus && query.reviewStatus !== "all") filter.reviewStatus = query.reviewStatus;

  if (query.search) {
     filter.$or = [
       { reportCode: { $regex: query.search, $options: "i" } },
       { title: { $regex: query.search, $options: "i" } }
     ];
  }

  if (query.dateFrom || query.dateTo) {
    filter.reportDate = {};
    if (query.dateFrom) filter.reportDate.$gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const endTo = new Date(query.dateTo);
      endTo.setHours(23, 59, 59, 999);
      filter.reportDate.$lte = endTo;
    }
  }

  return MedicalReport.find(filter)
    .populate("patientId", "firstName lastName fullName patientCode")
    .populate("doctorId", "name email phone")
    .populate("recommendedTestId", "name status")
    .populate("uploadedById", "name role")
    .sort({ uploadedAt: -1 });
}

export async function findReportsByDoctor(doctorId, clinicId, query = {}) {
  return findReportsByClinic(clinicId, { ...query, doctorId });
}

export async function findReportsByPatient(patientId, clinicId, query = {}) {
  return findReportsByClinic(clinicId, { ...query, patientId });
}

export async function updateReportById(reportId, clinicId, data, session = null) {
  return MedicalReport.findOneAndUpdate(
    { _id: reportId, clinicId },
    { $set: data },
    session ? { session, new: true } : { new: true }
  ).populate("patientId", "firstName lastName fullName patientCode");
}

export async function countReportsByPatient(patientId, clinicId) {
  return MedicalReport.countDocuments({ patientId, clinicId });
}
