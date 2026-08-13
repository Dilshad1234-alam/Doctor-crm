import mongoose from "mongoose";

const MedicalReportSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile" }, // Doctor who ordered it
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
  recommendedTestId: { type: mongoose.Schema.Types.ObjectId, ref: "RecommendedTest" },

  reportCode: { type: String, required: true },

  title: { type: String, required: true },
  reportType: { 
    type: String, 
    enum: ["blood_test", "xray", "mri", "ct_scan", "ultrasound", "ecg", "pathology", "prescription", "other"],
    required: true 
  },

  reportDate: { type: Date, required: true },

  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true }, // in bytes

  notes: { type: String },

  uploadedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadedAt: { type: Date, default: Date.now },

  reviewStatus: { type: String, enum: ["pending_review", "reviewed"], default: "pending_review" },

  reviewedByDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile" },
  reviewedAt: { type: Date },
  doctorReviewNotes: { type: String }
}, { timestamps: true });

export default mongoose.models.MedicalReport || mongoose.model("MedicalReport", MedicalReportSchema);
