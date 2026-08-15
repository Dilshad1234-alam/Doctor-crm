import RecommendedTest from "../models/RecommendedTest.js";
import "../models/PatientProfile.js";
import "../models/DoctorProfile.js";
import "../models/Appointment.js";
import "../models/Consultation.js";
import "../models/User.js";

export async function createRecommendedTest(data, session = null) {
  const [test] = await RecommendedTest.create([data], session ? { session } : {});
  return test;
}

export async function findTestById(testId, clinicId) {
  return RecommendedTest.findOne({ _id: testId, clinicId })
    .populate("patientId", "firstName lastName fullName patientCode age gender")
    .populate("doctorId", "name email phone")
    .populate("consultationId", "consultationCode");
}

export async function findTestsByConsultation(consultationId, clinicId) {
  return RecommendedTest.find({ consultationId, clinicId })
    .sort({ createdAt: -1 });
}

export async function findTestsByPatient(patientId, clinicId, query = {}) {
  let filter = { patientId, clinicId };

  if (query.status && query.status !== "all") filter.status = query.status;

  return RecommendedTest.find(filter)
    .populate("doctorId", "name email phone")
    .sort({ createdAt: -1 });
}

export async function updateTestById(testId, clinicId, data, session = null) {
  return RecommendedTest.findOneAndUpdate(
    { _id: testId, clinicId },
    { $set: data },
    session ? { session, new: true } : { new: true }
  ).populate("patientId", "firstName lastName fullName")
   .populate("doctorId", "name email phone");
}
