import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  strength: { type: String },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  customFrequency: { type: String },
  durationValue: { type: Number, required: true },
  durationUnit: { type: String, required: true },
  foodTiming: { type: String, required: true },
  route: { type: String, required: true, default: "oral" },
  instructions: { type: String }
}, { _id: false });

const RecommendedTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  instructions: { type: String }
}, { _id: false });

const FollowUpSchema = new mongoose.Schema({
  required: { type: Boolean, default: false },
  date: { type: Date },
  reason: { type: String }
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
  
  prescriptionCode: { type: String, required: true },

  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true, index: true },

  medicines: [MedicineSchema],

  generalInstructions: { type: String },
  recommendedTests: [RecommendedTestSchema],
  followUp: FollowUpSchema,

  status: { type: String, enum: ["draft", "finalized", "cancelled"], default: "draft" },
  finalizedAt: { type: Date },

  createdByDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
  lastUpdatedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// One Prescription per Consultation
PrescriptionSchema.index({ clinicId: 1, consultationId: 1 }, { unique: true });

export default mongoose.models.Prescription || mongoose.model("Prescription", PrescriptionSchema);
