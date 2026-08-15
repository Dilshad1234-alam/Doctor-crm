import mongoose from "mongoose";

const ChiefComplaintSchema = new mongoose.Schema({
  complaint: { type: String, required: true },
  duration: { type: String },
  notes: { type: String }
}, { _id: false });

const SymptomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String },
  severity: { type: String, enum: ["mild", "moderate", "severe", "not_specified"], default: "not_specified" },
  notes: { type: String }
}, { _id: false });

const DiagnosisSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["primary", "secondary", "provisional", "differential"], default: "primary" },
  notes: { type: String }
}, { _id: false });

const RecommendedTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["laboratory", "imaging", "cardiology", "pathology", "other"], default: "laboratory" },
  instructions: { type: String }
}, { _id: false });

const ConsultationSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
  consultationCode: { type: String, required: true },
  
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  
  vitalsId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientVitals" },

  chiefComplaints: [ChiefComplaintSchema],
  symptoms: [SymptomSchema],

  clinicalExamination: {
    general: { type: String },
    cardiovascular: { type: String },
    respiratory: { type: String },
    abdomen: { type: String },
    neurological: { type: String },
    other: { type: String }
  },

  diagnoses: [DiagnosisSchema],
  assessment: { type: String },
  advice: { type: String },
  
  recommendedTests: [RecommendedTestSchema],

  followUp: {
    required: { type: Boolean, default: false },
    date: { type: Date },
    reason: { type: String },
    notes: { type: String }
  },

  privateDoctorNotes: { type: String },

  status: { type: String, enum: ["in_progress", "completed", "cancelled"], default: "in_progress" },

  startedAt: { type: Date },
  completedAt: { type: Date },

  createdById: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByModel: { type: String, enum: ["Admin", "Clinic", "Doctor", "Patient"], required: true },
  lastUpdatedById: { type: mongoose.Schema.Types.ObjectId },
  lastUpdatedByModel: { type: String, enum: ["Admin", "Clinic", "Doctor", "Patient"] }
}, { timestamps: true });

// One Consultation per Appointment
ConsultationSchema.index({ clinicId: 1, appointmentId: 1 }, { unique: true });

export default mongoose.models.Consultation || mongoose.model("Consultation", ConsultationSchema);
