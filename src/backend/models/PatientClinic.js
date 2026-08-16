import mongoose from "mongoose";

const patientClinicSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    firstVisitAt: {
      type: Date,
      default: Date.now,
    },
    lastVisitAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a patient can only be linked to a specific clinic once
patientClinicSchema.index({ patientId: 1, clinicId: 1 }, { unique: true });

export default mongoose.models.PatientClinic || mongoose.model("PatientClinic", patientClinicSchema);
