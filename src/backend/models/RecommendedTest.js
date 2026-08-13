import mongoose from "mongoose";

const RecommendedTestSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true, index: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },

  testCode: { type: String, required: true },

  name: { type: String, required: true },
  category: { type: String, enum: ["laboratory", "imaging", "cardiology", "pathology", "other"], default: "other" },
  instructions: { type: String },

  status: { 
    type: String, 
    enum: ["recommended", "pending", "report_uploaded", "reviewed", "cancelled"],
    default: "recommended"
  },

  recommendedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },

  createdByDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true }
}, { timestamps: true });

export default mongoose.models.RecommendedTest || mongoose.model("RecommendedTest", RecommendedTestSchema);
